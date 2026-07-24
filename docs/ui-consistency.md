# Payout Engine — UI Consistency

> The same underlying payout/beneficiary data surfaces across Dashboard, Beneficiary Management,
> Payout Status, and Reports (see [`feature-modules.md`](./feature-modules.md)). This document
> covers whether it's represented **consistently** across all of them — a distinct testing
> dimension from whether any single screen is individually correct.

## Why This Matters More Here Than in Most Modules

Payout Engine already carries the platform's highest financial risk (see
[`business-overview.md`](./business-overview.md) section 6 — a misdirected or duplicated payout
is far harder to reverse than a bad collection). A UI inconsistency that makes a **Pending**
transfer look identical to a **Failed** one, or a partially-successful **Bulk Payout** batch
read as fully failed, doesn't just look sloppy — it actively risks the merchant taking the wrong
next action (like re-submitting a payout that already went through).

## 1. Status Badge Consistency

| Status | Expected Label | Expected Color (convention) |
|---|---|---|
| SUCCESS | "Success" | Green |
| FAILED | "Failed" | Red |
| PROCESSING | "Processing" | Blue/In-progress |
| PENDING APPROVAL | "Pending Approval" | Amber — must be visually distinct from FAILED |
| REJECTED | "Rejected" | Red, but distinguishable from FAILED (different failure reason class) |

**Test scenario:** a Beneficiary stuck in `Pending Approval` and a Beneficiary that was
`Rejected` must never share the same badge color/label — they require completely different next
actions from the merchant (wait vs. resubmit with corrected details).

## 2. Batch / Bulk Status Representation

Bulk Payout (see [`business-flow.md`](./business-flow.md) section 4) is the single highest-value
UI-consistency test target in this module:

- A batch with a mixed outcome (e.g. "8 of 10 succeeded") must **never** collapse to a binary
  Success/Failed badge at the batch-summary level — this exact defect class is documented in
  [`../sample-defect-report.md`](../sample-defect-report.md)
- The per-item detail view and the batch-summary view must agree in terminology and status
  representation — not use different labels for the same underlying state

## 3. Currency & Number Formatting

| Element | Convention to Verify |
|---|---|
| Currency symbol | Consistent placement (₹ prefix) everywhere — Dashboard, Beneficiary list, Payout Status, Reports |
| Decimal places | Always 2 decimal places, no screen truncating to whole rupees |
| Thousands separator | Consistent Indian numbering (₹1,00,000) across UI and exported reports |
| Fee vs. gross amount | Always clearly labeled which figure is the transfer amount vs. the commercial fee — never ambiguous |

## 4. Terminology Consistency

The glossary in [`business-overview.md`](./business-overview.md) defines canonical terms — watch
for drift on:

- "Payout" vs. "Transfer" vs. "Disbursement" used interchangeably for the same action
- "Beneficiary" vs. "Payee" vs. "Recipient" across different screens
- "Retry" meaning different things in different places (resubmitting a single failed payout vs.
  resubmitting only the failed items in a bulk batch — see
  [`business-flow.md`](./business-flow.md) section 5)

## 5. Empty States & Error Messages

- Does the Beneficiary list, Payout Status list, and Reports screen each show a deliberate empty
  state when there's no data, rather than a blank screen?
- Is the "Beneficiary not approved" error worded identically whether it's triggered from the UI
  payout form or surfaced via API (see the API-vs-UI consistency defect in
  [`../sample-defect-report.md`](../sample-defect-report.md))?

## 6. Cross-Browser & Responsive Consistency

- Do status badges and batch-summary displays render identically across Chrome, Firefox, and
  Safari/WebKit?
- Does the Bulk Payout per-item results table remain readable (not truncated/misaligned) on
  smaller viewports?

## 7. Accessibility Consistency

- Are PENDING APPROVAL, REJECTED, and FAILED states distinguishable by more than color alone?
- Do the Retry and Approve/Reject action buttons have consistent, sufficient contrast and clear
  labeling across every screen they appear on?

---

## Coverage Mapping

See [`../regression-checklist.md`](../regression-checklist.md) section 8 for the UI consistency
test cases (TC-062–067) derived from this document.
