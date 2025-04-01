import { useState, useEffect, useCallback } from "react"
import { useLoading } from "../contexts/loadingContext"
import { 
    query, 
    orderBy,
    limit,
    onSnapshot,
    getDocs,
    startAfter
} from "../api/firebase"

const usePosts = (roomRef, elementRef) => {
    // State
    const [posts, setPosts] = useState([])
    const [lastVisible, setLastVisible] = useState(null)
    const [hasMore, setHasMore] = useState(null)

    // Context
    const { loadingState, setLoadingState } = useLoading()

    // Effects
    useEffect(() => {
        if(!roomRef) return

        const postsQuery = query(
            roomRef,
            orderBy("timestamp", "desc"),
            limit(3)
        )

        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
            if(!snapshot.empty) {
                const newPosts = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                  timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
                }))
                setPosts(newPosts.reverse())
                setLastVisible(snapshot.docs[snapshot.docs.length - 1])
                setHasMore(snapshot.docs.length === 3)
            } else {
                setHasMore(false)
            }
        })
          
        return () => unsubscribe()
    }, [roomRef])

    // Functions
    const fetchMorePosts = useCallback(async () => {
        console.log("fetching")
        if(!hasMore || !lastVisible) return

        const postsQuery = query(
            roomRef,
            orderBy("timestamp", "desc"),
            startAfter(lastVisible), 
            limit(3)
        )
  
        try {
          const snapshot = await getDocs(postsQuery)
  
          if (!snapshot.empty) {
            const newPosts = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
            })).reverse()
  
            setPosts(prevPosts => [...newPosts, ...prevPosts])
            setLastVisible(snapshot.docs[snapshot.docs.length - 1])
            setHasMore(snapshot.docs.length === 3)
          } else {
            setHasMore(false)
          }
        } catch (error) {
          console.error("Error fetching more messages:", error)
        }

    }, [lastVisible, hasMore])

    console.log('posts', posts)
    console.log('last visible', lastVisible)

    return { posts, fetchMorePosts, hasMore, loadingState }
}

export default usePosts