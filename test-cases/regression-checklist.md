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

## 2. Commercial & GST Validation

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-013 | Commercial fee — IMPS | 1. Payout ₹1000 via IMPS with defined fee | Fee correctly deducted from merchant ledger |
| TC-014 | Commercial fee — NEFT vs IMPS | 1. Same amount via both modes | Fees differ per mode-specific commercial rule |
| TC-015 | GST on commercial | 1. Commercial fee ₹10, GST 18% | GST = ₹1.80, total deduction = ₹11.80 |
| TC-016 | Ledger debit entry created | 1. Successful payout with commercial | Ledger shows matching debit entry for fee |

## 3. Negative & Edge Cases

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-017 | Duplicate payout request | 1. Submit the same payout request twice rapidly | Second request blocked or correctly deduplicated |
| TC-018 | Unsupported transfer mode for amount | 1. Attempt IMPS for an amount exceeding its limit | Rejected with a clear mode-limit error |
| TC-019 | Permission check — merchant role attempts approval | 1. Login as merchant-role user 2. Attempt to approve a beneficiary | Access denied — approval requires admin/ops role |
| TC-020 | Empty search results | 1. Search payout status with filters matching nothing | "No results found" message, no error |
| TC-021 | Invalid filter combination | 1. Apply an end date earlier than start date | Validation error, search blocked |

## 4. Full Regression Checklist

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

## 5. Priority Automation Candidates

1. Login
2. Dashboard
3. Beneficiary
4. Approval
5. Payout
6. Status
7. Reports

These are automated first because they form the primary merchant regression path and are run on
every release — see [`automation/`](../automation) for the Playwright implementation.
