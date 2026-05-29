# TRIA Product Requirements Document (PRD)
*Ciência para reconstruir sua identidade*

---

## 1. Goals and Background Context

### 1.1 Goals
* Deliver a high-performance e-commerce platform that mirrors the premium, scientific, and clinical positioning of the TRIA brand.
* Route users dynamically and invisibly to the correct product protocol through an interactive diagnostic quiz.
* Enable repeat purchase autonomy for logged-in users via direct, single-click replenishment (repor protocolo), protocol changes/upgrades, or individual item purchases.
* Lay the groundwork for a recurring monthly subscription model.

### 1.2 Background Context
TRIA is a premium Brazilian men's cosmetics brand specialized in high-performance hair treatments, targeted at men in the pre- and post-operative phases of hair transplants, as well as those experiencing hair loss, receding hairlines, or thinning hair. Rather than selling individual products in isolation, TRIA focuses on **Protocols**—structured, multi-step routines of reconstruction. 

The e-commerce platform must balance three distinct customer emotional states (post-op vulnerabilities, active hair loss skepticism, and image maintenance habits) on a single platform. The interactive diagnostic quiz serves as the routing engine, ensuring each user finds the correct protocol without fragmenting the brand's premium identity.

### 1.3 Change Log

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2026-05-29 | 1.0.0 | Initial PRD draft based on brainstorming outcomes | Morgan (PM) |

---

## 2. Requirements

### 2.1 Functional Requirements (FR)

#### Catalog & Products
* **FR1:** The system must support a catalog of 5 individual products (P1 to P5) and 4 structured protocols (Origin, Reconstruct, Define, Complete).
* **FR2:** Product details pages must display active ingredient mechanisms with scientific authority, including full INCI nomenclature (International Nomenclature of Cosmetic Ingredients).

#### Diagnostic Quiz Engine
* **FR3:** The quiz must consist of a maximum of 5 questions, evaluating the customer's *clinical stage* (pre-op, post-op recent, post-op consolidated, active loss, image maintenance) and *focus* (hair, beard, or both).
* **FR4:** The engine must recommend a single protocol based on the combination of clinical stage and focus:
  * Barba only → *Define*
  * Cabelo in active recovery (post-op recent / active loss) → *Reconstruct*
  * Cabelo in maintenance / initial stages → *Origin*
  * Both hair & beard or high-engagement profiles → *Complete*
* **FR5:** Users must be able to add the recommended protocol directly to the cart from the quiz results screen.

#### Client Autonomy & Repeat Purchases (Logged Area)
* **FR6:** The logged-in customer portal must store and display the user's recommended protocol based on their last quiz.
* **FR7:** The home screen of the customer portal must provide a 1-click CTA: *"Seu Protocolo: [Nome] — Repor agora"*, adding the entire kit to the cart.
* **FR8:** Logged-in users must be able to purchase any alternative protocol directly (upgrade/change) without being forced to take the quiz again.
* **FR9:** Logged-in users must be able to purchase individual products avulsos (e.g., just P2) from the catalog for single-item replenishment.

#### Recurring Subscription
* **FR10:** The system must allow users to convert a protocol purchase into a monthly subscription with a 10% discount and automated recurring billing.

---

### 2.2 Non-Functional Requirements (NFR)
* **NFR1 (Performance):** The quiz page must load in less than 1.5 seconds on mobile devices under 3G connections.
* **NFR2 (Security):** User diagnostic answers and medical/clinical parameters must be encrypted at rest and not shared with third-party tracking scripts.
* **NFR3 (Design):** The UI must strictly follow premium styling rules (curated dark mode, outfit typography, high-contrast clean borders, glassmorphism, micro-animations) to match the brand positioning.

---

## 3. User Interface Design Goals

### 3.1 Overall UX Vision
A clean, technical, and premium experience. The visual language should evoke clinical authority (like an online dermatology clinic) combined with high-end e-commerce luxury. Transitions between screens must be fluid and smooth.

### 3.2 Key Interaction Paradigms
* Slide-in navigation for the Quiz questions.
* Glassmorphic cards for product display.
* Skeleton screens during API loading of the catalog.
* Interactive 3D/high-quality mockup illustrations of the protocol boxes.

### 3.3 Core Screens and Views
* **Home Page:** Focuses on the tagline *"Ciência para reconstruir sua identidade"* with a primary CTA leading to the diagnostic quiz and a secondary, discrete catalogue link.
* **Quiz View:** Single-question-per-screen layout with a visible progress bar.
* **Quiz Results Page:** Scientific breakdown of why the specific protocol is recommended, including dermatologist/tricologist quotes.
* **Logged Customer Dashboard:** Personalized dashboard showcasing the user's progress timeline, current protocol, and replenishment options.
* **Cart & Checkout:** Clean, distraction-free checkout with clear visual breakdown of items.

### 3.4 Branding & Accessibility
* **Colors:** Dark slate greys, crisp laboratory whites, deep emerald green accents (representing trichology/reconstruction).
* **Typography:** Modern serif headings for authority (e.g., Playfair Display or Lora) paired with clean geometric sans-serif for body and technical text (e.g., Inter or Outfit).
* **Accessibility:** Full WCAG AA compliance, ensuring screen reader compatibility on the diagnostic quiz.

### 3.5 Target Device & Platforms
* Web Responsive (Mobile First - 80%+ of target traffic is expected on mobile).

---

## 4. Technical Assumptions

* **Repository Structure:** Monorepo (Next.js for Frontend and API routes, Supabase for Database and Authentication).
* **Service Architecture:** Serverless monolith utilizing Next.js App Router and Supabase edge functions.
* **Testing Requirements:** Unit testing for the quiz recommendation engine, integration testing for checkout and subscription webhooks.
* **Additional Assumptions:**
  * Integration with a premium Brazilian payment gateway supporting recurring billing (e.g., Pagar.me, Asaas, or Stripe).
  * Storage of quiz results in a local SQL schema associated with the user profile for logged-in retrieval.

---

## 5. Epic List

* **Epic 1: Foundation & Catalog Setup:** Establish monorepo structure, database schemas (products, users, protocols), and catalog API/views.
* **Epic 2: Diagnostic Quiz Engine:** Build the multi-step interactive quiz UI and recommendation logic.
* **Epic 3: User Authentication & Logged Area Autonomy:** Implement secure auth, saved recommendations, and the three replenishment pathways (repor anterior, trocar, avulso).
* **Epic 4: Checkout & Order Processing:** Build cart operations and payment gateway integration.
* **Epic 5: Subscriptions & Recurring Replenishment:** Setup automated monthly billing, webhook handlers, and subscription management views.

---

## 6. Epic Details

### Epic 1: Foundation & Catalog Setup
*Goal:* Setup the basic project structure and catalog system so that individual products and protocols are rendered from database tables with active ingredients and INCI nomenclature.

#### Story 1.1: Project Initial Scaffold
* **User Story:** As a developer, I want to scaffold the Greenfield monorepo with Next.js, TypeScript, and styling configs so that the team can build features.
* **Acceptance Criteria:**
  1. Next.js App Router scaffolded with TypeScript 5.x.
  2. ESLint, Prettier, and lint-staged configs matching AIOX quality gates.
  3. Simple health check route (`/api/health`) returning system status.

#### Story 1.2: Database Migration Schema
* **User Story:** As a developer, I want to define the PostgreSQL schema for users, products, protocols, and user_diagnoses so that data is persistent.
* **Acceptance Criteria:**
  1. Products table structured with fields: `id`, `name`, `price`, `description`, `category`, `active_ingredients`, `inci`.
  2. Protocols table structured with fields: `id`, `name`, `price`, `original_price`, `description`, `products` (relationship/array of product IDs), `narrative`.
  3. SQL seed files matching the P1-P5 pricing and Origin, Reconstruct, Define, Complete kits.

#### Story 1.3: Catalog API & Rendering
* **User Story:** As a customer, I want to browse products and protocols on the catalog page so that I can see their prices and scientific active ingredients.
* **Acceptance Criteria:**
  1. REST API endpoint `/api/catalog` exposing products and protocols.
  2. Catalog page rendering all 5 products and 4 protocols.
  3. Interactive UI modal displaying INCI ingredients when a product is clicked.

---

### Epic 2: Diagnostic Quiz Engine
*Goal:* Deliver an interactive, premium multi-step quiz that collects user inputs and calculates the recommended protocol.

#### Story 2.1: Interactive Quiz Flow UI
* **User Story:** As a user, I want a slide-based quiz UI with a progress bar so that I can easily answer the 5 questions without feeling overwhelmed.
* **Acceptance Criteria:**
  1. Exactly 5 questions rendered one at a time.
  2. Dynamic progress bar at the top indicating completion percentage.
  3. Responsive UI that fits perfectly on mobile screens.

#### Story 2.2: Quiz Recommendation Engine
* **User Story:** As a developer, I want a recommendation algorithm that takes the quiz responses and outputs the correct protocol so that the user receives a personalized treatment plan.
* **Acceptance Criteria:**
  1. Recommendation engine inputs: `clinical_stage` and `focus`.
  2. Recommendation output mapping:
     * Focus is "beard" only → recommends *Define*.
     * Focus is "hair" or "both", and clinical stage is "post-op recent" or "active loss" → recommends *Reconstruct*.
     * Focus is "hair" and clinical stage is "pre-op", "post-op consolidated", or "maintenance" → recommends *Origin*.
     * Focus is "both" and clinical stage is "pre-op", "post-op consolidated", or "maintenance" → recommends *Complete*.
  3. Outputs results with a direct "Adicionar Protocolo ao Carrinho" button.

---

### Epic 3: User Authentication & Logged Area Autonomy
*Goal:* Implement user accounts that remember quiz results and allow direct, friction-free replenishment of protocols or individual items.

#### Story 3.1: Supabase Authentication Integration
* **User Story:** As a customer, I want to register and login so that my cart and recommendations are saved.
* **Acceptance Criteria:**
  1. Registration and Login pages utilizing Supabase Auth.
  2. User session persistent across refreshes.

#### Story 3.2: Logged Dashboard (1-Click Replenishment)
* **User Story:** As a logged-in user, I want to see my recommended protocol on my dashboard with a 1-click buy button so that I can replenish my routine quickly.
* **Acceptance Criteria:**
  1. Database table `user_recommendations` linkable to user profiles.
  2. Dashboard displays current recommended protocol.
  3. CTA button *"Seu Protocolo: [Nome] — Repor agora"* adds all protocol items to the cart and redirects to checkout.

#### Story 3.3: Autonomy Pathways (Troca & Avulso)
* **User Story:** As a logged-in customer, I want to buy single items or change protocols on my profile without repeating the quiz so that I have complete shopping autonomy.
* **Acceptance Criteria:**
  1. A dashboard sub-section allows changing the recommended protocol directly to any of the other 3 protocols.
  2. Customer can click a "Produtos Avulsos" catalog link in their profile to purchase individual items (e.g. only P2).

---

### Epic 4: Checkout & Order Processing
*Goal:* Handle cart and payment processing.

#### Story 4.1: Cart & Checkout Session API
* **User Story:** As a customer, I want to add items to my cart and review the total price with discount logic applied so that I can check out.
* **Acceptance Criteria:**
  1. Cart context stores items, quantities, and calculates protocol discounts dynamically.
  2. API checkout endpoint `/api/checkout` validating item availability.

#### Story 4.2: Payment Gateway Integration
* **User Story:** As a customer, I want to pay using Pix or Credit Card so that my order is processed.
* **Acceptance Criteria:**
  1. Integration with gateway API.
  2. Webhook listener `/api/webhooks/payment` handling payment status changes (paid, failed).
  3. Order state updated in database.

---

### Epic 5: Subscriptions & Recurring Replenishment
*Goal:* Establish automated recurring monthly shipments.

#### Story 5.1: Recurring Billing API
* **User Story:** As a customer, I want to subscribe to a protocol so that I receive it automatically every month with a 10% discount.
* **Acceptance Criteria:**
  1. Option in checkout to "Assinar mensalmente".
  2. Subscription active state saved in `subscriptions` table.
  3. Webhook handler processes recurring monthly charges and triggers package dispatch alerts.

---

## 7. Next Steps

### 7.1 UX Expert Prompt
"Review [prd.md](file:///c:/Users/Gustavo/Documents/TRIA/docs/prd.md) and design the user journeys, visual themes, wireframes, and design token configurations for the premium TRIA e-commerce platform. Focus on the quiz transition animations and the customer area's replenishment paths."

### 7.2 Architect Prompt
"Review [prd.md](file:///c:/Users/Gustavo/Documents/TRIA/docs/prd.md) and generate the complete backend architecture, including database schema SQL DDL for PostgreSQL, OpenAPI specifications for the API routes, and directory structure under `c:/Users/Gustavo/Documents/TRIA/`."
