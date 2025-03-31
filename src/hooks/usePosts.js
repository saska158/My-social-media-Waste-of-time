import { useState, useEffect, useCallback } from "react"
import { useLoading } from "../contexts/loadingContext"
import { onValue, query, orderByKey, startAt, limitToLast, get } from "../api/firebase"

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
                const postsArray = postsKeys.map((key) => ({id: key, ...posts[key]}))
                setPosts(postsArray)
                //setLastVisible(postsKeys[postsKeys.length - 1])
                console.log("last", postsArray[0].id)
                setLastVisible(postsArray[0].id)
                setHasMore(postsArray.length === 10)
            } else {
                setPosts([])
                setHasMore(false)
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
            const postsArray = postsKeys.map((key) => ({id: key, ...posts[key]}))
            setPosts((prevPosts) => [...prevPosts, ...postsArray])
            //setLastVisible(postsKeys[postsKeys.length - 1])
            setLastVisible(postsArray[0].id)
            setHasMore(postsArray.length === 10)
        } else {
            setHasMore(false)
        }

    }, [lastVisible, hasMore])

    return { posts, fetchMorePosts, hasMore, loadingState }
}

export default usePosts