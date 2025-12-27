"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle, Zap } from "lucide-react"

interface XRayDecision {
  outcome: "pass" | "fail" | "select" | "filter" | "evaluate"
  reason: string
  confidence?: number
}

interface XRayStep {
  step: string
  timestamp: number
  input: Record<string, any>
  output: Record<string, any>
  reasoning: string
  decision?: XRayDecision
  metadata?: Record<string, any>
  index: number // Added index field to XRayStep
}

interface StepDetailProps {
  step: XRayStep
}

function getDecisionIcon(outcome: string) {
  switch (outcome) {
    case "pass":
    case "select":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    case "fail":
      return <XCircle className="w-5 h-5 text-red-500" />
    case "filter":
      return <AlertCircle className="w-5 h-5 text-amber-500" />
    case "evaluate":
      return <Zap className="w-5 h-5 text-blue-500" />
    default:
      return null
  }
}

export function StepDetail({ step }: StepDetailProps) {
  const [expanded, setExpanded] = useState(step.index === 1)

  return (
    <Card
      className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{step.step}</CardTitle>
              {step.decision && getDecisionIcon(step.decision.outcome)}
            </div>
            <CardDescription>
              Step {step.index} • {new Date(step.timestamp).toLocaleTimeString()}
            </CardDescription>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6 border-t border-border pt-6">
          {step.decision && (
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <h4 className="font-semibold text-sm mb-3 text-primary flex items-center gap-2">
                {getDecisionIcon(step.decision.outcome)}
                Why Factor - Decision Details
              </h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Decision Outcome</p>
                  <p className="text-sm font-mono bg-background rounded px-3 py-2 capitalize">
                    {step.decision.outcome}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Decision Reason</p>
                  <p className="text-sm leading-relaxed text-foreground">{step.decision.reason}</p>
                </div>
                {step.decision.confidence !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Confidence Level</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                          style={{ width: `${Math.min(step.decision.confidence * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {(Math.min(step.decision.confidence, 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-sm mb-3 text-primary">Reasoning</h4>
            <p className="text-sm leading-relaxed text-foreground">{step.reasoning}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-3 text-primary">Input</h4>
              <div className="bg-secondary rounded p-3 font-mono text-xs overflow-auto max-h-64 border border-border">
                <pre className="text-muted-foreground">{JSON.stringify(step.input, null, 2)}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 text-primary">Output</h4>
              <div className="bg-secondary rounded p-3 font-mono text-xs overflow-auto max-h-64 border border-border">
                <pre className="text-muted-foreground">{JSON.stringify(step.output, null, 2)}</pre>
              </div>
            </div>
          </div>

          {step.metadata?.evaluations && (
            <div>
              <h4 className="font-semibold text-sm mb-3 text-primary">Evaluation Results</h4>
              <div className="bg-secondary rounded p-3 font-mono text-xs overflow-auto max-h-96 border border-border">
                <pre className="text-muted-foreground">{JSON.stringify(step.metadata.evaluations, null, 2)}</pre>
              </div>
            </div>
          )}

          {step.metadata && Object.keys(step.metadata).length > 0 && !step.metadata.evaluations && (
            <div>
              <h4 className="font-semibold text-sm mb-3 text-primary">Additional Details</h4>
              <div className="bg-secondary rounded p-3 font-mono text-xs overflow-auto max-h-64 border border-border">
                <pre className="text-muted-foreground">{JSON.stringify(step.metadata, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
