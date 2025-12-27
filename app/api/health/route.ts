import { type NextRequest, NextResponse } from "next/server"
import { getExecutionsCollection } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const collection = await getExecutionsCollection()
    const count = await collection.countDocuments()

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      executionsCount: count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
