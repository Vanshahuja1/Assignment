import { type NextRequest, NextResponse } from "next/server"
import { createXRay } from "@/lib/xray"
import { referenceProduct, generateKeywords, simulateSearch } from "@/lib/mock-data"
import { getExecutionsCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const xray = createXRay("Competitor Product Selection Demo")

    const keywords = generateKeywords(referenceProduct.title)
    xray.recordStep(
      "keyword_generation",
      {
        product_title: referenceProduct.title,
        category: referenceProduct.category,
      },
      {
        keywords,
        model: "gpt-4-mock",
      },
      "Extracted key product attributes: material (stainless steel), capacity (32oz), feature (insulated). Generated 2 keyword variations for search optimization.",
    )

    const searchResults = simulateSearch()
    xray.recordStep(
      "candidate_search",
      {
        keyword: keywords[0],
        limit: 50,
      },
      {
        total_results: 2847,
        candidates_fetched: searchResults.length,
        candidates: searchResults,
      },
      `Fetched top ${searchResults.length} results by relevance; 2847 total matches found in product catalog.`,
    )

    const priceMin = referenceProduct.price * 0.5
    const priceMax = referenceProduct.price * 2
    const minRating = 3.8
    const minReviews = 100

    const evaluations = searchResults.map((product: any) => {
      const priceInRange = product.price >= priceMin && product.price <= priceMax
      const ratingOk = product.rating >= minRating
      const reviewsOk = product.reviews >= minReviews
      const qualified = priceInRange && ratingOk && reviewsOk

      return {
        asin: product.asin,
        title: product.title,
        metrics: { price: product.price, rating: product.rating, reviews: product.reviews },
        filter_results: {
          price_range: {
            passed: priceInRange,
            detail: priceInRange
              ? `$${product.price} is within $${priceMin.toFixed(2)}-$${priceMax.toFixed(2)}`
              : `$${product.price} is ${product.price < priceMin ? "below" : "above"} range`,
          },
          min_rating: {
            passed: ratingOk,
            detail: ratingOk ? `${product.rating} >= ${minRating}` : `${product.rating} < ${minRating}`,
          },
          min_reviews: {
            passed: reviewsOk,
            detail: reviewsOk ? `${product.reviews} >= ${minReviews}` : `${product.reviews} < ${minReviews}`,
          },
        },
        qualified,
      }
    })

    const qualified = evaluations.filter((e: any) => e.qualified)

    xray.recordStep(
      "apply_filters",
      {
        candidates_count: searchResults.length,
        reference_product: referenceProduct,
        filters: {
          price_range: `$${priceMin.toFixed(2)}-$${priceMax.toFixed(2)}`,
          min_rating: minRating,
          min_reviews: minReviews,
        },
      },
      {
        total_evaluated: evaluations.length,
        passed: qualified.length,
        failed: evaluations.length - qualified.length,
      },
      `Applied price ($${priceMin.toFixed(2)}-$${priceMax.toFixed(2)}), rating (${minRating}+), and review count (${minReviews}+) filters. Narrowed candidates from ${evaluations.length} to ${qualified.length}.`,
      {
        outcome: "filter",
        reason: `${qualified.length} candidates passed all filter criteria`,
        confidence: 1.0,
      },
      { evaluations },
    )

    const llmEvaluations = qualified.map((candidate: any) => ({
      asin: candidate.asin,
      title: candidate.title,
      is_competitor: !candidate.title.includes("Brush") && !candidate.title.includes("Set"),
      confidence: Math.random() * 0.1 + 0.9,
    }))

    const confirmedCompetitors = llmEvaluations.filter((e: any) => e.is_competitor)

    xray.recordEvaluationStep({
      step: "llm_relevance_evaluation",
      input: {
        candidates_count: qualified.length,
        reference_product: {
          asin: referenceProduct.asin,
          title: referenceProduct.title,
          category: referenceProduct.category,
        },
        model: "gpt-4-mock",
      },
      evaluations: llmEvaluations,
      output: {
        total_evaluated: llmEvaluations.length,
        confirmed_competitors: confirmedCompetitors.length,
        false_positives_removed: llmEvaluations.length - confirmedCompetitors.length,
      },
      reasoning: `LLM identified and removed ${llmEvaluations.length - confirmedCompetitors.length} false positives (accessories and replacement parts).`,
      confidence: 0.95,
    })

    const ranked = confirmedCompetitors
      .map((comp: any) => {
        const fullProduct = searchResults.find((p: any) => p.asin === comp.asin)
        const reviewScore = Math.min(fullProduct.reviews / 10000, 1)
        const ratingScore = (fullProduct.rating - 3.5) / 1.5
        const priceProximity = 1 - Math.abs(fullProduct.price - referenceProduct.price) / (priceMax - priceMin)
        const totalScore = reviewScore * 0.6 + ratingScore * 0.25 + priceProximity * 0.15

        return {
          rank: 0,
          asin: comp.asin,
          title: comp.title,
          metrics: { price: fullProduct.price, rating: fullProduct.rating, reviews: fullProduct.reviews },
          score_breakdown: {
            review_count_score: reviewScore,
            rating_score: ratingScore,
            price_proximity_score: priceProximity,
          },
          total_score: Math.max(0, Math.min(1, totalScore)),
        }
      })
      .sort((a: any, b: any) => b.total_score - a.total_score)
      .map((comp: any, i: number) => ({ ...comp, rank: i + 1 }))

    const selected = ranked[0]

    xray.recordStep(
      "rank_and_select",
      {
        candidates_count: confirmedCompetitors.length,
        reference_product: referenceProduct,
        ranking_weights: {
          review_count_score: "60%",
          rating_score: "25%",
          price_proximity_score: "15%",
        },
      },
      {
        selected_competitor: {
          asin: selected.asin,
          title: selected.title,
          price: selected.metrics.price,
          rating: selected.metrics.rating,
          reviews: selected.metrics.reviews,
        },
      },
      `Ranked ${confirmedCompetitors.length} competitors using review count (60% weight), rating (25% weight), and price proximity (15% weight). Selected ${selected.title} with score ${selected.total_score.toFixed(2)}.`,
      {
        outcome: "select",
        reason: `Selected top-ranked competitor with highest composite score`,
        confidence: selected.total_score,
      },
      { ranked_candidates: ranked.slice(0, 3) },
    )

    xray.markComplete(`Selected ${selected.title} as top competitor`)
    const execution = xray.serialize()

    // Save to MongoDB
    const collection = await getExecutionsCollection()
    const doc = {
      ...execution,
      _id: new ObjectId(),
      createdAt: execution.createdAt || Date.now(),
    }

    const result = await collection.insertOne(doc)

    return NextResponse.json(
      {
        _id: result.insertedId.toString(),
        ...execution,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Demo execution error:", error)
    return NextResponse.json({ error: "Failed to run demo" }, { status: 500 })
  }
}
