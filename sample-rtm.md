# Sample Requirement Traceability Matrix — Payout Engine

> Worked example using dummy data. An RTM is referenced throughout this portfolio as a core QA
> artifact — this is what that artifact actually looks like, not just a claim that it exists.
> See [`docs/README.md`](./docs/README.md) for the full documentation map.

## What an RTM Is Actually For

A regression checklist (see [`regression-checklist.md`](./regression-checklist.md)) answers
"what do we test." An RTM answers a different, equally important question: **"does every
business requirement have test coverage, and is that coverage actually sufficient?"** The two
documents look similar but serve different purposes — a checklist is organized by test area; an
RTM is organized by *requirement*, which is what makes it the tool that actually catches a
requirement with **no** test coverage at all, not just a weakly-tested one.

## The Matrix

| Req ID | Requirement (from a sample sprint story) | Linked Test Case(s) | Automation Status | Coverage Status |
|---|---|---|---|---|
| REQ-901 | A new beneficiary starts in Pending Approval and cannot receive payouts until approved | TC-002, TC-007 | Automated | ✅ Covered |
| REQ-902 | Each transfer mode (IMPS/NEFT/RTGS) enforces its own limit boundary independently | TC-032, TC-035 | Manual | ✅ Covered |
| REQ-903 | The commercial fee applied matches the mode actually selected on that specific transaction, never a cached prior mode | TC-013, TC-014 | Manual | ✅ Covered — this is the exact requirement `BUG-PAY-3042` violated |
| REQ-904 | Retry verifies the transfer's true bank-side status before resubmitting, never resubmitting unconditionally | TC-029–031 | Manual | ✅ Covered — this is the exact requirement `BUG-PAY-3081` violated, the module's highest-severity defect |
| REQ-905 | A bulk payout batch reports accurate per-item outcomes, never collapsing a mixed result to a single binary status | TC-026, TC-027, TC-063 | Manual | ✅ Covered — this is the exact requirement `BUG-PAY-3096` violated |
| REQ-906 | Retry after a partial bulk-batch failure only re-attempts the failed items, never the already-successful ones | TC-028 | Manual | ✅ Covered |
| REQ-907 | A direct API call to the payout-initiation endpoint — with no prior UI interaction at all — independently rejects a payout targeting an unapproved beneficiary | TC-007 (UI-driven), TC-066 (wording consistency only) | Manual | ❌ **Gap — no test case calls the API directly, bypassing the UI entirely, to confirm the rejection itself; this is the exact requirement `BUG-PAY-3017` violated, and TC-066 only checks error-message wording assuming the rejection already happens** |
| REQ-908 | The retry ground-truth-verification fix (REQ-904) holds correctly when many retries are processed concurrently, not just one at a time | TC-029–031 (sequential only) | Manual | ❌ **Gap — identified when performance testing was added to this suite; see `docs/tech-and-skills.md` section 5** |

## What the Gaps Actually Caught

This is the part a checklist alone wouldn't surface, because a checklist only tells you about the
tests that already exist:

- **REQ-907** is a subtle but important distinction this RTM surfaces by reading `TC-007` and
  `TC-066` together rather than separately: `TC-007` exercises the block, but as written it's
  ambiguous whether it goes through the UI or calls the API directly — and `TC-066` explicitly
  assumes the API-side rejection *already happens*, testing only that its wording matches the
  UI's. Neither one is actually a test that opens a fresh API session, with zero prior UI
  interaction, and confirms the server independently enforces the approval check — which is
  precisely the gap `BUG-PAY-3017` lived in. Raised as a new story (illustrative ID `PAY-2214`):
  add an API-only test with no UI setup step at all.
- **REQ-908** is a gap this RTM only caught because performance testing was added to this
  suite's scope at all — `TC-029`–`031` prove the ground-truth-verification logic is correct for
  one retry, tested in isolation. None of them say anything about whether that same verification
  step stays reliable when many retries (across different merchants, different payouts) are
  competing for the same bank-rail query capacity simultaneously, which is exactly the condition
  under which a subtle race or timeout-handling gap in that logic would actually have a chance to
  surface.

**The general pattern:** an RTM's value isn't the rows that say "Covered" — those just confirm
existing test design. Its value is specifically the rows that say "Gap," because those are the
requirements a test-case-first workflow (write tests, forget to check them against the original
requirement list) would never have surfaced on its own.
