# Epic 1: Foundation & Catalog Setup

**Status:** In Progress (Story 1.1 Complete, Story 1.2 Pending)

**Goal:** Setup the basic project structure and catalog system so that individual products and protocols are rendered from database tables with active ingredients and INCI nomenclature.

---

## Stories

### Story 1.1: Project Initial Scaffold
- **Status:** ✅ COMPLETE
- **Owner:** @architect (Aria)
- **File:** `1.1.story.md`
- **Deliverables:**
  - Next.js 14 (App Router) + TypeScript 5.4 scaffolded
  - ESLint, Prettier, Jest configured
  - Health check endpoint (`/api/health`)
  - Landing page with quiz/catalog CTAs
  - Type-safe database and service layers
  - Database schema SQL with RLS policies and seed data
  - Premium Tailwind CSS color palette configured

### Story 1.2: Database Migration Schema
- **Status:** 🔄 PENDING (@dev)
- **File:** `1.2.story.md` (to be created by @sm or @dev)
- **AC:**
  - Apply SQL migrations to Supabase
  - Validate seed data (5 products, 4 protocols)
  - Verify RLS policies active
  - Test DatabaseService queries

### Story 1.3: Catalog API & Rendering
- **Status:** 🔄 PENDING (@dev)
- **File:** `1.3.story.md` (to be created)
- **AC:**
  - REST endpoint `/api/catalog` exposing products/protocols
  - Catalog page rendering all products and protocols
  - Interactive modal displaying INCI ingredients

---

## Architectural Decisions (from 1.1)

1. **Single App Monorepo** — Next.js hosts frontend pages + API routes
2. **Server-First Components** — SSR default, client state only where needed
3. **Supabase for Auth + DB** — Built-in RLS, reduces ops overhead
4. **DatabaseService Pattern** — Encapsulates all SQL (no inline queries)
5. **Strict TypeScript** — Type safety across codebase
6. **Premium Branding** — Dark slate greys, emerald green accents
7. **Logger Without PII** — Structured logging, no sensitive data in cleartext

---

## Dependencies & Prerequisites

- **Node.js 20.x** (LTS)
- **npm** or **yarn**
- **Supabase Account** with project created
- **Environment Variables** (.env populated with Supabase credentials)
- **Git** initialized

---

## Next Phase

1. **Story 1.2:** @dev applies database migrations, validates seed data
2. **Story 1.3:** @dev implements catalog API and rendering
3. **Epic 1 Complete:** @po validates stories; ready for Epic 2 (Quiz Engine)

---

## Handoff References

- **From @architect to @dev:** `.aiox/handoffs/handoff-architect-to-dev-2026-06-05.yaml`
- **Git Commit:** `feat: scaffold Next.js 14 full-stack application [Story 1.1]`

---

**Last Updated:** 2026-06-05  
**Epic Owner:** Morgan (PM)  
**Architecture Lead:** Aria (@architect)
