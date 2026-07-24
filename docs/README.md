# Payout Engine — Documentation Map

> If you're approaching this repo the way a curious QA engineer, automation tester, or
> tech-enthusiast would — "what is this, how does it actually work, who's involved, what does it
> depend on, what's the difference between the business flow and the technical flow" — this page
> answers that directly, one question at a time.

| Your Question | Answer Lives In |
|---|---|
| **What is this, in plain terms?** | [`business-overview.md`](./business-overview.md) — the "start here" doc |
| **Who's involved? (Stakeholders)** | [`business-overview.md`](./business-overview.md) section 8 — Merchant, Beneficiary, Finance, Operations, Banks, Compliance, and more |
| **What does it depend on?** | [`shared-platform-services.md`](./shared-platform-services.md) (company-wide shared engines) + [`service-architecture.md`](./service-architecture.md) (this product's own ~38 services) |
| **How does it work, technically?** (Tech Flow) | [`architecture-and-flow.md`](./architecture-and-flow.md) — internal state machines, admin flow — plus [`service-architecture.md`](./service-architecture.md) for the microservice-level view |
| **What does the merchant/beneficiary actually experience?** (Business Flow + User Flow) | [`business-flow.md`](./business-flow.md) — the real end-to-end journey per transfer mode (IMPS/NEFT/RTGS), beneficiary lifecycle, bulk payout, retry idempotency |
| **What screens/fields exist?** | [`feature-modules.md`](./feature-modules.md) |
| **Does the UI behave consistently everywhere?** | [`ui-consistency.md`](./ui-consistency.md) |
| **What's actually tested?** | [`../regression-checklist.md`](../regression-checklist.md) |
| **What's been automated?** | [`../automation/`](../automation) |
| **What real defects has this surfaced?** | [`../sample-defect-report.md`](../sample-defect-report.md) |
| **What does a regression run look like?** | [`../regression-execution-summary.md`](../regression-execution-summary.md) |

## Reading Order (Recommended)

```
1. business-overview.md        ← the "why" — what problem, who's involved, what's high-risk
        │
        ▼
2. business-flow.md            ← the "what happens" — per transfer mode, beneficiary lifecycle, retry
        │
        ▼
3. feature-modules.md          ← the "where" — concrete screens and fields
        │
        ▼
4. architecture-and-flow.md    ← the "how" (system-level) — state machines, admin flow
        │
        ▼
5. service-architecture.md     ← the "how" (service-level) — microservice decomposition
        │
        ▼
6. shared-platform-services.md ← the "what it shares" — company-wide dependencies
        │
        ▼
7. ui-consistency.md           ← the "does it hold together" — cross-screen UI consistency
        │
        ▼
8. regression-checklist.md, automation/, sample-defect-report.md, regression-execution-summary.md
   ← the proof — coverage, automation, real findings, real numbers
```

## Business Flow vs. Tech Flow vs. User Flow — What's the Difference Here?

- **Business Flow** ([`business-flow.md`](./business-flow.md)) — the *why* and *what*: a
  merchant adds a beneficiary, it gets approved, a payout is sent, money moves, fees get
  calculated. Written for anyone regardless of technical background.
- **User Flow** — the same ground as Business Flow but from the *actor's* point of view at each
  step — what a merchant enters when adding a beneficiary, what happens when a transfer-mode
  limit is hit. Covered inside `business-flow.md` sections 3–5 (per transfer mode, bulk, retry),
  not a separate document.
- **Tech Flow** ([`architecture-and-flow.md`](./architecture-and-flow.md) +
  [`service-architecture.md`](./service-architecture.md)) — the *how*, internally: which service
  owns beneficiary verification vs. approval, integration boundaries, state transitions.

If you only read one document to understand this product end-to-end, read
`business-overview.md` first, then `business-flow.md` — pay particular attention to the Retry
Idempotency section, since it's the single highest financial-risk flow in this repo.
