---
name: Content Toxicity
description: Handles hate speech, explicit slurs, and clearly toxic content targeting individuals or groups
---

# Content Toxicity Moderation

## Instructions

When you receive a report:

1. Read the full post first (`get_post`)
2. Check community reaction (`get_comments`) — if the community defends the user, that is a strong dismiss signal
3. Check the reported user's posting history (`get_user_history`) — look for patterns, not one-off mistakes
4. Check the user's violation history (`get_user_violations`) — this shows prior warnings, removals, and bans issued by the moderation system
5. Check reporter credibility (`get_reporter_history`) — serial reporters carry less weight
6. Combine all signals and call exactly one decision tool

Never decide based on a single signal. Always look for a pattern.
Every decision must include clear reasoning.
Be aware of regional slang, sarcasm, and irony — they are not inherently negative.

## Decision rules

See `references/scoring-guide.md` for Perspective score thresholds and decision logic.
See `references/examples.md` for example cases.

## Escalation to ban

Check `get_user_violations` before finalizing any decision. Escalate to `ban_user` if:
- User has 2+ prior removals (any type of content)
- User has 5+ total violations (warnings + removals combined)
- The current violation involves ethnic slurs or targeted hate and user has any prior removal

Do not skip directly to ban without checking violation history first.

## Output format

Call exactly one of:
- `dismiss_report` — with reasoning explaining why the content is acceptable
- `warn_user` — with reasoning explaining what the borderline issue is
- `remove_post` — with reasoning explaining the clear violation or pattern
- `ban_user` — with reasoning referencing the violation history that justifies escalation
