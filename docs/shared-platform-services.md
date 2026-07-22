# Payout Engine — Shared Platform Services

> Payout Engine doesn't run in isolation — it's one of several products (Collection, Payout,
> Connected Banking, BBPS, Reseller, and others) built on top of a **common company-wide
> platform layer**. This document lists the shared services this product depends on, separate
> from the ~38 services enumerated in [`service-architecture.md`](./service-architecture.md)
> that belong to Payout Engine specifically.

## Why "Shared Platform" Matters for Testing

A defect in a shared service doesn't stay contained to one product. A bug in the company-wide
**Ledger Engine**, for example, doesn't just affect Payout's ledger entries — it silently
affects Collection's and Connected Banking's ledger correctness too. This is why a change to a
shared service should trigger **cross-product smoke testing**, not just regression scoped to
whichever product initiated the change.

## Shared Platform Services (Company-Wide)

### Identity & Access
- Authentication
- Authorization
- OTP Service
- User Management
- Role & Permission Service

### Merchant Lifecycle
- Merchant Management
- Merchant Onboarding
- Merchant Activation
- Merchant Profile

### Financial Engines
- Commercial Engine
- GST Engine
- Ledger Engine
- Settlement Engine
- Reconciliation Engine

### Reporting & Data Export
- Report Engine
- Export Engine
- Download Engine
- Dashboard Service
- Search Engine
- Filter Engine

### Platform Infrastructure
- Audit Logs
- Activity Logs
- Notification Service
- API Gateway
- Validation Service
- File Upload Service
- File Download Service
- Scheduler / Background Workers

## How Payout Engine Depends on These

- **Role & Permission Service** — Payout's beneficiary Approval Service (see
  `service-architecture.md`) enforces its admin/ops-only permission gate using the same shared
  role infrastructure that governs every other product's admin actions — a defect in the shared
  Role & Permission Service would silently weaken approval enforcement platform-wide, not just
  in Payout
- **Ledger Engine / Reconciliation Engine** — Payout's Ledger Service and Reconciliation Service
  write into and reconcile against the same shared infrastructure Collection and Connected
  Banking use, which is exactly why Retry idempotency (the highest-risk flow in this module —
  see [`business-flow.md`](./business-flow.md)) ultimately depends on the shared Reconciliation
  Engine correctly reflecting bank-side truth
- **Scheduler / Background Workers** — Bulk Payout's per-item processing and NEFT's batch-settle
  behavior (see `business-flow.md` sections 3–4) likely run on the same shared scheduler
  infrastructure used for other async, batch-oriented work across the platform
- **Notification Service** — beneficiary approval/rejection notifications and payout status
  updates flow through the same shared notification layer used by every other product

## Platform Summary (Company-Wide Context)

| Product | Approx. Services |
|---|---|
| Collection | 38 |
| Payout | 35 |
| Connected Banking | 28 |
| Shared Platform | 28 |

**~70–80 unique logical services** across the platform in total — many shared rather than
independently reimplemented per product.

> These are approximate, company-wide framing numbers. Payout Engine's own precise,
> exhaustively-enumerated service list (38 services) is in
> [`service-architecture.md`](./service-architecture.md).

## Testing Implication: Blast Radius

When scoping regression for a change to any shared service, ask: *which other products also
depend on this service?* A change to the shared Reconciliation Engine, in particular, is
worth extra scrutiny given how directly Payout's Retry-idempotency safety depends on it being
correct — a regression there could silently reintroduce the "double-pay" risk documented in
[`bug-reports/`](../bug-reports), even if nothing in Payout's own codebase changed.
