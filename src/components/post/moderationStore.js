import { useState, useEffect } from 'react'

let state = { isOpen: false, isLoading: false, events: [] }
const listeners = new Set()

const notify = () => listeners.forEach(fn => fn({ ...state }))

export const moderationStore = {
  open() {
    state = { isOpen: true, isLoading: true, events: [] }
    notify()
  },
  pushEvent(event) {
    state = { ...state, events: [...state.events, event] }
    notify()
  },
  finishLoading() {
    state = { ...state, isLoading: false }
    notify()
  },
  close() {
    state = { isOpen: false, isLoading: false, events: [] }
    notify()
  },
}

export const useModerationStore = () => {
  const [snap, setSnap] = useState({ ...state })
  useEffect(() => {
    listeners.add(setSnap)
    return () => listeners.delete(setSnap)
  }, [])
  return snap
}
