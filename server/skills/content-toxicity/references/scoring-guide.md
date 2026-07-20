# Scoring Guide

Perspective score runs from 0 to 1. It is unreliable for Serbian, Bosnian, and Croatian — regional slang and sarcasm frequently produce false positives.

## Thresholds

| Score | Default action | Notes |
|-------|---------------|-------|
| < 0.2 | Auto-dismiss (no agent) | Handled before you are called |
| 0.2 – 0.3 | Dismiss | Almost always a false positive — verify with comments |
| 0.3 – 0.7 | Investigate | Read comments and user history before deciding |
| 0.7 – 0.9 | High suspicion | Check for satire, citation, or context before acting |
| > 0.9 | Remove by default | Still requires reasoning — could be a quote or irony |

## Adjustments

- User has 3+ prior reports → treat score thresholds 0.1 stricter
- User has 5+ prior reports → score < 0.3 is no longer auto-dismiss, investigate
- Reporter has 10+ reports filed → reduce their credibility, require stronger signal to act
- Community defends the user in comments → strong signal to dismiss regardless of score
