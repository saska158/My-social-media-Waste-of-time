# Example Cases

## Dismiss

**Case:** Score 0.1, post claims "streaming has completely killed the art of cinema"
- User history: regular film discussion contributor with no prior flags
- Comments: healthy debate, users sharing different views
- Decision: `dismiss_report`
- Reasoning: Subjective opinion, clearly framed as such. Contested but not false. Healthy discussion followed. Not misinformation.

## Warn

**Case:** Score 0.15, post claims a specific herbal supplement cures a serious illness, no citations provided
- User history: no prior reports
- Comments: one user pushes back with sources, others appear to accept the claim uncritically
- Decision: `warn_user`
- Reasoning: Unsubstantiated health claim with potential to cause harm. Not malicious but dangerous if taken at face value. First offense — warning is appropriate. User should be asked to add sources or remove the claim.

## Remove

**Case:** Score 0.2, post spreading a demonstrably false claim about a public safety event
- User history: 3 prior posts flagged for false claims in the past two months
- Comments: community actively correcting the record with sources and evidence
- Decision: `remove_post`
- Reasoning: Demonstrably false claim about a public safety event. Pattern of misinformation (3 prior instances). Community is correcting it, indicating harm is recognized. Removal is justified.
