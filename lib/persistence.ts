import type { XRayExecution } from "./xray"

export async function saveExecution(execution: XRayExecution): Promise<string> {
  const response = await fetch("/api/xray/executions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(execution),
  })

  if (!response.ok) {
    throw new Error("Failed to save execution")
  }

  const data = await response.json()
  return data._id
}
