import { useRef } from "react"
import { database, ref, set } from "../api/firebase"

const useTypingIndicator = (chatId, userUid) => {
    const typingTimeoutRef = useRef(null)
    const typingRef = ref(database, `typingStatus/${chatId}/${userUid}`)

    const handleTyping = () => {
      set(typingRef, true).catch(error => {console.error('Failed to set typing status to true:', error)})
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        set(typingRef, false).catch(error => {console.error('Failed to set typing status to false:', error)})
      }, 1500)
    }

    return handleTyping
}

export default useTypingIndicator