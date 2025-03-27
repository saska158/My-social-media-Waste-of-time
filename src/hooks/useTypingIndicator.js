import { useState, useEffect, useRef } from "react"
import {
    database,
    ref,
    set,
    onValue
} from "../api/firebase"
import { useAuth } from "../contexts/authContext"

const useTypingIndicator = ({chatId, chatPartnerUid}) => {
    // Context
    const { user } = useAuth()

    // State
    const [isTyping, setIsTyping] = useState(false)

    // Hooks that don't trigger re-renders 
    const typingTimeoutRef = useRef(null)

    // Firebase ref
    const typingRef = ref(database, `typingStatus/${chatId}/${user.uid}`)

    // Functions
    const handleTyping = () => {
        set(typingRef, true)
    
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
    
        typingTimeoutRef.current = setTimeout(() => {
          set(typingRef, false)
      }, 1500)
    }

    // Effects
    /* listen for typing status of the other user */
    useEffect(() => {
      if (!chatId || !chatPartnerUid) return

      const otherTypingRef = ref(database, `typingStatus/${chatId}/${chatPartnerUid}`)
      const unsubscribe = onValue(otherTypingRef, (snapshot) => {
        setIsTyping(snapshot.val() === true)
      })

      return () => unsubscribe()
    }, [chatId, chatPartnerUid])

    return { isTyping, handleTyping, typingRef }
}

export default useTypingIndicator