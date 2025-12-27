"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

interface ExecutionHeaderProps {
  name: string
  executionId: string
  status: string
  createdAt: number
  completedAt?: number
  duration?: number
  finalOutcome?: string
}

export function ExecutionHeader({
  name,
  executionId,
  status,
  createdAt,
  completedAt,
  duration,
  finalOutcome,
}: ExecutionHeaderProps) {
  return (
    <div className="mb-8">
      <Link href="/">
        <Button variant="outline" className="mb-6 gap-2 bg-transparent border-border hover:bg-secondary">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-4 text-balance">{name}</h1>

      {finalOutcome && <p className="text-lg text-muted-foreground mb-6">{finalOutcome}</p>}

      <div className="flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">ID: </span>
          <code className="bg-secondary px-2 py-1 rounded text-xs">{executionId}</code>
        </div>
        <div>
          <span className="text-muted-foreground">Started: </span>
          <span>{new Date(createdAt).toLocaleString()}</span>
        </div>
        {completedAt && (
          <div>
            <span className="text-muted-foreground">Completed: </span>
            <span>{new Date(completedAt).toLocaleString()}</span>
          </div>
        )}
        {duration && (
          <div>
            <span className="text-muted-foreground">Duration: </span>
            <span>{duration}ms</span>
          </div>
        )}
        <Badge
          variant="outline"
          className={
            status === "completed"
              ? "bg-accent/10 text-accent border-accent/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }
        >
          {status}
        </Badge>
      </div>
    </div>
  )
}
