# Payout Engine — Architecture & Flow

## Merchant Regression Flow (Primary End-to-End Scenario)

```
┌────────┐   ┌───────────┐   ┌──────────────┐   ┌────────────┐
│ Login  │──▶│ Dashboard │──▶│ Beneficiary  │──▶│  Approval  │
└────────┘   └───────────┘   └──────────────┘   └──────┬──────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │   Payout    │
                                                 └──────┬───────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │   Status    │
                                                 └──────┬───────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │   Reports   │
                                                 └─────────────┘
```

## Beneficiary Approval Flow (Highest-Risk Path)

```
Create Beneficiary
      │
      ▼
Validate Details (format, duplicate check)
      │
      ├──▶ Invalid / Duplicate ──▶ Rejected, merchant notified
      │
      ▼
Pending Approval
      │
      ▼
Admin/Ops Review
      │
      ├──▶ Rejected ──▶ Beneficiary remains unusable for payouts
      │
      ▼
Approved ──▶ Beneficiary eligible to receive payouts
```

**Testing implication:** a payout attempted against a beneficiary that is `Pending Approval` or
`Rejected` must always be blocked — this boundary is tested as rigorously as the payout itself.

## Payout Transfer Flow by Mode

```
                         ┌───────────────┐
                         │ Select Mode   │
                         └───────┬────────┘
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
           ┌──────────┐   ┌──────────┐    ┌──────────┐
           │   IMPS   │   │   NEFT   │    │   RTGS   │
           │ (instant,│   │ (batch,  │    │ (high-   │
           │ lower    │   │ moderate │    │ value,   │
           │ limit)   │   │ limit)   │    │ min amt) │
           └─────┬────┘   └────┬─────┘    └────┬─────┘
                 └───────────────┼───────────────┘
                                 ▼
                     ┌────────────────────┐
                     │ Mode-Specific Limit │
                     │     Validation      │
                     └──────────┬───────────┘
                                ▼
                     ┌────────────────────┐
                     │  Commercial / GST   │
                     │     Calculation     │
                     └──────────┬───────────┘
                                ▼
                     ┌────────────────────┐
                     │   Ledger Entry      │
                     └──────────┬───────────┘
                                ▼
                     ┌────────────────────┐
                     │  Status: Initiated  │
                     │  → Processing →     │
                     │  Success / Failed   │
                     └────────────────────┘
```

## Admin Flow

```
Merchant Onboarding ──▶ Payout Activation ──▶ Commercial Configuration
                                                       │
                                                       ▼
                                          Beneficiary Approval Queue
                                                       │
                                                       ▼
                                               Audit Logs / Reports
```

## System Interaction Map

```
   ┌────────────┐   ┌────────────────┐   ┌─────────────────────┐
   │  Merchant  │──▶│  Payout Engine │──▶│  Connected Banking   │
   │ (initiates │   │                │   │  (outbound transfer) │
   │  payout)   │   └───────┬─────────┘   └─────────────────────┘
   └────────────┘           │
                             ▼
                  ┌─────────────────────┐
                  │ Commercial Engine   │
                  │  (fee + GST calc)   │
                  └──────────┬───────────┘
                             ▼
                  ┌─────────────────────┐
                  │       Ledger        │
                  │   (audit trail)     │
                  └──────────┬───────────┘
                             ▼
                  ┌─────────────────────┐
                  │      Reporting      │
                  └─────────────────────┘
```

## Why the Flow Order Matters for Testing

Every step depends on state built by the previous one:

1. **Beneficiary** must exist and pass validation before it can enter approval
2. **Approval** must succeed before a payout can target that beneficiary
3. **Payout** must respect the selected mode's limits and commercial rules
4. **Status** must accurately reflect the true state of the transfer at every poll
5. **Reports** must match ledger and status data exactly — no drift on export

This is why the Payout regression suite (manual and automated) walks the full path in order,
with particular emphasis on the beneficiary → approval boundary, since it's the step with the
least room for error.
