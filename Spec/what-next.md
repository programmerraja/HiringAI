# HiringAI - MVP Implementation Plan

## Current Status (Completed)

- Authentication (login, register, logout, JWT cookies)
- Landing page (hero, features, how it works, testimonials, CTA)
- Basic dashboard with user profile
- Protected routes

---

## MVP Scope (What We're Building)

### Out of Scope for MVP
- Voice agent integration (real-time calls)
- Transcript generation
- AI question generation

### In Scope for MVP
- Company management with Jina.ai scraping
- Agent (Job) creation and management
- Candidate management with resume parsing
- Dashboard with sidebar navigation
- Recording URL storage (flexible for future transcript)

---

## Data Models

### Company Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // ref: User
  name: String,               // required
  website: String,            // URL that was scraped
  culture: String,            // extracted company culture
  context: String,            // LLM-processed context for interviews
  createdAt: Date,
  updatedAt: Date
}
```

### Agent Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // ref: User (owner)
  companyId: ObjectId,        // ref: Company
  name: String,               // agent/job name
  jobDetails: {
    title: String,            // job title
    description: String       // job description
  },
  pillars: [String],          // ["experience", "behavioral", "role_specific", "cultural_fit"]
  questions: [String],        // array of interview questions
  prompt: String,             // system prompt for AI
  persona: String,            // "formal" | "casual"
  status: String,             // "draft" | "active" | "paused" | "archived"
  createdAt: Date,
  updatedAt: Date
}
```

### Candidate Collection
```javascript
{
  _id: ObjectId,
  agentId: ObjectId,          // ref: Agent
  name: String,               // required
  email: String,              // required
  phone: String,              // optional
  resume: String,             // parsed resume text
  recordingUrl: String,       // interview recording (future: add transcript)
  status: String,             // "pending" | "interviewed" | "advanced" | "rejected" | "on_hold"
  feedback: String,           // recruiter notes
  createdAt: Date,
  updatedAt: Date
}
```

---

## UI Structure

### Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│  Navbar (Logo, User menu, Logout)               │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Main Content Area                   │
│          │                                      │
│ • Agents │  (changes based on sidebar selection)│
│ • Candi- │                                      │
│   dates  │                                      │
│ • Sett-  │                                      │
│   ings   │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Pages

**1. Agents Page (`/dashboard/agents`)**
- List all agents for current user
- Each card shows: name, job title, company, status, candidate count
- Click card → Agent detail page
- "Create Agent" button

**2. Agent Detail Page (`/dashboard/agents/:id`)**
- View/Edit agent details (name, job info, questions, prompt, persona)
- See linked candidates
- Change status (active/paused/archived)

**3. Candidates Page (`/dashboard/candidates`)**
- List all candidates across all agents
- Filter by agent, status
- Table: name, email, agent name, status, actions
- Click row → Candidate detail
- "Add Candidate" button

**4. Candidate Detail Page (`/dashboard/candidates/:id`)**
- View candidate info (name, email, phone, resume)
- View/play recording (if exists)
- Update status
- Add feedback

**5. Settings Page (`/dashboard/settings`)**
- User profile section (name, email - from existing)
- Companies section:
  - List user's companies
  - Add company (enter website URL → Jina scrapes → LLM extracts context)
  - Edit/Delete company

---

## API Endpoints

### Company APIs
```
GET    /api/companies           - List user's companies
POST   /api/companies           - Create company (triggers Jina scrape)
GET    /api/companies/:id       - Get company details
PUT    /api/companies/:id       - Update company
DELETE /api/companies/:id       - Delete company
```

### Agent APIs
```
GET    /api/agents              - List user's agents
POST   /api/agents              - Create agent
GET    /api/agents/:id          - Get agent details
PUT    /api/agents/:id          - Update agent
DELETE /api/agents/:id          - Delete agent
PATCH  /api/agents/:id/status   - Update agent status
```

### Candidate APIs
```
GET    /api/candidates          - List candidates (filter by agentId)
POST   /api/candidates          - Create candidate
GET    /api/candidates/:id      - Get candidate details
PUT    /api/candidates/:id      - Update candidate
DELETE /api/candidates/:id      - Delete candidate
PATCH  /api/candidates/:id/status - Update candidate status
```

---

## Implementation Phases

### Phase 1: Backend Models & APIs
1. Create Company model
2. Create Agent model
3. Create Candidate model
4. Implement Company CRUD APIs
5. Implement Agent CRUD APIs
6. Implement Candidate CRUD APIs
7. Integrate Jina.ai for website scraping
8. Add LLM integration for context extraction

### Phase 2: Dashboard Layout
1. Create sidebar component
2. Update dashboard with sidebar layout
3. Add routing for dashboard sub-pages
4. Create placeholder pages

### Phase 3: Settings Page
1. Build company list UI
2. Build add company form with URL input
3. Implement scraping flow (loading state → result)
4. Build edit/delete company

### Phase 4: Agents Page
1. Build agents list UI
2. Build create agent form (select company, job details, pillars, questions)
3. Build agent detail/edit page
4. Implement status management

### Phase 5: Candidates Page
1. Build candidates list with filters
2. Build add candidate form (select agent, enter details, paste resume)
3. Build candidate detail page
4. Implement status updates and feedback

---

## External Integrations

### Jina.ai (Website Scraping)
- Endpoint: `https://r.jina.ai/{url}`
- Returns: Markdown content of webpage
- Use for: Extracting company website content

### LLM (Context Extraction)
- Input: Raw scraped content from Jina
- Output: Structured company context (culture, values, products)
- Store in: Company.context field

---

## File Structure (New Files)

```
server/src/
├── models/
│   ├── company.model.ts
│   ├── agent.model.ts
│   └── candidate.model.ts
├── controllers/
│   ├── company.controller.ts
│   ├── agent.controller.ts
│   └── candidate.controller.ts
├── routes/
│   ├── company.routes.ts
│   ├── agent.routes.ts
│   └── candidate.routes.ts
└── services/
    ├── jina.service.ts        # Jina.ai integration
    └── llm.service.ts         # LLM context extraction

client/src/
├── components/
│   └── dashboard/
│       ├── Sidebar.tsx
│       ├── AgentsPage.tsx
│       ├── AgentDetail.tsx
│       ├── CandidatesPage.tsx
│       ├── CandidateDetail.tsx
│       └── SettingsPage.tsx
└── services/
    ├── company.api.ts
    ├── agent.api.ts
    └── candidate.api.ts
```

---

## Next Action

Start with Phase 1: Create the three backend models (Company, Agent, Candidate) and their CRUD APIs.
