# 💸 Fintech Payout Engine

**An outbound merchant fund-transfer platform — QA & Automation Portfolio Project**

> This repository documents the QA strategy, test automation, and testing approach applied to a
> **Payout Engine** — a fintech platform that enables merchants to transfer funds to
> beneficiaries via IMPS, NEFT, or RTGS, with full commercial calculation, ledger tracking, and
> reporting.
>
> All content here uses **generic/sample data only**. No client names, company names, or
> confidential/production information are included. Dates and timelines are placeholders —
> update `[Timeline]` before publishing.

---

## 📖 Table of Contents

1. [What is a Payout Engine?](#-what-is-a-payout-engine)
2. [My Role](#-my-role)
3. [Tech Stack & Tools Used](#-tech-stack--tools-used)
4. [Types of Testing Performed](#-types-of-testing-performed)
5. [How It Works — Business Flow](#-how-it-works--business-flow)
6. [Key Achievements](#-key-achievements)
7. [Automation Approach](#-automation-approach)
8. [Regression Checklist](#-regression-checklist)
9. [Screenshots & Reports](#-screenshots--reports)
10. [Repository Structure](#-repository-structure)

---

## 💡 What is a Payout Engine?

A **Payout Engine** is the counterpart to a Collection Engine — instead of accepting money
*from* customers, it sends money *out* from a merchant's account to one or more beneficiaries
(vendors, employees, partners, refund recipients, etc.).

In plain terms, when a merchant needs to pay someone, the Payout Engine is what:

- **Manages beneficiaries** — stores and validates who money can be sent to, with an approval
  step before a beneficiary can receive funds
- **Initiates the transfer** — via **IMPS**, **NEFT**, or **RTGS**, each with its own limits and
  commercial rules
- **Tracks transfer status** — initiated → processing → success / failed, with reliable status
  reporting back to the merchant
- **Calculates commercials** — the platform's fee and GST for each payout
- **Produces ledger entries and audit trails** — every outbound transfer must be traceable
- **Powers merchant-facing reporting** — payout history, status search, and downloadable reports

If you're new to fintech QA, HR, or any non-technical role: think of the Payout Engine as a
company's outbound payments desk, digitized — but every transfer must be provably correct,
because unlike an inbound collection, a payout mistake means money has already left the building.

### Why beneficiary management is the distinguishing risk area

Unlike Collection, Payout introduces a **beneficiary approval workflow** — a permission gate
that doesn't exist on the inbound side. Sending money to the wrong or an unapproved beneficiary
is a much harder mistake to reverse than a failed collection, which is why beneficiary
validation and approval-flow testing carry disproportionate weight in this module's QA strategy.

### Who typically interacts with it?

| Role | What they do |
|---|---|
| **Merchant** | Logs in, manages beneficiaries, initiates payouts, checks status, downloads reports |
| **Admin / Ops** | Onboards merchants, activates payout services, configures commercials, approves beneficiaries, reviews audit logs |
| **Beneficiary** | The end recipient of funds — does not interact with the platform directly |

---

## 👤 My Role

QA Engineer / SDET responsible for the Payout Engine module, owning manual and automated test
coverage across beneficiary management and the full transfer lifecycle.

- Owned QA strategy for Payout regression covering Login → Dashboard → Beneficiary → Approval →
  Payout → Status → Reports
- Designed and executed **automation scripts using Playwright with TypeScript**, covering both
  UI and API layers of merchant-facing payout workflows
- Performed **API testing** validating payout payloads, response correctness, business rules,
  and merchant authorization
- Focused test design on **beneficiary validation and approval-flow edge cases**, given the
  higher risk of an irreversible misdirected transfer compared to inbound collections
- Logged, triaged, and tracked defects through their full lifecycle — from discovery to
  regression sign-off
- Maintained a regression checklist prioritized by financial correctness: commercials, GST,
  ledger accuracy, and permission/approval enforcement

**Timeline:** `[Add Duration]`

---

## 🛠 Tech Stack & Tools Used

| Category | Tools |
|---|---|
| **UI Automation** | Playwright, TypeScript, Page Object Model |
| **API Testing** | Playwright API requests, Postman |
| **Test Runner & Reporting** | Playwright Test Runner, built-in HTML Reports |
| **Performance Testing** | JMeter |
| **CI/CD** | Jenkins / GitHub Actions |
| **Bug Tracking** | JIRA |
| **Version Control** | Git, GitHub |

---

## 🧪 Types of Testing Performed

- **Functional Testing** — merchant login, dashboard, beneficiary management, payout initiation
- **Regression Testing** — full end-to-end suite run before every release
- **Smoke & Sanity Testing** — post-deployment health checks
- **API Testing** — payload validation, response validation, business rules, merchant
  authorization
- **Negative Testing** — duplicate beneficiaries, invalid beneficiary details, unsupported
  transfer modes
- **Permission/Approval Testing** — beneficiary approval flow, role-based access enforcement
- **Edge Case & Boundary Testing** — commercial rounding, GST rounding, transfer-mode limits

---

## 🔄 How It Works — Business Flow

> This section covers the internal QA/regression view (the screens a merchant navigates). For
> the full **end-to-end business flow** — including a detailed flow for each transfer mode
> (IMPS, NEFT, RTGS), the beneficiary lifecycle, bulk payout, retry idempotency, and settlement —
> see [`docs/business-flow.md`](./docs/business-flow.md).

### Merchant Regression Flow (highest-priority end-to-end scenario)

This is the single highest-priority path through the system. Each arrow below is annotated with
what's actually being validated at that step.

```
Login
  │  authenticates the merchant session
  ▼
Dashboard
  │  summary tiles must match live beneficiary/payout data
  ▼
Beneficiary ──▶ Create · Update · Delete
  │             a beneficiary is USELESS until it clears Verification + Approval —
  │             see docs/business-flow.md for the full lifecycle
  ▼
Approval
  │  permission gate — only admin/ops can approve; payouts must re-check
  │  approval status at execution time, not just at selection time
  ▼
Payout ──▶ IMPS · NEFT · RTGS · Single · Bulk
  │         each transfer mode has independent limits and cut-off behavior;
  │         Bulk Payout must report per-item status, not just a batch result
  ▼
Status
  │  must correctly represent long-lived PROCESSING states (esp. NEFT),
  │  and Retry must never risk a duplicate transfer
  ▼
Reports
     exported totals must match Status + Ledger data byte-for-byte
```

> For the service-level view of what's running behind each step above, see
> [`docs/service-architecture.md`](./docs/service-architecture.md).

### Supported Transfer Modes

| Mode | Notes |
|---|---|
| **IMPS** | Near-instant, typically lower per-transaction limits |
| **NEFT** | Batch-settled, widely supported, moderate limits |
| **RTGS** | For high-value transfers, typically has a minimum amount threshold |

Each mode has **independent limits and commercial rules** — a core reason mode-specific boundary
testing is a priority area, since the same amount can be valid on one mode and invalid on another.

### Admin Functions

- Merchant onboarding & payout activation
- Commercial (fee) configuration
- Beneficiary approval
- Audit log review
- Reports

### Cross-Module Dependencies

The Payout Engine conceptually interacts with:

- **Connected Banking** — for the actual outbound money movement
- **Merchant Dashboard** — for initiation and monitoring
- **Admin Portal** — for configuration and beneficiary approval
- **Ledger & Commercial Engine** — for fee calculation and audit trail
- **Reports** — for merchant and internal analytics

---

## 🏆 Key Achievements

- Owned QA coverage across Payout Engine's **~38-service architecture** — including a 5-service
  beneficiary lifecycle (Creation, Update, Delete, Approval, Verification), 3 independent
  transfer-mode services (IMPS, NEFT, RTGS), and dedicated commercial/ledger/reporting services
  (see [Service Architecture](./docs/service-architecture.md) for the full breakdown)
- Designed integration test coverage across the highest-financial-risk service boundary in the
  module — Retry Service idempotency — ensuring a retried transfer can never duplicate a payout
  that already succeeded on the bank side
- Built and maintained an automated regression suite in Playwright/TypeScript covering the full
  merchant payout journey (Login → Reports)
- Designed a beneficiary-approval-focused test strategy that treated permission and approval
  gates as first-class regression scenarios, not edge cases
- Validated commercial and GST calculation accuracy across all three transfer modes (IMPS, NEFT,
  RTGS), each with independent limits and fee rules
- Logged and tracked defects across common Payout-specific themes: beneficiary permission
  issues, approval-flow gaps, and commercial calculation mismatches
- Contributed to a testing strategy that prioritized **financial correctness and beneficiary
  safety first** — a misdirected payout is far costlier than a UI defect

---

## 🤖 Automation Approach

Automation for the Payout Engine is built with **Playwright + TypeScript**, using the **Page
Object Model** to keep locators and workflows maintainable.

- **Framework:** Playwright Test Runner
- **Language:** TypeScript
- **Pattern:** Page Object Model (POM) — one class per major screen (Dashboard, Beneficiary,
  Approval, Payout, Status, Reports)
- **Reporting:** Playwright's built-in HTML report, published as a build artifact
- **CI Integration:** Designed to run headless in Jenkins/GitHub Actions on every merge to main

### High-Priority Automated Regression Scenarios

1. Login
2. Dashboard
3. Beneficiary
4. Approval
5. Payout
6. Status
7. Reports

See [`automation/`](./automation) for the framework README and a sample spec file using dummy
data.

---

## ✅ Regression Checklist

- [ ] Login
- [ ] Dashboard
- [ ] Beneficiary (Create / Duplicate / Invalid)
- [ ] Approval Flow
- [ ] Payout (IMPS / NEFT / RTGS)
- [ ] Status Tracking
- [ ] Reports
- [ ] Downloads / Export
- [ ] Commercial Calculation
- [ ] GST Calculation
- [ ] Ledger Entries
- [ ] Permissions / Role-Based Access

Full checklist with edge cases available in [`test-cases/`](./test-cases).

---

## 📸 Screenshots & Reports

Sample test execution reports and defect report templates are available under
[`test-reports/`](./test-reports) and [`bug-reports/`](./bug-reports).

---

## 📁 Repository Structure

```
payout-engine/
├── README.md                     → This file
├── docs/
│   ├── business-overview.md      → What Payout Engine is, glossary, cross-module map
│   ├── architecture-and-flow.md  → Internal QA/regression flow diagrams (dashboard, admin, states)
│   ├── business-flow.md          → End-to-end flow per transfer mode, beneficiary lifecycle, bulk/retry, settlement
│   ├── feature-modules.md        → Full feature/screen inventory (Beneficiary, Modes, Bulk Payout, Reports)
│   ├── service-architecture.md   → Microservice-level decomposition & integration test boundaries
│   └── shared-platform-services.md → Company-wide services this product depends on (Auth, GST/Ledger/Reconciliation Engines, etc.)
├── test-cases/
│   └── regression-checklist.md   → Full regression suite + edge cases
├── automation/
│   ├── README.md                 → Framework setup & structure
│   └── sample-payout.spec.ts     → Sample Playwright + TypeScript test (dummy data)
├── bug-reports/
│   └── sample-defect-report.md   → Defect report template with dummy example
└── test-reports/
    └── regression-execution-summary.md → Sample regression test execution report
```

## 🤖 Support & Dispute Resolution

Payout issues (stuck transfers, disputes, account detail changes) are handled by the shared
[AI Dispute Resolution Engine](https://github.com/ghanendra-sdet/ai-dispute-resolution-engine) —
a single AI-powered support layer common across Collection, Payout, Connected Banking, BBPS, and
YOBO. It resolves ~80% of issues without human involvement, cutting average ticket resolution
time from a 24–72 hour baseline to under 6 hours.
