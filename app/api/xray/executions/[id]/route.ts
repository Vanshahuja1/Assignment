import { type NextRequest, NextResponse } from "next/server"
import { getExecutionsCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const collection = await getExecutionsCollection()

    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch {
      return NextResponse.json({ error: "Invalid execution ID" }, { status: 400 })
    }

    const execution = await collection.findOne({ _id: objectId })

    if (!execution) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...execution,
      _id: execution._id.toString(),
    })
  } catch (error) {
    console.error("Failed to fetch execution:", error)
    return NextResponse.json({ error: "Failed to fetch execution" }, { status: 500 })
  }
}
