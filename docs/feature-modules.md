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
| Beneficiary create/duplicate/invalid | [`test-cases/regression-checklist.md`](../test-cases/regression-checklist.md) TC-002–004 |
| Approval flow | TC-005–007 |
| Single payout by mode | TC-008–010 |
| Status tracking | TC-011 |
| Commercial/GST | TC-013–016 |
| Bulk Payout | Candidate for expansion — see below |
| Beneficiary Update/Delete | Candidate for expansion — see below |

## Future Test Coverage (Not Yet in `test-cases/`)

- Bulk Payout partial-failure handling (per-item status, scoped retry)
- Beneficiary Update — does editing an approved beneficiary require re-approval?
- Beneficiary Delete — what happens to payout history referencing a deleted beneficiary?
- Retry Service — idempotency (does a retry ever create a duplicate transfer?)
