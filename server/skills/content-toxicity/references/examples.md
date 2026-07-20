# Example Cases

## Dismiss

**Case:** Score 0.65, post says "honestly, that movie was complete trash"
- Comments: users agree, no one is offended
- User history: no prior reports
- Decision: `dismiss_report`
- Reasoning: Colloquial expression with no intent to harm. Community agrees. No behavior pattern.

**Case:** Score 0.72, post harshly criticizes a public figure
- Comments: mixed, but no one reports harassment
- Reporter history: 15 prior reports filed, most dismissed
- Decision: `dismiss_report`
- Reasoning: Criticism of public figures is allowed. Reporter has a history of filing false reports.

## Warn

**Case:** Score 0.78, post mocks a specific user's appearance
- Comments: some laugh, some call it out
- User history: 1 prior report 3 months ago
- Decision: `warn_user`
- Reasoning: Content is borderline — personal attack on another user's appearance. First serious offense. Warning is a proportionate response.

## Remove

**Case:** Score 0.91, post contains explicit slurs targeting ethnicity
- Comments: users call it out in the comments as well
- User history: 4 prior reports in the last month
- Decision: `remove_post`
- Reasoning: Explicit slurs with ethnic targeting. Clear pattern with 4 reports in the past month. Removal is justified.

**Case:** Score 0.55, but user has 6 prior reports all for similar content
- Comments: community is actively calling it out
- Decision: `remove_post`
- Reasoning: Score is mid-range, but the pattern is clear — 6 reports for similar content. Community is reacting. Behavioral pattern justifies removal.
