# Sample Defect Report — Payout Engine

> Template + worked examples using dummy data. Reflects recurring defect themes in Payout
> regression.

## Defect Theme Taxonomy

Recurring defect themes tracked for this module:

- Beneficiary permission issues
- Approval-flow gaps
- Commercial calculation mismatches
- API validation defects
- Dashboard issues
- Report inconsistencies
- Export/download issues
- Search/filter issues
- Bulk-batch reporting issues (per-item status accuracy)
- Retry idempotency failures (highest-severity theme — risk of duplicate real-money transfer)

**Severity categories used:** Minor, Major, Critical, Blocker.

---

## Defect #1

| Field | Value |
|---|---|
| **ID** | BUG-PAY-3017 (sample) |
| **Title** | Payout succeeds via API against a beneficiary still "Pending Approval" |
| **Severity** | Critical |
| **Module** | Payout → Beneficiary / Approval |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Create a dummy beneficiary via the API — leave it unapproved
2. Call the payout initiation endpoint directly, targeting that beneficiary
3. Observe the response

**Expected Result**
The API should reject the payout with a clear "Beneficiary not approved" error — the same check
enforced in the UI must also be enforced at the API layer.

**Actual Result**
The API accepts the request and the payout proceeds to processing, bypassing the approval gate
entirely. The UI correctly blocks this same action, but the API does not.

**Impact**
This is the highest-severity class of defect for this module: funds can be sent to an
unvetted beneficiary, which is very difficult to reverse. The approval workflow exists
specifically to prevent this.

**Suggested Fix**
Enforce the beneficiary approval-status check at the service/API layer, not only in the UI, so
every entry point behaves consistently.

---

## Defect #2

| Field | Value |
|---|---|
| **ID** | BUG-PAY-3042 (sample) |
| **Title** | NEFT commercial fee applied for an IMPS transaction |
| **Severity** | Major |
| **Module** | Payout → Commercial Engine |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Initiate a payout via IMPS for ₹1000 (IMPS fee configured as ₹5)
2. Check the fee deducted from the merchant's ledger

**Expected Result**
₹5 (the IMPS-specific fee) should be deducted.

**Actual Result**
₹8 is deducted — the NEFT fee slab was applied instead, because the commercial engine defaults
to the merchant's most recently used mode rather than reading the mode selected on this specific
transaction.

**Impact**
Merchants are incorrectly billed depending on transaction order, not the actual mode used —
a direct financial-correctness and trust issue.

**Suggested Fix**
Pass the selected transfer mode explicitly into the commercial calculation call for every
transaction, rather than relying on any cached/last-used mode state.

---

## Defect #3

| Field | Value |
|---|---|
| **ID** | BUG-PAY-3081 (sample) |
| **Title** | Retry re-submits a payout that had already succeeded on the bank side |
| **Severity** | Blocker |
| **Module** | Payout → Retry Service |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Initiate a dummy payout; simulate the bank confirmation being delayed/lost so the platform
   shows status `FAILED` even though the bank actually completed the transfer
2. Trigger Retry on that "failed" payout
3. Check the beneficiary's total received amount

**Expected Result**
Retry should verify the transfer's true status with the bank rail before resubmitting. Since the
original transfer actually succeeded, Retry should detect this and refuse to resubmit.

**Actual Result**
Retry resubmits unconditionally based on the platform's local `FAILED` status, without
re-checking with the bank. The beneficiary receives the amount twice.

**Impact**
This is the single most severe defect class in the Payout Engine — real money is sent twice to
a beneficiary, and recovering an overpayment from an external party is far harder than fixing a
software bug. This is why Retry idempotency is treated as the highest-priority test scenario in
this module (see `docs/business-flow.md` section 5).

**Suggested Fix**
Before any retry, query the bank rail (or an authoritative internal reconciliation source) for
the transfer's actual completion status. Only resubmit if that check confirms the original
transfer did not go through.

---

## Defect #4

| Field | Value |
|---|---|
| **ID** | BUG-PAY-3096 (sample) |
| **Title** | Bulk payout batch summary shows "Failed" even though 8 of 10 items succeeded |
| **Severity** | Major |
| **Module** | Payout → Bulk Payout |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Submit a dummy bulk payout batch of 10 beneficiaries, where 2 have invalid account details
2. Wait for batch processing to complete
3. View the batch summary

**Expected Result**
The summary should show a per-item breakdown: 8 succeeded, 2 failed, each with its own reason —
matching the actual per-item outcomes.

**Actual Result**
The batch-level status shows a single "Failed" badge for the whole batch, even though 8 items
completed successfully. The per-item detail view (one click deeper) does show the correct
individual statuses, but the top-level summary is misleading.

**Impact**
A merchant glancing at "Failed" may assume no payments went through and re-submit the entire
batch, risking duplicate payments to the 8 beneficiaries that already succeeded.

**Suggested Fix**
Batch-level status should reflect a mixed-outcome state distinctly (e.g. "8/10 Succeeded") rather
than collapsing to a binary Success/Failed label whenever any item fails.

---

## Defect Reporting Template (blank)

| Field | Value |
|---|---|
| **ID** | |
| **Title** | |
| **Severity** | Minor / Major / Critical / Blocker |
| **Module** | |
| **Environment** | |

**Steps to Reproduce**
1.
2.
3.

**Expected Result**


**Actual Result**


**Impact**


**Suggested Fix**

