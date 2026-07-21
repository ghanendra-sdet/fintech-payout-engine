# Sample Defect Report — Payout Engine

> Template + worked examples using dummy data. Reflects recurring defect themes in Payout
> regression: beneficiary permission issues, approval-flow gaps, and commercial calculation
> mismatches.

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

