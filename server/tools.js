const { db, admin } = require('./firebase')

const ROOMS = ['watching', 'reading', 'listening']

const TOOL_DEFINITIONS = [
  {
    name: 'get_post',
    description: 'Fetch the content of the reported post',
    input_schema: {
      type: 'object',
      properties: {
        room: { type: 'string', description: 'Collection: watching, reading, or listening' },
        post_id: { type: 'string', description: 'Post ID' }
      },
      required: ['room', 'post_id']
    }
  },
  {
    name: 'get_comments',
    description: 'Fetch comments on the post — community reaction is an important signal',
    input_schema: {
      type: 'object',
      properties: {
        room: { type: 'string' },
        post_id: { type: 'string' }
      },
      required: ['room', 'post_id']
    }
  },
  {
    name: 'get_user_history',
    description: 'Fetch recent posts by the reported user to check for behavior patterns',
    input_schema: {
      type: 'object',
      properties: {
        uid: { type: 'string', description: 'UID of the reported user' }
      },
      required: ['uid']
    }
  },
  {
    name: 'get_user_violations',
    description: 'Fetch the moderation violation history for the reported user — warnings, removals, and bans. Use this to assess escalation.',
    input_schema: {
      type: 'object',
      properties: {
        uid: { type: 'string', description: 'UID of the reported user' }
      },
      required: ['uid']
    }
  },
  {
    name: 'get_reporter_history',
    description: 'Check how many times this user has filed reports — assess their credibility',
    input_schema: {
      type: 'object',
      properties: {
        uid: { type: 'string', description: 'UID of the user who filed the report' }
      },
      required: ['uid']
    }
  },
  {
    name: 'dismiss_report',
    description: 'Dismiss the report — false report, context justifies the content, or the community defends the user',
    input_schema: {
      type: 'object',
      properties: {
        report_id: { type: 'string' },
        reasoning: { type: 'string', description: 'Reasoning for the decision' }
      },
      required: ['report_id', 'reasoning']
    }
  },
  {
    name: 'warn_user',
    description: 'Warn the user — first offense or borderline content',
    input_schema: {
      type: 'object',
      properties: {
        report_id: { type: 'string' },
        uid: { type: 'string', description: 'UID of the user being warned' },
        reasoning: { type: 'string', description: 'Reasoning for the decision' }
      },
      required: ['report_id', 'uid', 'reasoning']
    }
  },
  {
    name: 'remove_post',
    description: 'Remove the post — clear violation or established pattern',
    input_schema: {
      type: 'object',
      properties: {
        report_id: { type: 'string' },
        room: { type: 'string' },
        post_id: { type: 'string' },
        uid: { type: 'string', description: 'UID of the post author' },
        reasoning: { type: 'string', description: 'Reasoning for the decision' }
      },
      required: ['report_id', 'room', 'post_id', 'uid', 'reasoning']
    }
  },
  {
    name: 'ban_user',
    description: 'Ban the user and remove the offending post — reserved for severe or repeated violations after escalation through warn and remove',
    input_schema: {
      type: 'object',
      properties: {
        report_id: { type: 'string' },
        uid: { type: 'string', description: 'UID of the user being banned' },
        room: { type: 'string', description: 'Collection the post lives in (watching, reading, listening)' },
        post_id: { type: 'string', description: 'ID of the post to remove' },
        reasoning: { type: 'string', description: 'Reasoning for the decision, referencing the violation history' }
      },
      required: ['report_id', 'uid', 'room', 'post_id', 'reasoning']
    }
  }
]

const recordViolation = async (uid, violation) => {
  await db.collection('profiles').doc(uid).collection('violations').add({
    ...violation,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })
}

const executeTool = async (name, input) => {
  switch (name) {
    case 'get_post': {
      const snap = await db.collection(input.room).doc(input.post_id).get()
      if (!snap.exists) return { error: 'Post not found' }
      return { id: snap.id, ...snap.data() }
    }

    case 'get_comments': {
      const snap = await db
        .collection(input.room)
        .doc(input.post_id)
        .collection('comments')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get()
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }

    case 'get_user_history': {
      const posts = []
      for (const room of ROOMS) {
        const snap = await db
          .collection(room)
          .where('creatorUid', '==', input.uid)
          .orderBy('timestamp', 'desc')
          .limit(10)
          .get()
        snap.docs.forEach(d => posts.push({ room, id: d.id, ...d.data() }))
      }
      return posts
    }

    case 'get_user_violations': {
      const snap = await db
        .collection('profiles')
        .doc(input.uid)
        .collection('violations')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get()
      const violations = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return {
        violations,
        totalWarnings: violations.filter(v => v.type === 'warn').length,
        totalRemovals: violations.filter(v => v.type === 'remove').length,
        totalBans: violations.filter(v => v.type === 'ban').length,
        total: violations.length
      }
    }

    case 'get_reporter_history': {
      const snap = await db.collection('reports').where('reportedBy', '==', input.uid).get()
      return { totalReports: snap.size }
    }

    case 'dismiss_report': {
      await db.collection('reports').doc(input.report_id).update({
        status: 'dismissed',
        reasoning: input.reasoning,
        resolvedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      return { success: true }
    }

    case 'warn_user': {
      await db.collection('reports').doc(input.report_id).update({
        status: 'warned',
        reasoning: input.reasoning,
        resolvedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      await db.collection('profiles').doc(input.uid).set({ warned: true }, { merge: true })
      await recordViolation(input.uid, {
        type: 'warn',
        reportId: input.report_id,
        reasoning: input.reasoning
      })
      return { success: true }
    }

    case 'remove_post': {
      await db.collection(input.room).doc(input.post_id).delete()
      await db.collection('reports').doc(input.report_id).update({
        status: 'removed',
        reasoning: input.reasoning,
        resolvedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      await db.collection('profiles').doc(input.uid).set({ removedPending: true }, { merge: true })
      await recordViolation(input.uid, {
        type: 'remove',
        reportId: input.report_id,
        postId: input.post_id,
        room: input.room,
        reasoning: input.reasoning
      })
      return { success: true }
    }

    case 'ban_user': {
      await db.collection(input.room).doc(input.post_id).delete()
      await db.collection('profiles').doc(input.uid).set({ banned: true }, { merge: true })
      await db.collection('reports').doc(input.report_id).update({
        status: 'banned',
        reasoning: input.reasoning,
        resolvedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      await recordViolation(input.uid, {
        type: 'ban',
        reportId: input.report_id,
        postId: input.post_id,
        room: input.room,
        reasoning: input.reasoning
      })
      return { success: true }
    }

    default:
      return { error: `Unknown tool: ${name}` }
  }
}

module.exports = { TOOL_DEFINITIONS, executeTool }
