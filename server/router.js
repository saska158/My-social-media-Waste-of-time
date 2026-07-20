const fs = require('fs')
const path = require('path')
const Anthropic = require('@anthropic-ai/sdk')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ROUTER_SYSTEM_PROMPT = `You are a moderation routing agent. Your only job is to classify an incoming report and select the most appropriate skill to handle it.

Analyze the post text, Perspective score, and room context. Then call select_skill with the best matching skill ID. Be decisive — pick exactly one.`

const getAvailableSkills = () => {
  const skillsDir = path.join(__dirname, 'skills')
  const skills = []

  for (const skillName of fs.readdirSync(skillsDir).sort()) {
    const skillPath = path.join(skillsDir, skillName, 'SKILL.md')
    if (!fs.existsSync(skillPath)) continue

    const content = fs.readFileSync(skillPath, 'utf-8')
    const match = content.match(/^---\n([\s\S]*?)\n---/)
    if (!match) continue

    const frontmatter = match[1]
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m)
    const descMatch = frontmatter.match(/^description:\s*(.+)$/m)

    skills.push({
      id: skillName,
      name: nameMatch?.[1]?.trim() || skillName,
      description: descMatch?.[1]?.trim() || ''
    })
  }

  return skills
}

const runRouter = async ({ postText, perspectiveScore, room }) => {
  const skills = getAvailableSkills()

  if (!skills.length) {
    console.warn('[router] No skills found, falling back to content-toxicity')
    return 'content-toxicity'
  }

  const skillList = skills.map(s => `- ${s.id}: ${s.description}`).join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: ROUTER_SYSTEM_PROMPT,
    tool_choice: { type: 'tool', name: 'select_skill' },
    tools: [
      {
        name: 'select_skill',
        description: 'Select the appropriate moderation skill for this report',
        input_schema: {
          type: 'object',
          properties: {
            skill_id: {
              type: 'string',
              enum: skills.map(s => s.id),
              description: 'The ID of the skill to use'
            },
            reasoning: {
              type: 'string',
              description: 'One sentence explaining why this skill was selected'
            }
          },
          required: ['skill_id', 'reasoning']
        }
      }
    ],
    messages: [
      {
        role: 'user',
        content: `Incoming report:
Room: ${room}
Perspective toxicity score: ${perspectiveScore}
Post text: "${postText}"

Available skills:
${skillList}

Select the most appropriate skill.`
      }
    ]
  })

  const toolUse = response.content.find(b => b.type === 'tool_use')
  if (!toolUse || !toolUse.input?.skill_id) {
    console.warn('[router] Failed to select a skill, falling back to content-toxicity')
    return 'content-toxicity'
  }

  console.log(`[router] Selected skill: ${toolUse.input.skill_id} — ${toolUse.input.reasoning}`)
  return toolUse.input.skill_id
}

module.exports = { runRouter }
