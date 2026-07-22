const fs = require('fs')
const path = require('path')

const readIfExists = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

const stripFrontmatter = (content) => content.replace(/^---[\s\S]*?---\n/, '')

const buildSystemPrompt = (skillName) => {
  const skillDir = path.join(__dirname, 'skills', skillName)

  const skill = readIfExists(path.join(skillDir, 'SKILL.md'))
  if (!skill) throw new Error(`Skill not found: ${skillName}`)

  const parts = [stripFrontmatter(skill)]

  const refsDir = path.join(skillDir, 'references')
  if (fs.existsSync(refsDir)) {
    for (const file of fs.readdirSync(refsDir).sort()) {
      const content = readIfExists(path.join(refsDir, file))
      if (content) parts.push(`---\n\n${content}`)
    }
  }

  parts.push(`---

## Perspective toxicity score

Use the \`call_perspective\` tool to score the post text for toxicity (0–1). Call it when the toxicity signal would help calibrate your decision. If you call it, reference the score explicitly in your reasoning — state the score, explain how much weight you gave it for this type of content, and why. If the violation type is unlikely to correlate with toxicity tone (e.g. calm misinformation), you may skip it.`)

  return parts.join('\n\n')
}

module.exports = { buildSystemPrompt }
