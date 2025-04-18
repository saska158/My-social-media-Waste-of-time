import { useRef } from "react"
import { database, ref, set } from "../api/firebase"

const useTypingIndicator = (chatId, userUid) => {
    const typingTimeoutRef = useRef(null)
    const typingRef = ref(database, `typingStatus/${chatId}/${userUid}`)

    const handleTyping = () => {
      set(typingRef, true)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        set(typingRef, false)
      }, 1500)
    }

    return handleTyping
}

export default useTypingIndicator