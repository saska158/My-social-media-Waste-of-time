require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { analyzeToxicity } = require('./perspective')
const { runRouter } = require('./router')
const { runModerationAgent } = require('./agent')
const { db, admin } = require('./firebase')

const app = express()
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

app.post('/report', async (req, res) => {
  const { postId, room, reportedBy, creatorUid, postText } = req.body

  if (!postId || !room || !reportedBy || !creatorUid || !postText) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const reportRef = await db.collection('reports').add({
      postId,
      room,
      reportedBy,
      creatorUid,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    const reportId = reportRef.id
    console.log(`[report] New report: ${reportId} for post ${postId}`)

    // Step 1: Perspective API triage
    const perspectiveScore = await analyzeToxicity(postText)
    console.log(`[report] Perspective score: ${perspectiveScore}`)

    await reportRef.update({ perspectiveScore })

    if (perspectiveScore < 0.05) {
      await reportRef.update({
        status: 'dismissed',
        reasoning: 'Perspective score below 0.05 — content is clearly not toxic or harmful.',
        resolvedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      console.log(`[report] Auto-dismissed: ${reportId}`)
      return res.json({ reportId, action: 'auto_dismissed', perspectiveScore })
    }

    // Step 2: Route to the appropriate skill
    // Fast-track high-toxicity content (score >= 0.9) directly to content-toxicity — no need to route
    // Scores between 0.05–0.9 always reach the agent — misinformation, spam, and doxxing score low but are still violations
    let skillName
    if (perspectiveScore >= 0.9) {
      skillName = 'content-toxicity'
      console.log(`[report] Score ${perspectiveScore} >= 0.9 — fast-tracking to content-toxicity`)
      await reportRef.update({ skillName, fastTracked: true })
    } else {
      skillName = await runRouter({ postText, perspectiveScore, room })
      await reportRef.update({ skillName })
    }

    // Step 3: Run the moderation agent with the selected skill
    const decision = await runModerationAgent({
      reportId,
      postId,
      room,
      reportedBy,
      creatorUid,
      perspectiveScore,
      postText,
      skillName
    })

    console.log(`[report] Decision for ${reportId}:`, decision)
    res.json({ reportId, skillName, ...decision, perspectiveScore })

  } catch (error) {
    console.error('[report] Error processing report:', error)
    res.status(500).json({ error: 'Failed to process report' })
  }
})

app.get('/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
