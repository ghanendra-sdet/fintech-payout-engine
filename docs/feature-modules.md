# Payout Engine — Feature & Module Breakdown

> Detailed feature inventory used to scope test coverage. Complements
> [`business-overview.md`](./business-overview.md) (the "why") with the concrete "what".

## Beneficiary

- Add Beneficiary
- Update Beneficiary
- Delete Beneficiary
- Beneficiary Approval

**Test implication:** update and delete need their own regression coverage separate from
creation — e.g. can an *approved* beneficiary be edited without re-triggering approval? Should
it? This is a common source of ambiguous requirements worth explicitly testing and documenting.

## Transfer Modes

- **IMPS**
- **NEFT**
- **RTGS**

## Payout

- Single Payout
- **Bulk Payout** — multiple beneficiaries in one submission
- Retry (for failed/stuck payouts)
- Status Check

**Test implication for Bulk Payout:** a bulk submission introduces partial-failure scenarios
that single payout doesn't have — e.g. 8 of 10 beneficiaries succeed, 2 fail. The system must
report per-item status clearly, not just an overall batch status, and a **Retry** must be
scoped to only the failed items, not the whole batch.

## Reports

- Payout Reports
- Beneficiary Reports
- Transaction Reports

## Commercials

- Transaction Charges
- GST
- Fee Calculation

---

## Coverage Mapping

| Feature Area | Covered in |
|---|---|
| Beneficiary create/duplicate/invalid | [`regression-checklist.md`](../regression-checklist.md) TC-002–004 |
| Approval flow | TC-005–007 |
| Single payout by mode | TC-008–010 |
| Status tracking | TC-011 |
| Commercial/GST | TC-013–016 |
| Bulk Payout partial-failure & scoped retry | TC-026–028, derived from [`business-flow.md`](./business-flow.md) |
| Beneficiary Update/Delete | TC-022–025 |
| Retry idempotency (no double-pay) | TC-029–031 |
| Transfer-mode-specific limits & isolation (IMPS/NEFT/RTGS) | TC-032–037 |
| Cross-screen UI consistency | TC-062–067, see [`ui-consistency.md`](./ui-consistency.md) |

## Future Test Coverage (Not Yet in `regression-checklist.md`)

- Automating the newly-documented manual test cases (TC-022–037) — currently manual only; Retry
  idempotency and Bulk Payout partial-failure are the next priority tier given their
  financial-risk profile (see the note in [`../regression-checklist.md`](../regression-checklist.md) section 8)
- End-to-end chained regression test combining Beneficiary → Approval → Bulk Payout → Retry into
  a single continuous journey, rather than testing each in isolation
