const Anthropic = require('@anthropic-ai/sdk')
const { buildSystemPrompt } = require('./prompts')
const { TOOL_DEFINITIONS, executeTool } = require('./tools')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DECISION_TOOLS = new Set(['dismiss_report', 'warn_user', 'remove_post', 'ban_user'])

const runModerationAgent = async ({ reportId, postId, room, reportedBy, creatorUid, perspectiveScore, postText, skillName }) => {
  const systemPrompt = buildSystemPrompt(skillName)

  const messages = [
    {
      role: 'user',
      content: `New moderation report.

Report ID: ${reportId}
Post ID: ${postId}
Room: ${room}
Post author (UID): ${creatorUid}
Reported by (UID): ${reportedBy}
Perspective score: ${perspectiveScore}
Post text: "${postText}"

Analyze the context and make a decision.`
    }
  ]

  let decision = null
  let iterations = 0
  const MAX_ITERATIONS = 6

  while (!decision && iterations < MAX_ITERATIONS) {
    iterations++
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      tools: TOOL_DEFINITIONS,
      messages
    })

    messages.push({ role: 'assistant', content: response.content })

    if (response.stop_reason === 'end_turn') {
      console.warn(`[agent] Ended without calling a decision tool`)
      decision = { action: null, reasoning: 'Agent ended without reaching a decision.' }
      break
    }

    if (response.stop_reason === 'max_tokens') {
      messages.pop()
      console.warn(`[agent] Hit max_tokens, stopping`)
      decision = { action: null, reasoning: 'Agent hit token limit without reaching a decision.' }
      break
    }

    if (response.stop_reason === 'tool_use') {
      const toolResults = []

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue

        console.log(`[agent] Calling tool: ${block.name}`, block.input)

        const result = await executeTool(block.name, block.input)

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result)
        })

        if (DECISION_TOOLS.has(block.name)) {
          decision = {
            action: block.name,
            reasoning: block.input.reasoning
          }
        }
      }

      messages.push({ role: 'user', content: toolResults })
    }
  }

  if (!decision) {
    console.warn(`[agent] Reached max iterations (${MAX_ITERATIONS}) without a decision`)
    decision = { action: null, reasoning: 'Agent reached max iterations without reaching a decision.' }
  }

  return decision
}

module.exports = { runModerationAgent }
