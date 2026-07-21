import { createContext, useContext, useRef, useState } from 'react'

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

  const pushEvent = (event) => setEvents(prev => [...prev, event])

  const finishLoading = () => setIsLoading(false)

  const closeTrace = () => {
    esRef.current?.close()
    esRef.current = null
    setIsOpen(false)
    setIsLoading(false)
    setEvents([])
  }

  return (
    <ModerationContext.Provider value={{ isOpen, isLoading, events, esRef, openTrace, pushEvent, finishLoading, closeTrace }}>
      {children}
    </ModerationContext.Provider>
  )
}

export const useModerationTrace = () => useContext(ModerationContext)
