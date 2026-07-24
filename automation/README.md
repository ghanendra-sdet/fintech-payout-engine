# Payout Engine — Automation Framework

Automation for the Payout Engine's primary merchant regression path, built with
**Playwright + TypeScript** using the **Page Object Model (POM)**.

> Automated scenarios trace directly to [`../regression-checklist.md`](../regression-checklist.md)
> and the flow diagrams in [`../docs/architecture-and-flow.md`](../docs/architecture-and-flow.md).
> See [`../docs/README.md`](../docs/README.md) for the full documentation map.

## Why Playwright + TypeScript

- Native auto-waiting handles async status transitions (Initiated → Processing → Success/Failed)
  without manual polling loops
- Built-in API request context supports mixed UI + API tests, useful for verifying a
  beneficiary approved via API is correctly reflected in the UI
- TypeScript keeps page objects maintainable as beneficiary and payout screens evolve

## Suggested Project Structure

```
automation/
├── README.md
├── playwright.config.ts
├── pages/
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── BeneficiaryPage.ts
│   ├── ApprovalPage.ts
│   ├── PayoutPage.ts
│   └── StatusPage.ts
├── fixtures/
│   └── dummy-merchant.ts
└── tests/
    ├── sample-payout.spec.ts
    └── ...
```

> This repo currently includes one representative sample (`sample-payout.spec.ts`) rather than
> the full framework, to keep the portfolio focused.

## Test Data Policy

All automation uses **dummy data only**:
- Dummy beneficiary names and account numbers
- Dummy IFSC codes that pass format validation but map to no real bank
- Dummy payout amounts generated at runtime, never fixed production values

## Priority Automated Scenarios

1. Login
2. Dashboard
3. Beneficiary
4. Approval
5. Payout
6. Status
7. Reports

Retry idempotency and Bulk Payout partial-failure (see
[`../docs/business-flow.md`](../docs/business-flow.md) sections 4–5) are the next priority tier
for automation given their financial-risk profile, currently manual-only.
