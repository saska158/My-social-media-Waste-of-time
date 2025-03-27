import { useState, useRef } from "react"
import {
    database,
    ref,
    set
} from "../api/firebase"
import { useAuth } from "../contexts/authContext"

const useTypingIndicator = ({chatId}) => {
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

    return { isTyping, setIsTyping, handleTyping, typingRef }
}

export default useTypingIndicator