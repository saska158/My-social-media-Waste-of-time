const Anthropic = require('@anthropic-ai/sdk')
const { buildSystemPrompt } = require('./prompts')
const { TOOL_DEFINITIONS, executeTool } = require('./tools')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DECISION_TOOLS = new Set(['dismiss_report', 'warn_user', 'remove_post', 'ban_user'])
const CONTEXT_TOOLS = new Set(['get_post', 'get_comments', 'get_user_history', 'get_user_violations', 'get_reporter_history'])

const TOOL_LABELS = {
  get_post: 'Fetching post content',
  get_comments: 'Reading community reaction',
  get_user_history: 'Checking post history',
  get_user_violations: 'Checking violation history',
  get_reporter_history: 'Checking reporter credibility',
  dismiss_report: 'Dismissing report',
  warn_user: 'Issuing warning',
  remove_post: 'Removing post',
  ban_user: 'Banning user',
}

const summarizeResult = (toolName, result) => {
  if (result?.error) return `Error: ${result.error}`
  switch (toolName) {
    case 'get_post': return 'Post fetched'
    case 'get_comments': return `${result.length} comment${result.length !== 1 ? 's' : ''}`
    case 'get_user_history': return `${result.length} post${result.length !== 1 ? 's' : ''} found`
    case 'get_user_violations': return `${result.total} violation${result.total !== 1 ? 's' : ''}: ${result.totalWarnings}W / ${result.totalRemovals}R / ${result.totalBans}B`
    case 'get_reporter_history': return `${result.totalReports} report${result.totalReports !== 1 ? 's' : ''} filed`
    default: return result?.success ? 'Done' : 'Unknown'
  }
}

const runModerationAgent = async ({ reportId, postId, room, reportedBy, creatorUid, perspectiveScore, postText, skillName, highToxicityHint, lowToxicityHint, emit = () => {} }) => {
  const systemPrompt = buildSystemPrompt(skillName)

  let initialContent = `New moderation report.

Report ID: ${reportId}
Post ID: ${postId}
Room: ${room}
Post author (UID): ${creatorUid}
Reported by (UID): ${reportedBy}
Perspective score: ${perspectiveScore}
Post text: "${postText}"

Analyze the context and make a decision.`

  if (highToxicityHint) {
    initialContent += `\n\nNote: Perspective score is ${perspectiveScore} — this is a very high toxicity signal. Unless you find strong mitigating context (satire, regional expression, demonstrable false positive), removal is the expected outcome.`
  }

  if (lowToxicityHint) {
    initialContent += `\n\nNote: Perspective score is ${perspectiveScore} — this is a low toxicity signal. Dismissal is likely, but verify context before deciding. Check reporter credibility if the report feels suspicious.`
  }

  const messages = [{ role: 'user', content: initialContent }]

  let decision = null
  let pendingDecision = null
  let awaitingVerification = false
  const toolsCalled = new Set()
  let iterations = 0
  const MAX_ITERATIONS = 6

  while (!decision && iterations < MAX_ITERATIONS) {
    iterations++
    emit({ type: 'iteration', number: iterations })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      tools: TOOL_DEFINITIONS,
      messages
    })

    messages.push({ role: 'assistant', content: response.content })

    for (const block of response.content) {
      if (block.type === 'text' && block.text.trim()) {
        console.log(`[agent] Reasoning: ${block.text.trim()}`)
        emit({ type: 'reasoning', text: block.text.trim(), reactive: toolsCalled.size > 0 })
      }
    }

    if (response.stop_reason === 'end_turn') {
      if (pendingDecision) {
        console.log('[agent] Verification confirmed — decision stands')
        emit({ type: 'verification_confirmed' })
        decision = pendingDecision
      } else {
        console.warn('[agent] Ended without calling a decision tool')
        decision = { action: null, reasoning: 'Agent ended without reaching a decision.' }
      }
      break
    }

    if (response.stop_reason === 'max_tokens') {
      messages.pop()
      console.warn('[agent] Hit max_tokens, stopping')
      decision = { action: null, reasoning: 'Agent hit token limit without reaching a decision.' }
      break
    }

    if (response.stop_reason === 'tool_use') {
      const toolResults = []
      let newDecision = null

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue

        console.log(`[agent] Calling tool: ${block.name}`, block.input)
        toolsCalled.add(block.name)
        emit({ type: 'tool_call', tool: block.name, label: TOOL_LABELS[block.name] || block.name })

        const result = await executeTool(block.name, block.input)

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result)
        })

        emit({ type: 'tool_result', tool: block.name, summary: summarizeResult(block.name, result) })

        if (DECISION_TOOLS.has(block.name) && !newDecision) {
          newDecision = { action: block.name, reasoning: block.input.reasoning }
        }
      }

      if (newDecision) {
        if (awaitingVerification) {
          console.log(`[agent] Decision revised during verification: ${pendingDecision.action} → ${newDecision.action}`)
          emit({ type: 'verification_revised', from: pendingDecision.action, to: newDecision.action })
          decision = newDecision
          messages.push({ role: 'user', content: toolResults })
        } else {
          pendingDecision = newDecision
          awaitingVerification = true
          emit({ type: 'verification' })
          messages.push({
            role: 'user',
            content: [
              ...toolResults,
              {
                type: 'text',
                text: `Before this decision is finalized: have you reviewed the user's violation history and post history? Does the Perspective score (${perspectiveScore}) align with or contradict what you found in context? If your decision stands, briefly confirm. If you need to revise, call the appropriate decision tool.`
              }
            ]
          })
        }
      } else {
        messages.push({ role: 'user', content: toolResults })
      }
    }
  }

  if (!decision) {
    decision = pendingDecision || {
      action: null,
      reasoning: `Agent reached max iterations (${MAX_ITERATIONS}) without a decision.`
    }
    if (!pendingDecision) console.warn(`[agent] Reached max iterations (${MAX_ITERATIONS}) without a decision`)
  }

  if (decision.action) {
    emit({ type: 'decision', action: decision.action, reasoning: decision.reasoning })
  }

  const skippedTools = [...CONTEXT_TOOLS].filter(t => !toolsCalled.has(t))
  if (skippedTools.length) {
    console.log(`[agent] Skipped tools: ${skippedTools.join(', ')}`)
    emit({ type: 'skipped_tools', tools: skippedTools })
  }

  return decision
}

module.exports = { runModerationAgent }
