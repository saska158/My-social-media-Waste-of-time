import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

const DECISION_COLOR = {
  dismiss_report: '#16a34a',
  auto_dismissed: '#16a34a',
  warn_user: '#d97706',
  remove_post: '#e53e3e',
  ban_user: '#991b1b',
}

const DECISION_LABEL = {
  dismiss_report: 'Dismissed',
  auto_dismissed: 'Auto-dismissed',
  warn_user: 'User warned',
  remove_post: 'Post removed',
  ban_user: 'User banned',
}

const TOOL_ICON = {
  get_post: '📄',
  get_comments: '💬',
  get_user_history: '📋',
  get_user_violations: '⚠️',
  get_reporter_history: '🔍',
  dismiss_report: '✓',
  warn_user: '⚠',
  remove_post: '✕',
  ban_user: '⊘',
}

const scoreColor = score =>
  score > 0.7 ? '#e53e3e' : score > 0.4 ? '#d97706' : '#16a34a'

const label = (text, color = '#999') => (
  <span style={{ fontSize: '0.65rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
    {text}
  </span>
)

const EventRow = ({ event }) => {
  const base = { padding: '5px 0', display: 'flex', flexDirection: 'column', gap: '2px' }

  switch (event.type) {
    case 'perspective':
      return (
        <div style={base}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {label('Perspective')}
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: scoreColor(event.score), fontFamily: 'monospace' }}>
              {event.score.toFixed(3)}
            </span>
          </div>
        </div>
      )

    case 'router_reasoning':
      return (
        <div style={base}>
          {label('Router')}
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', fontStyle: 'italic', lineHeight: 1.5 }}>
            {event.text}
          </p>
        </div>
      )

    case 'routing':
      return (
        <div style={{ ...base, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#4b896f', fontWeight: 700, fontSize: '0.8rem' }}>→</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b896f', fontFamily: 'monospace' }}>{event.skill}</span>
        </div>
      )

    case 'iteration':
      return (
        <div style={{ ...base, borderTop: '1px solid #eaf4f0', paddingTop: '10px', marginTop: '4px' }}>
          {label(`Iteration ${event.number}`, '#4b896f')}
        </div>
      )

    case 'reasoning':
      return event.reactive
        ? (
          <div style={{ ...base, borderLeft: '2px solid #d1e9df', paddingLeft: '10px' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', lineHeight: 1.55, fontStyle: 'italic' }}>{event.text}</p>
          </div>
        )
        : (
          <div style={base}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#444', lineHeight: 1.55 }}>{event.text}</p>
          </div>
        )

    case 'tool_call':
      return (
        <div style={{ ...base, flexDirection: 'row', alignItems: 'center', gap: '6px', paddingLeft: '8px' }}>
          <span style={{ fontSize: '0.75rem' }}>{TOOL_ICON[event.tool] || '⚙'}</span>
          <span style={{ fontSize: '0.78rem', color: '#555', fontFamily: 'monospace' }}>{event.label}</span>
          <span style={{ fontSize: '0.7rem', color: '#bbb', marginLeft: 'auto' }}>…</span>
        </div>
      )

    case 'tool_result':
      return (
        <div style={{ ...base, flexDirection: 'row', alignItems: 'center', gap: '6px', paddingLeft: '8px' }}>
          <span style={{ fontSize: '0.7rem', color: '#999' }}>←</span>
          <span style={{ fontSize: '0.78rem', color: '#777', fontFamily: 'monospace' }}>{event.summary}</span>
        </div>
      )

    case 'verification':
      return (
        <div style={{ ...base, borderTop: '1px solid #eaf4f0', paddingTop: '10px', marginTop: '4px' }}>
          {label('Verifying decision', '#7c3aed')}
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#7c3aed', fontStyle: 'italic' }}>
            Checking if all signals were considered before finalizing…
          </p>
        </div>
      )

    case 'verification_confirmed':
      return (
        <div style={{ ...base, flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
          <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>Decision confirmed</span>
        </div>
      )

    case 'verification_revised':
      return (
        <div style={{ ...base, flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#d97706', fontWeight: 700 }}>↻</span>
          <span style={{ fontSize: '0.8rem', color: '#d97706' }}>
            Revised: <span style={{ fontFamily: 'monospace' }}>{event.from}</span>
            {' → '}
            <span style={{ fontFamily: 'monospace' }}>{event.to}</span>
          </span>
        </div>
      )

    case 'decision': {
      const color = DECISION_COLOR[event.action] || '#555'
      return (
        <div style={{ ...base, borderTop: '1px solid #eaf4f0', paddingTop: '10px', marginTop: '4px' }}>
          {label('Decision')}
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color, fontFamily: 'monospace' }}>
            {DECISION_LABEL[event.action] || event.action}
          </span>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#555', lineHeight: 1.5 }}>
            {event.reasoning}
          </p>
        </div>
      )
    }

    case 'skipped_tools':
      return (
        <div style={{ ...base, flexDirection: 'row', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          {label('Skipped')}
          <span style={{ fontSize: '0.75rem', color: '#aaa', fontFamily: 'monospace' }}>
            {event.tools.join(', ')}
          </span>
        </div>
      )

    case 'auto_dismissed':
      return (
        <div style={base}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' }}>
            ✓ Score too low — auto-dismissed
          </span>
        </div>
      )

    case 'error':
      return (
        <div style={base}>
          <span style={{ fontSize: '0.85rem', color: '#e53e3e' }}>Error: {event.message}</span>
        </div>
      )

    default:
      return null
  }
}

const ModerationTraceModal = ({ events, isLoading, onClose }) => {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  return createPortal(
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #eaf4f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b896f' }}>Agent Review</span>
            {isLoading && (
              <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4b896f', display: 'block' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ color: '#999', display: 'flex', alignItems: 'center', padding: '2px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Event log */}
        <div style={{ overflowY: 'auto', padding: '12px 18px', flex: 1 }}>
          {events.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' }}>Waiting for agent…</p>
          )}
          <AnimatePresence initial={false}>
            {events.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <EventRow event={event} />
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

export default ModerationTraceModal
