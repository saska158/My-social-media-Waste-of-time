# Example Cases

## Dismiss

**Case:** Score 0.71, post says "I'm going to kill whoever keeps spoiling shows in this room"
- Comments: users laugh, treat it as obvious venting
- User history: no prior reports, active community member
- Decision: `dismiss_report`
- Reasoning: Clear hyperbole — no specific target, no method, community context confirms it is a joke. Perspective score is elevated by the word "kill" but there is no credible threat here.

**Case:** Score 0.55, post expresses anger at a public figure using aggressive language
- Comments: political debate, no one expressing concern
- User history: no prior violations
- Decision: `dismiss_report`
- Reasoning: Aggressive political opinion directed at a public figure. No specific threat, no method described. Frustration is not a threat.

## Warn

**Case:** Score 0.82, post says "people like [group] deserve what's coming to them"
- Comments: a few people agree, no specific target named
- User history: 1 prior warning for toxic content
- Decision: `warn_user`
- Reasoning: Vague threatening language directed at a group. Not specific enough to remove, but the tone is threatening and the user has a prior warning. Escalation is appropriate if this continues.

## Remove

**Case:** Score 0.88, post names a specific user and says "I know where you live, watch yourself"
- Comments: the named user has responded saying they feel threatened
- User history: 2 prior posts targeting the same user
- Decision: `remove_post`
- Reasoning: Specific threat against a named individual with implied location knowledge. The target has expressed fear. Pattern of targeting the same user. Perspective score 0.88 confirms aggressive tone. Removal is required.

## Ban

**Case:** Score 0.79, post celebrates a violent incident and calls for similar action against a local group
- User history: prior removal for threatening content 1 month ago
- Decision: `ban_user`
- Reasoning: Glorification of real-world violence with a call to action. Prior removal for the same category. Escalation to ban is warranted.
