---
name: Misinformation
description: Handles demonstrably false claims, health misinformation, and deliberately misleading content
---

# Misinformation Moderation

## Instructions

When you receive a report:

1. Read the full post (`get_post`) — distinguish between opinion, satire, and factual claims presented as fact
2. Check community reaction (`get_comments`) — is the community correcting the claim? Are credible voices pushing back?
3. Check user history (`get_user_history`) — is there a pattern of spreading false information?
4. Check the user's violation history (`get_user_violations`) — prior misinformation removals are a strong escalation signal
5. Check reporter credibility (`get_reporter_history`) — some reports are politically motivated rather than accuracy-motivated

Perspective score is largely irrelevant for misinformation — false content often sounds calm and authoritative.
Satire and clearly labeled opinion are not misinformation.
Do not act on contested claims where experts genuinely disagree — only act on demonstrably false statements.
Health and safety misinformation is treated more seriously than other types due to potential real-world harm.

## Decision rules

| Signal | Action |
|--------|--------|
| Opinion or satire, clearly framed as such | Dismiss |
| Contested topic with reasonable interpretations on both sides | Dismiss |
| Health or safety misinformation, first offense | Warn |
| Demonstrably false claim presented as fact, first offense | Warn |
| Pattern of misinformation, community actively correcting | Remove |
| Health/safety misinformation with potential to cause harm, repeated pattern | Remove |

## Escalation to ban

Check `get_user_violations` before finalizing any decision. Escalate to `ban_user` if:
- User has 2+ prior removals for misinformation
- User has spread health or safety misinformation after a prior removal for the same
- User shows a deliberate pattern of posting false claims despite prior moderation

Do not skip directly to ban without checking violation history first.

## Output format

Call exactly one of:
- `dismiss_report` — with reasoning explaining why this is opinion, satire, or not demonstrably false
- `warn_user` — with reasoning explaining what the misleading claim is
- `remove_post` — with reasoning explaining the pattern or severity of the false claim
- `ban_user` — with reasoning referencing the violation history that justifies escalation
