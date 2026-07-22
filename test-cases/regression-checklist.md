# Payout Engine — Regression Checklist & Test Cases

> Sample regression suite structure with dummy data. Format: ID | Scenario | Steps | Expected Result

## 1. Core Regression Flow

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-001 | Merchant login — valid credentials | 1. Navigate to login 2. Enter valid dummy merchant credentials 3. Submit | Redirected to Dashboard |
| TC-002 | Create beneficiary — valid details | 1. Go to Beneficiary 2. Enter dummy name, account number, IFSC 3. Submit | Beneficiary created with status "Pending Approval" |
| TC-003 | Create beneficiary — duplicate | 1. Submit the same beneficiary details twice | Second attempt rejected as duplicate |
| TC-004 | Create beneficiary — invalid IFSC | 1. Enter a malformed IFSC | Validation error shown, beneficiary not created |
| TC-005 | Approve beneficiary | 1. Login as admin/ops role 2. Approve a pending beneficiary | Status changes to "Approved" |
| TC-006 | Reject beneficiary | 1. Reject a pending beneficiary with a reason | Status changes to "Rejected", reason visible to merchant |
| TC-007 | Payout to unapproved beneficiary | 1. Attempt a payout targeting a beneficiary still "Pending Approval" | Payout blocked with a clear error |
| TC-008 | Payout — IMPS happy path | 1. Select IMPS 2. Enter dummy amount within IMPS limit 3. Submit | Payout initiated, status transitions correctly |
| TC-009 | Payout — NEFT happy path | 1. Select NEFT 2. Enter dummy amount within NEFT limit 3. Submit | Payout initiated, status transitions correctly |
| TC-010 | Payout — RTGS below minimum | 1. Select RTGS 2. Enter an amount below RTGS minimum | Validation error — amount below RTGS minimum |
| TC-011 | Status tracking accuracy | 1. Initiate a payout 2. Poll status repeatedly | Status accurately reflects current state at each poll |
| TC-012 | Report download — CSV | 1. Go to Reports 2. Download CSV for a date range | Downloaded totals match on-screen dashboard totals |

## 2. Beneficiary Lifecycle — Update, Delete, Bulk & Retry

> Closes the gaps flagged in [`docs/feature-modules.md`](../docs/feature-modules.md) — derived
> from [`docs/business-flow.md`](../docs/business-flow.md).

### Beneficiary Update & Delete

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-022 | Update an approved beneficiary's account details | 1. Edit the account number of an already-`Approved` dummy beneficiary | Per defined business rule: either re-triggers `Pending Approval`, or is blocked outright — never silently stays `Approved` with unverified new details |
| TC-023 | Update a beneficiary's non-sensitive field | 1. Edit only the beneficiary's display name (not account/IFSC) | Update succeeds without forcing re-approval, since financial details are unchanged |
| TC-024 | Delete a beneficiary with existing payout history | 1. Delete a dummy beneficiary that has prior successful payouts | Beneficiary is removed from future use, but historical payout reports still show the correct name/account — no broken/blank references |
| TC-025 | Delete a beneficiary with zero history | 1. Delete a dummy beneficiary with no prior payouts | Clean removal, no orphaned references anywhere |

### Bulk Payout Partial-Failure Handling

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-026 | Bulk payout — all succeed | 1. Submit a bulk batch of 5 dummy beneficiaries, all valid | Batch summary shows 5/5 succeeded |
| TC-027 | Bulk payout — partial failure | 1. Submit a batch of 10 where 2 have invalid/unapproved beneficiaries | Batch reports exactly 8 succeeded, 2 failed, each with its own per-item reason — not just an overall "batch failed" |
| TC-028 | Retry after partial failure — scoped correctly | 1. From TC-027's batch, trigger Retry | Only the 2 failed items are re-attempted; the 8 already-successful items are never resubmitted |

### Retry Idempotency (Highest Financial Risk)

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-029 | Retry after confirmed non-completion | 1. A payout fails with a confirmed "not processed" bank response 2. Trigger Retry | Retry safely resubmits, transfer completes normally |
| TC-030 | Retry after ambiguous/uncertain bank response | 1. Simulate a payout with an ambiguous timeout response (test env) 2. Trigger Retry | System verifies actual completion status with the bank rail before resubmitting — never blindly re-sends |
| TC-031 | Retry does not double-pay | 1. Simulate a transfer that actually succeeded on the bank side despite a lost confirmation 2. Trigger Retry | Retry detects the existing successful transfer and does **not** submit a second payment |

## 3. Transfer-Mode-Specific Test Cases

### IMPS

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-032 | IMPS at exactly the per-transaction ceiling | 1. Initiate an IMPS payout at the exact configured limit | Accepted; one paisa above is rejected |
| TC-033 | IMPS mode unavailable | 1. Simulate an IMPS-specific outage (test env) | Clear "IMPS unavailable" error; NEFT/RTGS remain unaffected (mode isolation) |

### NEFT

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-034 | NEFT stays PROCESSING across a long window | 1. Initiate NEFT 2. Poll status repeatedly over an extended simulated delay | Status remains a clear PROCESSING state throughout — never times out into a false FAILED |

### RTGS

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-035 | RTGS at exactly the minimum threshold | 1. Initiate RTGS at the exact configured minimum | Accepted; one paisa below is rejected |
| TC-036 | RTGS outside bank operating hours | 1. Simulate an RTGS attempt outside allowed hours (test env) | Clear operating-hours error; IMPS remains available for the same merchant at the same time |

### Mode Isolation

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-037 | Breaking one mode doesn't affect others | 1. Simulate a defect/outage in RTGS validation only (test env) 2. Attempt IMPS and NEFT payouts in parallel | Both IMPS and NEFT complete normally, fully unaffected by the RTGS-specific issue |

## 4. Commercial & GST Validation

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-013 | Commercial fee — IMPS | 1. Payout ₹1000 via IMPS with defined fee | Fee correctly deducted from merchant ledger |
| TC-014 | Commercial fee — NEFT vs IMPS | 1. Same amount via both modes | Fees differ per mode-specific commercial rule |
| TC-015 | GST on commercial | 1. Commercial fee ₹10, GST 18% | GST = ₹1.80, total deduction = ₹11.80 |
| TC-016 | Ledger debit entry created | 1. Successful payout with commercial | Ledger shows matching debit entry for fee |

## 5. Negative & Edge Cases

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-017 | Duplicate payout request | 1. Submit the same payout request twice rapidly | Second request blocked or correctly deduplicated |
| TC-018 | Unsupported transfer mode for amount | 1. Attempt IMPS for an amount exceeding its limit | Rejected with a clear mode-limit error |
| TC-019 | Permission check — merchant role attempts approval | 1. Login as merchant-role user 2. Attempt to approve a beneficiary | Access denied — approval requires admin/ops role |
| TC-020 | Empty search results | 1. Search payout status with filters matching nothing | "No results found" message, no error |
| TC-021 | Invalid filter combination | 1. Apply an end date earlier than start date | Validation error, search blocked |

## 6. Full Regression Checklist

- [ ] Login
- [ ] Dashboard
- [ ] Beneficiary (Create / Duplicate / Invalid / Update / Delete)
- [ ] Approval Flow
- [ ] Payout — IMPS (limit boundary / outage isolation)
- [ ] Payout — NEFT (long-lived PROCESSING state)
- [ ] Payout — RTGS (minimum boundary / operating hours)
- [ ] Bulk Payout (partial failure / scoped retry)
- [ ] Retry Idempotency (no double-pay)
- [ ] Status Tracking
- [ ] Reports
- [ ] Downloads / Export
- [ ] Commercial Calculation
- [ ] GST Calculation
- [ ] Ledger Entries
- [ ] Permissions / Role-Based Access

## 7. Priority Automation Candidates

1. Login
2. Dashboard
3. Beneficiary
4. Approval
5. Payout
6. Status
7. Reports

These are automated first because they form the primary merchant regression path and are run on
every release — see [`automation/`](../automation) for the Playwright implementation. Retry
idempotency (TC-029–031) and Bulk Payout partial-failure (TC-026–028) are the next priority tier
given their financial-risk profile, currently documented as manual test cases only.
