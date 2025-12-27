// Mock data for the competitor selection demo

export const mockProducts = [
  { asin: "B001", title: "HydroFlask 32oz Wide Mouth", price: 44.99, rating: 4.5, reviews: 8932 },
  { asin: "B002", title: "Yeti Rambler 26oz", price: 34.99, rating: 4.4, reviews: 5621 },
  { asin: "B003", title: "Generic Water Bottle", price: 8.99, rating: 3.2, reviews: 45 },
  { asin: "B004", title: "Stanley Adventure Quencher", price: 35.0, rating: 4.3, reviews: 4102 },
  { asin: "B005", title: "YETI Rambler 32oz", price: 39.99, rating: 4.6, reviews: 12021 },
  { asin: "B006", title: "Premium Titanium Bottle", price: 89.0, rating: 4.8, reviews: 234 },
  { asin: "B007", title: "Simple Modern Summit", price: 32.0, rating: 4.4, reviews: 3421 },
  { asin: "B008", title: "Bottle Cleaning Brush Set", price: 12.99, rating: 4.6, reviews: 3421 },
]

export const referenceProduct = {
  asin: "B0XYZ123",
  title: "Stainless Steel Water Bottle 32oz Insulated",
  category: "Sports & Outdoors",
  price: 29.99,
  rating: 4.2,
  reviews: 1247,
}

export function generateKeywords(title: string): string[] {
  const words = title.toLowerCase().split(" ")
  return [
    [words[0], words[1], "bottle"].filter(Boolean).join(" "),
    ["insulated", "water bottle", words[2]].filter(Boolean).join(" "),
  ]
}

export function simulateSearch(): typeof mockProducts {
  return mockProducts
}
