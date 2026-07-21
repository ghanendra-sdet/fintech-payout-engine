# Payout Engine — Business Overview

> **Start here if you're new to fintech QA, in HR, or from a non-QA technical role.** This
> document explains what a Payout Engine does and why it matters, before you look at any test
> case or code.

## 1. What problem does it solve?

Merchants regularly need to send money out — to vendors, employees, partners, or customers owed
a refund. Doing this manually through a bank's own portal, one transfer at a time, doesn't scale
and has no built-in audit trail tied to the merchant's own business records. The Payout Engine
gives merchants a single place to manage recipients and initiate outbound transfers, with full
tracking and reporting.

## 2. Business Objectives

- Outbound fund transfer to beneficiaries
- Beneficiary management (creation, validation, approval)
- Settlement support
- Merchant and internal reporting
- Commercial (fee) calculation
- GST calculation
- Ledger entries for every transfer
- Audit trail

## 3. Supported Transfer Modes

| Mode | Characteristics |
|---|---|
| **IMPS** | Near-instant settlement, lower per-transaction limits |
| **NEFT** | Batch-settled, broad bank support, moderate limits |
| **RTGS** | For high-value transfers, often has a minimum amount |

Each mode has **independent limits and commercial rules** — the same transfer amount can be
valid on one mode and rejected on another, which is a key source of edge cases.

## 4. Major Functional Areas

### Merchant Journey
- Login
- Dashboard
- Beneficiary
- Payout
- Status
- Reports

### Admin Responsibilities
- Merchant onboarding
- Payout activation
- Commercial configuration
- Beneficiary approval
- Audit logs
- Reports

## 5. Glossary

| Term | Meaning |
|---|---|
| **Beneficiary** | The recipient of an outbound transfer — must typically be approved before receiving funds |
| **Payout** | An outbound transfer of funds from a merchant to a beneficiary |
| **IMPS / NEFT / RTGS** | Bank transfer rail options, each with its own speed, limits, and rules |
| **Approval Flow** | The permission gate a new beneficiary (or high-value payout) must pass before funds can move |
| **Ledger** | The auditable record of every outbound debit |
| **Commercial** | The platform's fee for processing a payout |

## 6. Why Beneficiary Management Is the Highest-Risk Area

A Collection Engine defect might mean a merchant is credited the wrong amount — annoying, but
correctable by re-crediting. A Payout Engine defect that lets funds go to the **wrong or an
unapproved beneficiary** is a much harder problem: the money has already left, and getting it
back depends on the recipient's cooperation, not a system fix.

This is why:
- Beneficiary creation is validated strictly (duplicate detection, format validation)
- An **approval step** exists before a new beneficiary can receive funds
- Permission and role-based access checks around who can approve a beneficiary or authorize a
  payout are treated as core regression scenarios, not edge cases

## 7. Cross-Module Dependencies

The Payout Engine conceptually depends on / interacts with:

- **Connected Banking** — for the actual outbound money movement
- **Merchant Dashboard** — for initiation and monitoring
- **Admin Portal** — for configuration and beneficiary approval
- **Ledger & Commercial Engine** — for fee calculation and audit trail
- **Reports** — for merchant and internal analytics

See [`architecture-and-flow.md`](./architecture-and-flow.md) for the detailed flow diagrams.
