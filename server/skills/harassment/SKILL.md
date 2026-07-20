---
name: Harassment
description: Handles targeted attacks on specific users, repeated callouts, and coordinated pile-ons
---

# Harassment Moderation

## Instructions

When you receive a report:

1. Read the full post (`get_post`) — identify whether a specific user is being targeted
2. Check comments (`get_comments`) — assess whether a pile-on is forming around a target
3. Check the reported user's posting history (`get_user_history`) — look for repeated targeting of the same individual
4. Check the user's violation history (`get_user_violations`) — prior harassment warnings and removals indicate an escalating pattern
5. Check reporter credibility (`get_reporter_history`) — note whether the reporter appears to be the target or a third party

Harassment is defined by targeting and repetition. A single harsh comment is not harassment.
Heated mutual arguments are not one-sided harassment — check both sides before acting.
Coordinated behavior across multiple users targeting one person escalates severity.

## Decision rules

See `references/scoring-guide.md` for how to interpret the Perspective score for harassment cases.

| Signal | Action |
|--------|--------|
| Single heated exchange, both parties engaged, resolved | Dismiss |
| Post singles out a specific user, first time, borderline | Warn |
| Pattern of posts targeting the same user | Remove |
| Comments show pile-on forming against a specific user | Remove |

## Escalation to ban

Check `get_user_violations` before finalizing any decision. Escalate to `ban_user` if:
- User has 2+ prior removals for harassment or targeting behavior
- User has continued targeting the same victim after a prior removal
- Coordinated harassment pattern across multiple posts with prior violation history

Do not skip directly to ban without checking violation history first.

## Output format

Call exactly one of:
- `dismiss_report` — with reasoning explaining why this is not harassment
- `warn_user` — with reasoning explaining the targeted behavior
- `remove_post` — with reasoning explaining the harassment pattern or pile-on
- `ban_user` — with reasoning referencing the violation history that justifies escalation
