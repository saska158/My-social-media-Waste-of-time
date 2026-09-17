require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { runRouter } = require('./router')
const { runModerationAgent } = require('./agent')
const { executeTool } = require('./tools')
const { db, admin } = require('./firebase')

const app = express()

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error('Not allowed by CORS'))
  }
}))
app.use(express.json())

app.post('/report', async (req, res) => {
  const { postId, room, reportedBy, creatorUid, postText = '', postImage = '' } = req.body

  if (!postId || !room || !reportedBy || !creatorUid || (!postText && !postImage)) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const reportRef = await db.collection('reports').add({
      postId, room, reportedBy, creatorUid,
      postText: postText || '',
      postImage: postImage || '',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })
    console.log(`[report] New report: ${reportRef.id} for post ${postId}`)
    res.json({ reportId: reportRef.id })
  } catch (error) {
    console.error('[report] Error creating report:', error)
    res.status(500).json({ error: 'Failed to create report' })
  }
})

app.get('/report/:reportId/stream', async (req, res) => {
  const { reportId } = req.params

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const emit = (event) => {
    try { res.write(`data: ${JSON.stringify(event)}\n\n`) } catch {}
  }

  try {
    const reportDoc = await db.collection('reports').doc(reportId).get()
    if (!reportDoc.exists) {
      emit({ type: 'error', message: 'Report not found' })
      emit({ type: 'done', decision: null })
      return res.end()
    }

    const { postId, room, reportedBy, creatorUid, postText, postImage } = reportDoc.data()

    const skillName = await runRouter({ postText, postImage, room, emit })
    await db.collection('reports').doc(reportId).update({ skillName })

    const decision = await runModerationAgent({
      reportId, postId, room, reportedBy, creatorUid, postText, postImage, skillName, emit
    })

    console.log(`[report] Decision for ${reportId}:`, decision)
    emit({ type: 'done', decision })

  } catch (error) {
    console.error('[stream] Error processing report:', error)
    emit({ type: 'error', message: error.message })
    emit({ type: 'done', decision: null })
    await db.collection('reports').doc(reportId).update({ status: 'error' }).catch(() => {})
  } finally {
    res.end()
  }
})

app.post('/admin/resolve', async (req, res) => {
  const { reportId, action, reasoning } = req.body
  if (!reportId || !action || !reasoning) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const reportDoc = await db.collection('reports').doc(reportId).get()
    if (!reportDoc.exists) return res.status(404).json({ error: 'Report not found' })

    const report = reportDoc.data()
    const input = { report_id: reportId, uid: report.creatorUid, room: report.room, post_id: report.postId, reasoning }

    await executeTool(action, input)
    console.log(`[admin] Resolved report ${reportId} with action: ${action}`)
    res.json({ success: true })
  } catch (error) {
    console.error('[admin] Error resolving report:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 4000
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}

module.exports = app
