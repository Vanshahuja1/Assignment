"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

interface Execution {
  _id: string
  executionId: string
  name: string
  status: string
  steps: any[]
  createdAt: number
  duration?: number
}

export function ExecutionList() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "completed" | "failed">("all")

  useEffect(() => {
    fetchExecutions()
    const interval = setInterval(fetchExecutions, 5000)
    return () => clearInterval(interval)
  }, [])

  async function fetchExecutions() {
    try {
      const response = await fetch("/api/xray/executions")
      const data = await response.json()
      setExecutions(data)
    } catch (error) {
      console.error("Failed to fetch executions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExecutions = filter === "all" ? executions : executions.filter((e) => e.status === filter)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription>{filteredExecutions.length} executions</CardDescription>
          </div>
          <div className="flex gap-2">
            {(["all", "completed", "failed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading executions...</p>
        ) : filteredExecutions.length === 0 ? (
          <p className="text-muted-foreground">No executions found.</p>
        ) : (
          <div className="space-y-3">
            {filteredExecutions.map((exec) => (
              <Link key={exec._id} href={`/execution/${exec._id}`}>
                <div className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {exec.status === "completed" ? (
                          <CheckCircle className="w-4 h-4 text-accent" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                        <h3 className="font-semibold">{exec.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{exec.executionId}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(exec.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={
                          exec.status === "completed"
                            ? "bg-accent/10 text-accent border-accent/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }
                      >
                        {exec.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">{exec.steps.length} steps</p>
                        {exec.duration && <p className="text-xs text-muted-foreground">{exec.duration}ms</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
