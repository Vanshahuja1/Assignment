// X-Ray Library - Core SDK for capturing multi-step decision processes

export interface XRayDecision {
  outcome: "pass" | "fail" | "select" | "filter" | "evaluate"
  reason: string
  confidence?: number
}

export interface XRayEvaluation {
  id?: string
  passed: boolean
  reason: string
  metadata?: Record<string, any>
}

export interface XRayStep {
  index: number
  step: string
  timestamp: number
  input: Record<string, any>
  output: Record<string, any>
  reasoning: string
  decision?: XRayDecision
  metadata?: Record<string, any>
}

export interface ExecutionSummary {
  totalSteps: number
  finalOutcome?: string
}

export interface XRayExecution {
  _id?: string
  executionId: string
  name: string
  status: "completed" | "failed" | "in_progress"
  steps: XRayStep[]
  createdAt: number
  completedAt?: number
  duration?: number
  summary?: ExecutionSummary
}

export class XRay {
  private execution: XRayExecution

  constructor(name: string, executionId?: string) {
    this.execution = {
      executionId: executionId || `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      status: "in_progress",
      steps: [],
      createdAt: Date.now(),
    }
  }

  recordStep(
    stepName: string,
    input: Record<string, any>,
    output: Record<string, any>,
    reasoning: string,
    decision?: XRayDecision,
    metadata?: Record<string, any>,
  ): void {
    const step: XRayStep = {
      index: this.execution.steps.length + 1,
      step: stepName,
      timestamp: Date.now(),
      input,
      output,
      reasoning,
      decision,
      metadata,
    }
    this.execution.steps.push(step)
  }

  recordEvaluationStep(params: {
    step: string
    input: Record<string, any>
    evaluations: XRayEvaluation[]
    output: Record<string, any>
    reasoning: string
    confidence?: number
  }): void {
    this.recordStep(
      params.step,
      params.input,
      params.output,
      params.reasoning,
      {
        outcome: "evaluate",
        reason: "Evaluation completed",
        confidence: params.confidence,
      },
      {
        evaluations: params.evaluations,
      },
    )
  }

  markComplete(finalOutcome?: string): void {
    this.execution.status = "completed"
    this.execution.completedAt = Date.now()
    this.execution.duration = this.execution.completedAt - this.execution.createdAt
    this.execution.summary = {
      totalSteps: this.execution.steps.length,
      finalOutcome,
    }
  }

  markFailed(error?: string): void {
    this.execution.status = "failed"
    this.execution.completedAt = Date.now()
    this.execution.duration = this.execution.completedAt - this.execution.createdAt
    if (error && this.execution.steps.length > 0) {
      const lastStep = this.execution.steps[this.execution.steps.length - 1]
      lastStep.reasoning += ` [ERROR: ${error}]`
    }
  }

  serialize(): XRayExecution {
    return this.execution
  }

  getExecution(): XRayExecution {
    return this.execution
  }
}

export function createXRay(name: string, executionId?: string): XRay {
  return new XRay(name, executionId)
}
