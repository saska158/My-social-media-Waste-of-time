import { useState, useEffect, useCallback } from "react"
import { useLoading } from "../contexts/loadingContext"
import { onValue, query, orderByKey, startAt, limitToLast, get } from "../api/firebase"

const usePosts = (roomRef) => {
    // State
    const [posts, setPosts] = useState([])
    const [lastVisible, setLastVisible] = useState(null)
    const [hasMore, setHasMore] = useState(null)

    // Context
    const { loadingState, setLoadingState } = useLoading()

    // Effects
    /* real-time listener for fetching posts */
    useEffect(() => {
        if(!roomRef) return
        const postsQuery = query(
            roomRef,
            orderByKey(),
            startAt(lastVisible),
            limitToLast(10)
        )

        const unsubscribe = onValue(postsQuery, (snapshot) => {
            const data = snapshot.val()
            if(data) {
              const postsArray = Object.keys(data).map((key) => ({id: key, ...data[key]}))
              setPosts(postsArray)
            } else {
                setPosts([])
            }
        })
          
        return () => unsubscribe()
    }, [roomRef])

    // Functions
    const fetchMorePosts = useCallback(async () => {
        if(!hasMore || !lastVisible?.exists) return

        const postsQuery = query(
            roomRef,
            orderByKey(),
            startAt(lastVisible),
            limitToLast(10)
        )

        const snapshot = await get(postsQuery)
        if(snapshot.exists()) {
            const posts = snapshot.val()
            const postsKeys = Object.keys(posts)
            setPosts((prevPosts) => [...prevPosts, ...postsKeys.map((key) => ({id: key,...posts[key]}))])
            setLastVisible(postsKeys[postsKeys.length - 1])
            setHasMore(postsKeys.length === 10)
        } else {
            setHasMore(false)
        }

    }, [lastVisible, hasMore])

    return { posts, fetchMorePosts, hasMore, loadingState }
}

export default usePosts