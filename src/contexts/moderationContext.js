import { createContext, useContext, useRef, useState } from 'react'

const SERVER_URL = 'http://localhost:4000'

const ModerationContext = createContext(null)

export const ModerationProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState([])
  const esRef = useRef(null)

  const openTrace = () => {
    esRef.current?.close()
    esRef.current = null
    setEvents([])
    setIsLoading(true)
    setIsOpen(true)
  }

  const startStream = (reportId, onDone) => {
    const es = new EventSource(`${SERVER_URL}/report/${reportId}/stream`)
    esRef.current = es

    es.onmessage = (e) => {
      const event = JSON.parse(e.data)
      if (event.type !== 'done') {
        setEvents(prev => [...prev, event])
        return
      }
      es.close()
      esRef.current = null
      setIsLoading(false)
      onDone?.(event.decision || null)
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      setIsLoading(false)
      onDone?.(null)
    }
  }

  const closeTrace = () => {
    esRef.current?.close()
    esRef.current = null
    setIsOpen(false)
    setIsLoading(false)
    setEvents([])
  }

  return (
    <ModerationContext.Provider value={{ isOpen, isLoading, events, openTrace, startStream, closeTrace }}>
      {children}
    </ModerationContext.Provider>
  )
}

export const useModerationTrace = () => useContext(ModerationContext)
