# Payout Engine — Service Architecture (Behind the Scenes)

> A distributed system view of the Payout Engine, useful for understanding integration test
> boundaries. Complements [`feature-modules.md`](./feature-modules.md) with the service-level
> decomposition behind each screen.

## Why This View Matters for QA

Beneficiary management alone spans five distinct services (Creation, Update, Delete, Approval,
Verification/Validation) rather than one generic CRUD service. Knowing this boundary map speeds
up defect triage — is a "beneficiary stuck in pending" bug an Approval Service issue, or did
Verification never complete?

## Service Groups

### Identity & Merchant
- Authentication Service
- Merchant Validation Service

### Beneficiary Lifecycle
- Beneficiary Service
- Beneficiary Creation Service
- Beneficiary Update Service
- Beneficiary Delete Service
- Beneficiary Approval Service
- Beneficiary Verification Service
- Beneficiary Validation Service

### Payout Execution
- Payout Dashboard Service
- Single Payout Service
- Bulk Payout Service
- Payout Status Service
- Retry Service

### Transfer Mode Services (one per rail)
- IMPS Service
- NEFT Service
- RTGS Service
- Transfer Validation Service
- Bank Account Validation Service

### Financial Correctness
- Merchant Commercial Service
- Commercial Calculation Service
- GST Calculation Service
- Fee Calculation Service
- Ledger Service
- Settlement Service
- Reconciliation Service

### Reporting
- Reports Service
- Payout Report Service
- Transaction Report Service
- Beneficiary Report Service
- Export Service
- Download Service

### Platform Cross-Cutting Services
- Search Service
- Filter Service
- Audit Log Service
- Activity Log Service
- Notification Service
- API Validation Service

## Why Beneficiary Lifecycle Has Five Separate Services

Splitting Creation, Update, Delete, Approval, and Verification into distinct services (rather
than one "beneficiary manager") reflects that each has a different risk profile:

- **Creation** and **Update** need duplicate/format validation
- **Approval** is a permission gate with its own audit requirements
- **Verification** may call out to an external validation source (e.g. penny-drop style checks)
- **Delete** has to consider referential integrity against payout history

Testing each as an independent service boundary (rather than one big "beneficiary" test) is what
surfaces defects like *"an approved beneficiary can still be edited without re-triggering
approval"* — a gap between the Update Service and Approval Service that a monolithic test would
likely miss.

## Why Transfer Modes Are Separate Services

IMPS, NEFT, and RTGS each have independent limits, cut-off times, and commercial rules — modeling
them as separate services (behind a shared Transfer Validation Service) means a defect in RTGS
minimum-amount validation shouldn't be able to affect IMPS at all. Regression should periodically
verify this isolation explicitly, not just assume it.

## Integration Test Boundaries (Suggested)

| Boundary | What to Verify |
|---|---|
| Beneficiary Creation → Verification → Approval | A beneficiary cannot reach "Approved" without passing Verification first |
| Approval Service → Payout Services | Payout Services must re-check approval status at execution time, not just at selection time |
| Transfer Mode Service → Commercial Calculation Service | Each mode's fee is calculated using that specific mode, never a cached "last used mode" (see [`bug-reports/`](../bug-reports)) |
| Bulk Payout Service → Payout Status Service | Partial batch failures report per-item status, not just an overall batch status |
