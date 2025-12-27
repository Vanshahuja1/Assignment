"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ExecutionHeader } from "@/components/execution-header"
import { StepDetail } from "@/components/step-detail"

interface XRayDecision {
  outcome: "pass" | "fail" | "select" | "filter" | "evaluate"
  reason: string
  confidence?: number
}

interface XRayStep {
  index: number
  step: string
  timestamp: number
  input: Record<string, any>
  output: Record<string, any>
  reasoning: string
  decision?: XRayDecision
  metadata?: Record<string, any>
}

interface ExecutionSummary {
  totalSteps: number
  finalOutcome?: string
}

interface Execution {
  _id: string
  executionId: string
  name: string
  status: string
  steps: XRayStep[]
  createdAt: number
  completedAt?: number
  duration?: number
  summary?: ExecutionSummary
}

export default function ExecutionDetail({ params }: { params: Promise<{ id: string }> }) {
  const [execution, setExecution] = useState<Execution | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string>("")

  useEffect(() => {
    const unwrapParams = async () => {
      const { id } = await params
      setId(id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (id) {
      fetchExecution()
    }
  }, [id])

  async function fetchExecution() {
    try {
      const response = await fetch(`/api/xray/executions/${id}`)
      const data = await response.json()
      setExecution(data)
    } catch (error) {
      console.error("Failed to fetch execution:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading execution...</div>
  }

  if (!execution) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Execution not found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <ExecutionHeader
          name={execution.name}
          executionId={execution.executionId}
          status={execution.status}
          createdAt={execution.createdAt}
          completedAt={execution.completedAt}
          duration={execution.duration}
          finalOutcome={execution.summary?.finalOutcome}
        />

        {/* Steps Timeline */}
        <div className="space-y-4">
          {execution.steps.map((step) => (
            <StepDetail key={step.index} step={step} />
          ))}
        </div>

        {/* Summary */}
        <Card className="bg-card border-border mt-12">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Steps</p>
                  <p className="text-2xl font-bold">{execution.summary?.totalSteps || execution.steps.length}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Final Outcome</p>
                <p className="text-sm leading-relaxed text-foreground">
                  {execution.summary?.finalOutcome || "No final outcome recorded"}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-2xl font-bold capitalize">{execution.status}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="text-2xl font-bold">{execution.duration || 0}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
