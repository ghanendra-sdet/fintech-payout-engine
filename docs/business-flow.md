# Payout Engine — User & Business Flow

> While [`architecture-and-flow.md`](./architecture-and-flow.md) documents the internal QA/
> regression path through the merchant dashboard, this document covers the **actual end-to-end
> business flow** — what happens from the moment a merchant adds a beneficiary to the moment
> funds land, from every actor's point of view.

## Actors

| Actor | Role in the flow |
|---|---|
| **Merchant** | The business initiating payouts, managing beneficiaries, and monitoring status |
| **Beneficiary** | The recipient of funds — vendor, employee, partner, or refund recipient |
| **Admin / Ops** | Approves beneficiaries, configures commercials, monitors settlement |
| **Payout Engine** | Orchestrates beneficiary lifecycle, transfer execution, commercial calculation, ledger |
| **Bank Rail (IMPS / NEFT / RTGS)** | The external system that actually moves the money |

---

## 1. End-to-End Business Flow (High Level)

```
Merchant adds a beneficiary
        │
        ▼
Beneficiary Verification (format/account checks, e.g. penny-drop style validation)
        │
        ▼
Beneficiary Approval (admin/ops permission gate)
        │
        ▼
Merchant initiates a payout against an APPROVED beneficiary
        │
        ▼
Transfer Mode Selected (IMPS / NEFT / RTGS) — mode-specific validation applied
        │
        ▼
Bank Rail processes the transfer
        │
        ▼
Payout Engine receives confirmation, updates status (SUCCESS / FAILED)
        │
        ▼
Commercial Engine calculates fee + GST
        │
        ▼
Ledger records the transaction and fee entries
        │
        ▼
Settlement reconciles the cycle
        │
        ▼
Merchant sees updated status, beneficiary payout history, and reports
```

**Testing implication:** the beneficiary approval gate is a **one-way door test point** — once
approved, a beneficiary can receive money. Every downstream step assumes that gate was enforced
correctly, which is why approval-flow testing carries more weight here than almost anywhere else
in the platform.

---

## 2. Beneficiary Lifecycle Business Flow

```
Add Beneficiary (name, account number, IFSC)
        │
        ▼
Beneficiary Verification Service
   (format checks + external validation, e.g. penny-drop)
        │
        ├──▶ Verification fails ──▶ Beneficiary remains unusable, merchant notified
        │
        ▼
Beneficiary Approval Service (admin/ops review)
        │
        ├──▶ Rejected ──▶ Beneficiary remains unusable, reason shown to merchant
        │
        ▼
APPROVED — beneficiary can now receive payouts
        │
        ├──▶ Beneficiary Update Service ──▶ Does editing require re-approval? (business-rule
        │                                    decision point — must be explicit, not assumed)
        │
        └──▶ Beneficiary Delete Service ──▶ What happens to existing payout history
                                             referencing this beneficiary? (referential
                                             integrity, not a hard delete of financial records)
```

**Key test scenarios:** a beneficiary edited after approval (does the amount/account number
change silently bypass re-verification?), a beneficiary deleted after being used in past
payouts (historical reports must still show the correct name/account, even though the live
beneficiary record is gone).

---

## 3. Business Flow by Transfer Mode

Each rail has a genuinely different processing model, not just a different label.

### 3.1 IMPS

```
Merchant selects IMPS, enters amount (within IMPS limit)
        │
        ▼
Near-instant transfer request sent to the bank rail
        │
        ▼
Confirmation typically received within seconds
        │
        ▼
Status: SUCCESS or FAILED — rarely stays PROCESSING for long
```

**Key test scenarios:** amount at/above IMPS's per-transaction ceiling, IMPS unavailable
(some banks have IMPS-specific downtime windows independent of NEFT/RTGS availability).

### 3.2 NEFT

```
Merchant selects NEFT, enters amount
        │
        ▼
Transfer queued for the next NEFT settlement batch (banks process NEFT in batches, not
instantly, even though most banks now run near-continuous batches)
        │
        ▼
Status: PROCESSING until the batch clears
        │
        ▼
Status: SUCCESS or FAILED once the batch confirms
```

**Key test scenarios:** a transaction that stays PROCESSING across a shift/day boundary (does
status polling handle a long-lived PROCESSING state correctly, without timing out or showing a
false failure?).

### 3.3 RTGS

```
Merchant selects RTGS, enters amount (must meet RTGS minimum threshold)
        │
        ▼
Amount below minimum ──▶ Rejected before submission (RTGS exists specifically for
                          high-value transfers)
        │
        ▼
Amount valid ──▶ Real-time gross settlement — processed individually, not batched
        │
        ▼
Status: SUCCESS or FAILED, typically fast but with bank operating-hours constraints
```

**Key test scenarios:** amount exactly at the minimum threshold (boundary test), RTGS attempted
outside bank operating hours (some banks restrict RTGS windows even though IMPS runs 24/7).

### Why Mode Isolation Matters for Testing

IMPS, NEFT, and RTGS are modeled as **separate services** behind a shared validation layer
specifically so that a defect in one mode's logic (e.g. RTGS minimum-amount validation) cannot
leak into another mode's behavior. Regression should periodically run an explicit **isolation
check** — break one mode intentionally in a test environment and confirm the other two are
completely unaffected — rather than just assuming the separation holds.

---

## 4. Bulk Payout Business Flow

```
Merchant uploads/selects multiple beneficiaries for a single bulk payout submission
        │
        ▼
Bulk Payout Service splits the batch into individual transfer requests
        │
        ▼
Each transfer processes independently (mode validation, commercial calc, bank rail submission)
        │
        ├──▶ Item succeeds ──▶ Marked SUCCESS in the batch report
        │
        └──▶ Item fails ──▶ Marked FAILED in the batch report, with its own reason
        │
        ▼
Batch-level summary shown to merchant: e.g. "8 of 10 succeeded"
        │
        ▼
Merchant can Retry — scoped to only the FAILED items, not the entire batch
```

**Key test scenarios:** a batch with a mix of outcomes must report **per-item** status, not just
a batch-level pass/fail; Retry must never re-attempt already-successful items (which would risk
a duplicate transfer to those beneficiaries).

---

## 5. Retry Business Flow (Idempotency)

```
A payout fails or gets stuck (e.g. bank timeout, ambiguous response)
        │
        ▼
Merchant (or system) triggers Retry
        │
        ▼
Retry Service checks: was the original transfer actually completed on the bank side,
despite the ambiguous/failed status on our side?
        │
        ├──▶ Confirmed NOT completed ──▶ Safe to re-submit the transfer
        │
        └──▶ Confirmed or uncertain ──▶ Must NOT blindly re-submit — risk of a duplicate
                                          real-money transfer to the beneficiary
```

**This is the highest financial-risk flow in the entire module.** A naive retry implementation
that just "tries the request again" can double-pay a beneficiary if the original transfer had
actually succeeded but the confirmation was lost or delayed. Retry logic must be able to prove a
transfer didn't happen before resubmitting — not just assume it didn't.

---

## 6. Settlement Business Flow

```
Successful payouts accumulate against a merchant
        │
        ▼
Settlement Service reconciles transfer records against bank-side confirmations
        │
        ▼
Commercial fees + GST are finalized per transaction
        │
        ▼
Ledger entries are locked for the settlement cycle
        │
        ▼
Settlement Report becomes available, reconciling to payout-level data
```

---

## 7. Merchant Onboarding Business Flow (Before Any of the Above Is Possible)

```
Merchant signs up / is onboarded
        │
        ▼
Merchant Verification (KYC/KYB, business documents)
        │
        ▼
Admin approval
        │
        ▼
Payout service activation
        │
        ▼
Commercial configuration assigned (fee slabs per transfer mode, GST handling)
        │
        ▼
Merchant can now add beneficiaries and initiate live payouts
```

---

## 8. Why This View Matters for Test Design

The regression-path view in `architecture-and-flow.md` answers *"does the dashboard correctly
show what already happened?"* — this document answers *"does the system correctly handle every
real-world path money can take on the way out?"* The highest-value, hardest-to-find defects in
this module live in the branches documented above: an approval bypass, a mode-isolation leak, a
bulk-batch partial failure reported incorrectly, or — the single most dangerous case — a retry
that creates a duplicate transfer. These are the primary source for the edge cases in
[`test-cases/regression-checklist.md`](../test-cases/regression-checklist.md).
