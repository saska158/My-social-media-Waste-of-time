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

## Perspective score

The report includes a Perspective API toxicity score (0–1). You must reference this score explicitly in your decision reasoning — state the score, explain how much weight you gave it for this type of content, and why.`)

  return parts.join('\n\n')
}

module.exports = { buildSystemPrompt }
