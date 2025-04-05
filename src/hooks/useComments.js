import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "react-router-dom"
import { query, orderBy, limit, onSnapshot, getDocs, startAfter, firestore, collection } from "../api/firebase"


const useComments = (id) => {
    // State
    const [comments, setComments] = useState([])
    const [lastVisible, setLastVisible] = useState(null)
    const [hasMore, setHasMore] = useState(null)
    const [loading, setLoading] = useState(false)

    // Hooks that don't trigger re-renders  
    const { roomId } = useParams()

    // Memoized Values (`useMemo`)
    const room = useMemo(() => {
        const room = roomId ? `${roomId}` : `main`
        return room
    }, [roomId])

    // Effects
    useEffect(() => {
      const commentsRef = collection(firestore, room, id, 'comments')
      const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"), limit(3))
  
      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => { // neki loading i skeleton
        if(!snapshot.empty) {
          const newComments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp ? doc.data().timestamp : null
          }))
          setComments(newComments.reverse())
          setLastVisible(snapshot.docs[snapshot.docs.length - 1])
          setHasMore(snapshot.docs.length === 3)
        } else {
          setHasMore(false)
        }
      })
            
      return () => unsubscribe()
    }, [roomId])

    // Functions
    const fetchMoreComments = useCallback(async () => {
        console.log("fetching")
        if(!hasMore || !lastVisible) return
        const commentsRef = collection(firestore, room, id, 'comments')
        const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"), startAfter(lastVisible), limit(3))
        setLoading(true)
        try {
          const snapshot = await getDocs(commentsQuery)
          if (!snapshot.empty) {
            const newComments = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp ? doc.data().timestamp : null
            })).reverse()
    
            setComments(prevComments => [...newComments, ...prevComments])
            setLastVisible(snapshot.docs[snapshot.docs.length - 1])
            setHasMore(snapshot.docs.length === 3)
          } else {
            setHasMore(false)
          }
        } catch (error) {
          console.error("Error fetching more messages:", error)
          // setError(error)
        } finally {
          setLoading(false)
        }
    }, [lastVisible, hasMore])

    return { comments, fetchMoreComments, hasMore, loading }  
}

export default useComments