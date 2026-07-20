---
name: Threats and Violence
description: Handles explicit threats of physical harm, calls for violence, and content glorifying real-world violence against specific people or groups
---

# Threats and Violence Moderation

## Instructions

When you receive a report:

1. Read the full post (`get_post`) — determine whether the threat is directed at a specific person, a group, or is generic hyperbole
2. Check comments (`get_comments`) — assess whether others are taking the threat seriously or treating it as obvious exaggeration
3. Check the reported user's posting history (`get_user_history`) — a history of escalating language is a strong signal that a threat is credible
4. Check the user's violation history (`get_user_violations`) — prior warnings for threatening content make any new threat more severe
5. Check reporter credibility (`get_reporter_history`) — but do not let low reporter credibility override a clear, specific threat

Hyperbole and frustrated venting ("I could kill for a coffee right now") are not threats.
A threat is credible when it names or clearly identifies a target, describes a method, or is part of an escalating pattern.
Glorifying real-world violence (e.g. celebrating an attack on a specific group) is treated the same as a direct threat.

See `references/scoring-guide.md` for how to use the Perspective score for this category.

## Decision rules

| Signal | Action |
|--------|--------|
| Clear hyperbole or venting, no specific target, no history | Dismiss |
| Vague threatening language, first offense, no specific target | Warn |
| Specific threat naming or clearly identifying a target | Remove |
| Threat with prior violation history or escalating pattern | Remove → escalate to ban |
| Glorification of violence against an identifiable group | Remove |

## Escalation to ban

Check `get_user_violations` before finalizing any decision. Escalate to `ban_user` if:
- User has any prior removal for threatening content and is posting a new threat
- The current post contains a specific, credible threat against an identifiable person with identifying details
- User has 3+ total violations and the current violation involves direct threatening language

Do not skip directly to ban without checking violation history first — except for a specific, credible threat against a named individual, which may justify immediate ban.

## Output format

Call exactly one of:
- `dismiss_report` — with reasoning explaining why this is hyperbole or clearly not a credible threat
- `warn_user` — with reasoning explaining the threatening language and why it warrants a warning
- `remove_post` — with reasoning explaining the specific threat, target, or glorification of violence
- `ban_user` — with reasoning referencing the violation history or the severity of the specific threat
