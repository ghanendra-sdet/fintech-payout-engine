# Payout Engine — Regression Execution Summary (Sample)

> Representative regression execution report for portfolio purposes. Figures are illustrative,
> not tied to any specific company's release cycle.

## Execution Overview

| Metric | Value |
|---|---|
| Test Cycle | Sample Release Regression |
| Total Test Cases Executed | 68 |
| Passed | 64 |
| Failed | 3 |
| Blocked | 1 |
| Pass Rate | 94.1% |

## Results by Area

| Area | Test Cases | Passed | Failed | Notes |
|---|---|---|---|---|
| Login & Dashboard | 8 | 8 | 0 | — |
| Beneficiary Management | 14 | 12 | 2 | Duplicate-detection edge case failed (see BUG-PAY-3017-style defect) |
| Approval Flow | 10 | 9 | 1 | API-level approval enforcement gap found |
| Payout — IMPS/NEFT/RTGS | 18 | 17 | 0 | 1 blocked — RTGS test environment limit not configured |
| Status Tracking | 8 | 8 | 0 | — |
| Reports & Downloads | 6 | 6 | 0 | — |
| Commercial & GST | 4 | 4 | 0 | — |

## Defect Summary

| Severity | Count |
|---|---|
| Critical | 1 |
| Major | 1 |
| Minor | 1 |

## Conclusion

The regression cycle surfaced one critical defect related to API-level approval enforcement
(consistent with the beneficiary-approval risk area this module is designed around) and one
major commercial-calculation defect. Both were prioritized for fix-and-retest before sign-off,
consistent with this module's testing priority order: **beneficiary safety and financial
correctness first**.

**See also:** [`docs/business-overview.md`](./docs/business-overview.md) section 6 for why
beneficiary safety is prioritized this way, and [`sample-defect-report.md`](./sample-defect-report.md)
for the full worked defect examples.
