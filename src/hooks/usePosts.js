import { useState, useEffect, useCallback } from "react"
import { useLoading } from "../contexts/loadingContext"
import { onValue, query, orderByKey, startAt, endAt, limitToLast, limitToFirst, get } from "../api/firebase"

const usePosts = (roomRef, elementRef) => {
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
            if(snapshot.exists()) {
                const posts = snapshot.val()
                const postsKeys = Object.keys(posts)
                const postsArray = postsKeys.map(key => ({id: key, ...posts[key]}))
                setPosts(postsArray)
                setLastVisible(postsArray[0]?.id || null)
                setHasMore(postsArray.length === 10)
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
            orderByKey(),
            endAt(lastVisible),
            limitToLast(10)
        )

        const snapshot = await get(postsQuery)
        console.log(snapshot.val())
        if(snapshot.exists()) {
            const posts = snapshot.val()
            const postsKeys = Object.keys(posts)
            const postsArray = postsKeys.map((key) => ({id: key, ...posts[key]}))
            // Remove the duplicate (lastVisible post that was already loaded)
            //postsArray.pop()
            setPosts((prevPosts) => [...prevPosts, ...postsArray])
            setLastVisible(postsArray[0]?.id || null)
            setHasMore(postsArray.length === 10)
        } else {
            setHasMore(false)
        }

    }, [lastVisible, hasMore])
    console.log('posts', posts)

    return { posts, fetchMorePosts, hasMore, loadingState }
}

export default usePosts