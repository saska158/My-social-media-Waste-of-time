import { useState, useEffect, useCallback } from "react"
import { collection, query, orderBy, limit, startAfter, onSnapshot } from "../api/firebase"
import { db } from "../firebaseConfig" // Your Firestore instance

const PAGE_SIZE = 10 // Adjust as needed

export function useMessages() {
  const [messages, setMessages] = useState([])
  const [lastVisible, setLastVisible] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const messagesRef = collection(db, "messages")
    const q = query(messagesRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setMessages(newMessages)
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        setHasMore(snapshot.docs.length === PAGE_SIZE) // If less than PAGE_SIZE, no more data
      } else {
        setHasMore(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const fetchMoreMessages = useCallback(() => {
    if (!hasMore || !lastVisible) return

    const messagesRef = collection(db, "messages")
    const q = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    )

    onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setMessages((prevMessages) => [...prevMessages, ...newMessages])
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        setHasMore(snapshot.docs.length === PAGE_SIZE)
      } else {
        setHasMore(false)
      }
    })
  }, [lastVisible, hasMore])

  return { messages, fetchMoreMessages, hasMore, loading }
}
