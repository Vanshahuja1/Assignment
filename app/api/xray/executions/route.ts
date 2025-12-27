import { type NextRequest, NextResponse } from "next/server"
import { getExecutionsCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const collection = await getExecutionsCollection()

    const execution = {
      ...body,
      _id: new ObjectId(),
      createdAt: body.createdAt || Date.now(),
    }

    const result = await collection.insertOne(execution)

    return NextResponse.json(
      {
        _id: result.insertedId.toString(),
        ...execution,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to save execution:", error)
    return NextResponse.json({ error: "Failed to save execution" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const collection = await getExecutionsCollection()
    const executions = await collection.find({}).sort({ createdAt: -1 }).limit(50).toArray()

    return NextResponse.json(
      executions.map((e) => ({
        ...e,
        _id: e._id.toString(),
      })),
    )
  } catch (error) {
    console.error("Failed to fetch executions:", error)
    return NextResponse.json({ error: "Failed to fetch executions" }, { status: 500 })
  }
}
