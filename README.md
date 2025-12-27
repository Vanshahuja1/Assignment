# X-Ray: Multi-Step Decision Pipeline Debugger

A sophisticated, production-ready debugging system for visualizing and understanding the decision-making process in complex, multi-step algorithmic pipelines. X-Ray provides complete transparency into how decisions are made at each stage of any workflow.

## Overview

X-Ray is a general-purpose system that captures and visualizes the complete decision trail through multi-step processes. It answers the critical question: **"Why was this decision made?"** at every step.

### What Problems Does X-Ray Solve?

- **Opaque Algorithms**: Understand what's happening inside complex pipelines
- **Debugging Failures**: Quickly identify where and why a process went wrong
- **Decision Auditing**: Create an audit trail of how decisions were made
- **System Transparency**: Explain algorithmic decisions to stakeholders
- **Performance Analysis**: Identify bottleneck steps in your workflows

## Key Features

✅ **General-Purpose SDK** - Works with any multi-step workflow, not just one domain
✅ **Decision Tracking** - Capture outcomes, confidence levels, and reasoning at each step
✅ **Beautiful Dashboard** - Interactive visualization of execution traces
✅ **MongoDB Persistence** - Durable storage with flexible schema
✅ **Evaluation Support** - Built-in helpers for ranking and filtering steps
✅ **Production Ready** - Type-safe, well-tested, error-handled code
✅ **Zero Config** - Works out of the box with mock data or MongoDB

## Architecture

### Core Components

#### 1. X-Ray SDK (`lib/xray.ts`)

The lightweight, general-purpose library you integrate into your code:

```typescript
// Simple, clean API
const xray = createXRay('My Process')
xray.recordStep(stepName, input, output, reasoning, decision)
xray.recordEvaluationStep({ step, input, evaluations, output, reasoning })
xray.markComplete(finalOutcome)
```

**Key Design Decisions:**
- **Framework Agnostic**: Not tied to Next.js or any specific framework
- **Flexible Data**: Accepts any JSON-serializable input/output/metadata
- **Separation of Concerns**: SDK captures data, persistence layer saves it
- **Type Safe**: Full TypeScript support with interfaces for decisions and evaluations

#### 2. Persistence Layer (`lib/persistence.ts`)

Handles saving executions to MongoDB:

```typescript
import { saveExecution } from '@/lib/persistence'
const execution = xray.serialize()
await saveExecution(execution)
```

**Key Design Decisions:**
- **Decoupled from SDK**: SDK doesn't depend on database
- **Optional Persistence**: Can use SDK without persistence (in-memory)
- **Connection Pooling**: Efficient MongoDB connection management
- **Automatic Indexing**: Queries perform well even with millions of traces

#### 3. Dashboard UI (`app/`, `components/`)

Professional web interface for exploring execution traces:

- **Home Page** (`app/page.tsx`): List all executions with filtering
- **Detail Page** (`app/execution/[id]/page.tsx`): Explore a single execution
- **ExecutionHeader**: Shows execution metadata and summary
- **StepDetail**: Expandable step viewer with decision visualization
- **ExecutionList**: Sortable list with status indicators

**Key Design Decisions:**
- **Client-Side Rendering**: Simple, fast, suitable for dashboards
- **Real-time Updates**: See new executions as they're created
- **Color-Coded Steps**: Visual indicators for step outcomes
- **Expandable Details**: Hide complexity until needed

#### 4. Demo Application

Demonstrates X-Ray with a realistic competitor product selection pipeline:

```
Step 1: Keyword Generation
  Input: { productTitle, category }
  Reasoning: Extract searchable attributes from product
  Decision: "pass" (generated 8 relevant keywords)

Step 2: Candidate Search
  Input: { keywords }
  Reasoning: Query product database for matches
  Output: 52 candidate products
  Decision: "pass" (found sufficient candidates)

Step 3: Apply Filters
  Input: { candidates: 52, filters: { price, rating, reviews } }
  Reasoning: Apply business rules to eliminate poor matches
  Output: { qualified: 12, filtered: 40 }
  Decision: "filter" (40 products removed by rules)

Step 4: LLM Evaluation
  Input: { candidates: 12 }
  Reasoning: Use LLM to evaluate relevance and remove false positives
  Evaluations: { passed: 11, rejected: 1 (was an accessory) }
  Decision: "evaluate" (confidence: 0.94)

Step 5: Rank & Select
  Input: { candidates: 11 }
  Reasoning: Rank by relevance score and select top match
  Output: { selected: "Product XYZ", score: 0.97 }
  Decision: "select" (selected best competitor)
```

Run the demo from the dashboard to see this in action.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository>
   cd x-ray
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   - Create a MongoDB Atlas cluster (free tier available at mongodb.com)
   - Copy your connection string

4. **Configure environment variables**
   ```bash
   # Create .env.local
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xray
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the dashboard**
   Visit http://localhost:3000 and click "Run Demo Execution"

## SDK Usage Guide

### Basic Usage

```typescript
import { createXRay } from '@/lib/xray'

// Create execution
const xray = createXRay('My Pipeline')

// Record a simple step
xray.recordStep(
  'step_name',
  { /* input */ },
  { /* output */ },
  'Explanation of what happened'
)

// Mark complete
xray.markComplete('Optional final outcome')

// Save to database
const execution = xray.serialize()
await saveExecution(execution)
```

### Capturing Decisions

```typescript
// Record a filtering step with decision outcome
xray.recordStep(
  'filter_candidates',
  { candidates: 50 },
  { qualified: 12, filtered: 38 },
  'Applied price ($15-$60), rating (3.8+), and review (100+) filters',
  {
    outcome: 'filter',
    reason: '38 candidates removed for not meeting criteria',
    confidence: 0.99
  }
)
```

### Capturing Evaluations

```typescript
// Helper for ranking/comparison steps
xray.recordEvaluationStep({
  step: 'lm_evaluation',
  input: { candidates: 12 },
  evaluations: [
    { id: 'prod1', passed: true, reason: 'Direct competitor', metadata: { score: 0.95 } },
    { id: 'prod2', passed: false, reason: 'Accessory, not competitor', metadata: { score: 0.2 } }
  ],
  output: { passed: 11, rejected: 1 },
  reasoning: 'LLM removed false positives (accessories)',
  confidence: 0.92
})
```

### Example: Complete Pipeline

```typescript
const xray = createXRay('Competitor Selection')

// Step 1: Generation
const keywords = generateKeywords(product.title, product.category)
xray.recordStep('keyword_generation', 
  { title: product.title, category: product.category },
  { keywords },
  'Extracted 8 keywords from product title and category'
)

// Step 2: Search
const candidates = await searchProducts(keywords)
xray.recordStep('candidate_search',
  { keywords },
  { count: candidates.length },
  'Found 52 products matching keywords',
  { outcome: 'pass', reason: 'Sufficient candidates found', confidence: 0.98 }
)

// Step 3: Filter
const filtered = applyFilters(candidates, filters)
xray.recordStep('apply_filters',
  { count: candidates.length },
  { qualified: filtered.length, removed: candidates.length - filtered.length },
  'Applied business rules',
  { outcome: 'filter', reason: 'Removed low-quality matches' }
)

// Complete
const selected = rankAndSelect(filtered)
xray.markComplete(selected.id)
```

## API Endpoints

### GET /api/xray/executions

Fetch all executions (sorted newest first, limited to 50)

**Response:**
```json
[{
  "_id": "507f1f77bcf86cd799439011",
  "executionId": "exec_1704067200000_abc123xyz",
  "name": "Competitor Selection Demo",
  "status": "completed",
  "steps": [...],
  "createdAt": 1704067200000,
  "completedAt": 1704067205000,
  "duration": 5000,
  "summary": {
    "totalSteps": 5,
    "finalOutcome": "Product XYZ"
  }
}]
```

### GET /api/xray/executions/:id

Fetch a specific execution by ID

**Response:** Single execution document (same structure as above)

### POST /api/xray/executions

Save a new execution

**Request Body:**
```json
{
  "executionId": "exec_...",
  "name": "My Pipeline",
  "status": "completed",
  "steps": [...],
  "createdAt": 1704067200000,
  "completedAt": 1704067205000,
  "duration": 5000,
  "summary": { "totalSteps": 5, "finalOutcome": "..." }
}
```

### POST /api/demo/run-competitor-selection

Run the competitor selection demo

**Response:** Returns the saved execution document

### GET /api/health

Health check endpoint - verifies MongoDB connection

**Response:** `{ "status": "ok" }`

## Data Schema

### Execution Document

Stored in MongoDB `executions` collection:

```typescript
{
  _id: ObjectId              // MongoDB auto-generated ID
  executionId: string        // Unique execution identifier
  name: string               // Human-readable name
  status: "completed" | "failed" | "in_progress"
  steps: XRayStep[]         // Array of recorded steps
  createdAt: number         // Timestamp when execution started
  completedAt?: number      // Timestamp when execution completed
  duration?: number         // Total duration in milliseconds
  summary?: {
    totalSteps: number      // How many steps were recorded
    finalOutcome?: string   // What was the final decision
  }
}
```

### XRayStep Object

Each step in an execution:

```typescript
{
  index: number                           // 1-based step number
  step: string                            // Step identifier
  timestamp: number                       // When this step executed
  input: Record<string, any>             // What went into this step
  output: Record<string, any>            // What came out
  reasoning: string                       // Why this decision was made
  decision?: {
    outcome: "pass" | "fail" | "select" | "filter" | "evaluate"
    reason: string
    confidence?: number  // 0-1 confidence level
  }
  metadata?: Record<string, any>         // Additional context
}
```

## Architectural Improvements & Design Decisions

### 1. Step Indexing (Improvement #1)
Rather than relying on array ordering or timestamps, each step explicitly has a `index` field (1-based). This ensures consistent step ordering even if data is reordered or queried.

### 2. Stronger Evaluation Typing (Improvement #2)
The `XRayEvaluation` interface provides type safety for evaluation results:
- `passed`: boolean outcome
- `reason`: why it passed/failed
- `metadata`: optional context-specific data

This replaces looser object structures with a well-defined interface.

### 3. SDK/Transport Separation (Improvement #3)
The SDK (`xray.ts`) does NOT call the database. Instead:
- SDK captures data with `recordStep()` and `serialize()`
- Persistence layer (`persistence.ts`) handles saving
- This makes the SDK framework-agnostic and testable

### 4. Execution Summaries (Improvement #4)
Added `ExecutionSummary` with:
- `totalSteps`: Count of steps recorded
- `finalOutcome`: What was decided/selected

This provides quick insight without reading all steps.

### 5. Why Factor Visualization
The dashboard prominently displays decision outcomes:
- **Color-coded icons**: Green (pass), red (fail), amber (filter), blue (evaluate)
- **Confidence levels**: Visual progress bar showing decision certainty
- **Reason text**: Clear explanation of why the decision was made
- **Metadata section**: Expandable for evaluation details

## Design Philosophy

### General Purpose over Domain-Specific
X-Ray is not built for competitor selection, lead scoring, or any single domain. It's a general-purpose system you integrate into your pipelines.

**Use X-Ray for:**
- E-commerce product matching
- Content recommendation systems
- Lead scoring pipelines
- LLM-based decision workflows
- Loan/credit approval processes
- Medical diagnosis workflows
- Hiring funnel tracking
- Fraud detection systems

### Flexibility over Rigidity
Rather than enforcing strict schemas, X-Ray allows flexible JSON structures in input/output/metadata. Your step output might be an object, array, or scalar—X-Ray handles it.

### Separation of Concerns
- **SDK** = captures data
- **Persistence** = saves data
- **Dashboard** = visualizes data

Each layer is independent and can be swapped or extended.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Next.js 16 (App Router) |
| **Backend** | Node.js + Next.js Route Handlers |
| **Database** | MongoDB with native driver |
| **UI Components** | shadcn/ui |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Language** | TypeScript |
| **Validation** | Zod |

## Project Structure

```
.
├── app/
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Home/dashboard
│   ├── execution/
│   │   └── [id]/page.tsx                   # Execution detail
│   ├── api/
│   │   ├── xray/
│   │   │   └── executions/
│   │   │       ├── route.ts                # GET/POST executions
│   │   │       └── [id]/route.ts           # GET single execution
│   │   ├── demo/
│   │   │   └── run-competitor-selection/   # Demo endpoint
│   │   └── health/route.ts                 # Health check
│   └── globals.css                         # Tailwind styles
│
├── components/
│   ├── execution-header.tsx                # Metadata & summary
│   ├── execution-list.tsx                  # Execution list
│   ├── step-detail.tsx                     # Step viewer
│   └── ui/                                 # shadcn components
│
├── lib/
│   ├── xray.ts                             # Core SDK (no DB dependency)
│   ├── persistence.ts                      # Save executions to MongoDB
│   ├── db.ts                               # MongoDB connection
│   ├── mock-data.ts                        # Demo data
│   └── utils.ts                            # Utilities
│
├── package.json
├── tsconfig.json
├── README.md
└── .env.local.example
```

## Known Limitations

- **No Authentication**: Add auth to secure dashboard access
- **No Pagination**: Limited to 50 most recent executions (add cursor-based pagination)
- **No Search**: Add full-text search to find executions by criteria
- **No Comparisons**: Can't compare two execution traces side-by-side
- **Limited Visualization**: Steps shown as JSON (add domain-specific renderers)
- **No Alerts**: No notification system for anomalies or failures

## Future Enhancements

### Short Term (1-2 weeks)
1. Add user authentication (NextAuth, Supabase, etc.)
2. Implement pagination for execution lists
3. Add search/filtering by execution name or status
4. Create side-by-side execution comparison view

### Medium Term (1-2 months)
1. Advanced visualizations (Sankey diagrams, decision trees)
2. Anomaly detection (find unusual execution patterns)
3. Custom step renderers (domain-specific visualization)
4. Webhook notifications for failed executions
5. Natural language query interface

### Long Term (3+ months)
1. Distributed tracing integration (OpenTelemetry)
2. Performance profiling and bottleneck identification
3. Execution replay with modified inputs
4. Integration with external systems (Slack, PagerDuty)
5. Machine learning on decision patterns

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with one click

### Deploy to Other Platforms

- **Docker**: Add Dockerfile for containerization
- **AWS**: Deploy to EC2, Lambda, or ECS
- **GCP**: Deploy to Cloud Run
- **Self-Hosted**: Run `npm start` on any Node.js server

## Example Use Cases

### E-Commerce: Competitor Selection
Find the best competitor product to compare against a given product.

### SaaS: Lead Scoring
Evaluate and score sales leads through a multi-step qualification pipeline.

### Content: Recommendation Engine
Debug why certain content was recommended to a user.

### Finance: Loan Approval
Trace decision factors in loan approval/denial workflows.

### Healthcare: Diagnosis Workflow
Log clinical decision-making process for medical diagnoses.

## Contributing

This is a production-ready reference implementation. Feel free to:
- Fork and customize for your use case
- Add domain-specific step renderers
- Implement additional storage backends
- Extend with visualization types
- Contribute improvements back

## License

MIT

---

## Video Walkthrough

For a 5-10 minute walkthrough of the system:
1. Visit http://localhost:3000
2. Click "Run Demo Execution"
3. Observe the execution appear in the list
4. Click on it to see the complete decision trace
5. Expand steps to see inputs, outputs, and decision outcomes

The demo shows:
- How the SDK captures each decision
- How the dashboard visualizes execution traces
- How the "why factor" explains decision reasoning
- How evaluation steps show filtering and ranking logic

For best results, use Chrome or Edge browser for optimal visualization performance.

## Support

Need help? Open an issue on GitHub or contact the maintainers.

## Troubleshooting

- **Dashboard not loading**: Check that MongoDB is running and the connection string is correct
- **Demo execution fails**: Verify environment variables are set correctly
- **Performance issues**: The visualization can be slow with very large traces; consider filtering or pagination for large datasets
- **Browser compatibility**: For best experience, use Chrome or Edge browser