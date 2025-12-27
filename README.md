# X-Ray: Multi-Step Decision Pipeline Debugger

A sophisticated debugging system for visualizing and understanding the decision-making process in multi-step, non-deterministic algorithmic pipelines.

## Overview

X-Ray provides complete transparency into complex decision workflows by capturing:
- **Input context** at each step
- **Output results** and transformations
- **Decision reasoning** explaining why each step happened
- **Metadata** for deeper analysis

## Architecture

### Core Components

1. **X-Ray SDK** (`lib/xray.ts`)
   - Lightweight wrapper for capturing execution traces
   - General-purpose design works with any multi-step workflow
   - Simple API: `recordStep()` to capture decision points

2. **MongoDB Integration** (`lib/db.ts`)
   - Persistent storage of execution traces
   - Automatic indexing for performance queries
   - Connection pooling for efficiency

3. **Dashboard UI** (`app/execution/[id]/page.tsx`, `components/*`)
   - Professional interface for exploring execution traces
   - Step-by-step visualization with expandable details
   - Input/output/reasoning viewing
   - Status filtering and search

4. **Demo Application** (`api/demo/run-competitor-selection/route.ts`)
   - Real-world example: Amazon competitor product selection
   - 5-step pipeline showcasing multi-stage decision making
   - Mock data for immediate testing

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)

### Installation

1. **Clone and install**
```bash
npm install
```

2. **Set up environment variables**

Create a `.env.local` file:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xray
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. **Run the application**
```bash
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

## Usage

### Using the X-Ray SDK in Your Code

```typescript
import { createXRay } from '@/lib/xray'

// Create a new execution trace
const xray = createXRay('My Multi-Step Process')

// Record each decision step
xray.recordStep(
  'step_name',
  { /* input data */ },
  { /* output data */ },
  'Reasoning explaining what happened and why',
  { /* optional metadata */ }
)

// Mark complete and save
xray.markComplete()
await xray.save()
```

### Example: Keyword Generation Step

```typescript
const keywords = generateKeywords(productTitle)
xray.recordStep(
  'keyword_generation',
  { product_title: productTitle, category: category },
  { keywords: keywords },
  'Extracted key product attributes from title and category'
)
```

### Example: Filter Application Step

```typescript
xray.recordStep(
  'apply_filters',
  { candidates: 50, reference_price: 29.99 },
  { qualified: 12, filtered_out: 38 },
  `Applied price ($15-$60), rating (3.8+), review (100+) filters. 
   Removed 38 candidates that didn't meet criteria.`,
  { evaluations: detailedEvaluations }
)
```

## Demo Application

The included demo showcases X-Ray with a realistic competitor product selection pipeline:

1. **Keyword Generation** - LLM extracts searchable keywords from product details
2. **Candidate Search** - API returns 50 top-matching products from millions
3. **Apply Filters** - Business rules filter by price range, rating, review count
4. **LLM Evaluation** - Second LLM pass removes false positives (accessories, etc)
5. **Rank & Select** - Ranking algorithm chooses the best match

Run the demo from the dashboard home page to see the complete execution trace.

## API Endpoints

### GET /api/xray/executions
Fetch all executions (sorted by most recent first, limited to 50)

**Response:**
```json
[{
  "_id": "...",
  "executionId": "exec_...",
  "name": "Competitor Product Selection Demo",
  "status": "completed",
  "steps": [...],
  "createdAt": 1234567890,
  "completedAt": 1234567895,
  "duration": 5
}]
```

### GET /api/xray/executions/:id
Fetch a specific execution by ID

### POST /api/xray/executions
Save a new execution trace

**Request Body:**
```json
{
  "executionId": "exec_...",
  "name": "My Process",
  "status": "completed",
  "steps": [...]
}
```

### POST /api/demo/run-competitor-selection
Run the competitor selection demo (for testing)

## Data Schema

### Execution Document

```typescript
{
  _id: ObjectId
  executionId: string (unique)
  name: string
  status: "completed" | "failed" | "in_progress"
  steps: XRayStep[]
  createdAt: number (timestamp)
  completedAt?: number (timestamp)
  duration?: number (milliseconds)
}
```

### XRayStep Object

```typescript
{
  step: string              // Step identifier
  timestamp: number         // When this step executed
  input: Record<string, any>    // What went into this step
  output: Record<string, any>   // What came out
  reasoning: string        // Why this decision was made
  metadata?: Record<string, any>  // Additional context
}
```

## Design Decisions

### General-Purpose SDK
The X-Ray SDK is not tied to any specific domain or use case. It works with:
- E-commerce competitor selection
- Content recommendation systems
- Lead scoring pipelines
- LLM-based decision workflows
- Any multi-step algorithmic process

### Flexible Data Structures
Rather than enforcing strict schemas, X-Ray allows flexible key-value pairs in input/output/metadata. This accommodates varying data structures across different pipelines.

### MongoDB for Persistence
MongoDB was chosen for:
- Schema flexibility matching varied pipeline data
- Rapid indexing for query performance
- Easy cloud deployment (Atlas)
- Good TypeScript support

### Client-Side Rendering
Most pages use client-side data fetching for simplicity. In production, you'd want to:
- Use Server Components with revalidation
- Implement pagination for large execution lists
- Add caching layers

## Known Limitations & Future Improvements

### Current Limitations
- In-memory execution storage (until MongoDB is connected) - no data persistence across server restarts
- No authentication/authorization
- No pagination (limited to 50 most recent executions)
- No advanced filtering/search capabilities
- Step details shown as JSON (could have specialized renderers)

### Future Enhancements
1. **User Management** - Auth, per-user execution isolation, sharing
2. **Advanced Visualization** - Sankey diagrams for decision flows, decision trees
3. **Search & Analytics** - Find executions by criteria, trend analysis
4. **Comparison Tools** - Side-by-side execution comparison
5. **Custom Renderers** - Domain-specific step visualization (e.g., product tables)
6. **Alerts & Anomalies** - Detect unexpected decision patterns
7. **Export/Integration** - Webhook notifications, CSV export, third-party integrations
8. **Performance Profiling** - Identify bottleneck steps
9. **Replay & Testing** - Replay executions with modified inputs
10. **Natural Language Query** - "Show me all executions where competitor was selected incorrectly"

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB with native driver
- **Frontend**: React 19 with TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Validation**: Zod

## Project Structure

```
.
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Dashboard home
│   ├── execution/
│   │   └── [id]/page.tsx       # Execution detail view
│   ├── api/
│   │   ├── xray/
│   │   │   └── executions/
│   │   │       ├── route.ts    # GET/POST executions
│   │   │       └── [id]/route.ts # GET single execution
│   │   └── demo/
│   │       └── run-competitor-selection/route.ts
│   └── globals.css
├── components/
│   ├── execution-header.tsx    # Execution metadata header
│   ├── execution-list.tsx      # Home page execution list
│   ├── step-detail.tsx         # Expandable step viewer
│   └── ui/                     # shadcn components
├── lib/
│   ├── xray.ts                 # Core SDK
│   ├── db.ts                   # MongoDB connection
│   ├── mock-data.ts            # Demo data
│   └── utils.ts                # Utilities
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Contributing

This is a reference implementation for the X-Ray system. Feel free to:
- Fork and customize for your use case
- Add domain-specific step renderers
- Extend with additional storage backends
- Implement additional visualization types

## License

MIT
```

```env.local file=".env.local.example"
# MongoDB Connection String
# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xray

# For Local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/xray

# Optional: Base URL for API calls (used in demo execution saves)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
