import { useRef } from "react"
import {
    database,
    ref,
    set
} from "../api/firebase"
import { useAuth } from "../contexts/authContext"

const useTypingIndicator = ({chatId}) => {
    // Context
    const { user } = useAuth()

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

    return { handleTyping, typingRef }
}

export default useTypingIndicator