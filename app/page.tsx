"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExecutionList } from "@/components/execution-list"
import { Zap, BarChart3, Settings } from "lucide-react"

export default function Home() {
  const [isRunning, setIsRunning] = useState(false)

  async function runDemo() {
    setIsRunning(true)
    try {
      const response = await fetch("/api/demo/run-competitor-selection", { method: "POST" })
      if (response.ok) {
        // Refresh the execution list by reloading the page
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to run demo:", error)
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-balance">X-Ray Dashboard</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Debug multi-step algorithmic systems with complete transparency and traceability
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Visibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">See every decision point and why it was made</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Flexibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Works with any multi-step pipeline architecture</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lightweight SDK with minimal overhead</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-12">
          <CardHeader>
            <CardTitle>Try the Competitor Selection Demo</CardTitle>
            <CardDescription>
              Watch how X-Ray traces a complex 5-step decision pipeline from keyword generation to final competitor
              selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={runDemo}
              disabled={isRunning}
              className="bg-primary hover:bg-blue-600 text-primary-foreground"
            >
              {isRunning ? "Running..." : "Run Demo Execution"}
            </Button>
          </CardContent>
        </Card>

        {/* Execution List */}
        <ExecutionList />
      </div>
    </div>
  )
}
