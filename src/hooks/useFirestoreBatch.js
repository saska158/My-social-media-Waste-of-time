import { useCallback, useEffect, useState } from "react"
import { query, orderBy , limit, startAfter, getDocs, onSnapshot } from "../api/firebase"

const useFirestoreBatch = (collectionRef, pageSize = 3, queryConstraints = [], profileUid=null) => {
    const [data, setData] = useState([])
    const [lastDoc, setLastDoc] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(true)
    const [retryFlag, setRetryFlag] = useState(0)

    useEffect(() => {
      if (!collectionRef) return 

        const q = query(
            collectionRef,
            ...queryConstraints,
            orderBy("timestamp", "desc"), 
            limit(pageSize)
        )

        setLoading(true)
        setError(null)

        const unsubscribe = onSnapshot(
          q, 
          (snapshot) => { 
            if(!snapshot.empty) {
              const newData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              setData(newData)
              setLastDoc(snapshot.docs[snapshot.docs.length - 1])
              setHasMore(snapshot.docs.length === pageSize)
            } else {
                setData([])
                setHasMore(false)
            }
            setLoading(false)
          },
          (error) => {
            console.error(error)

            let errorMessage
            if (error.code === "permission-denied") {
              errorMessage = "You don't have permission to access this data."
            } else if (error.code === "unavailable" || error.code === "network-request-failed") {
              errorMessage = "Network error. Please check your connection."
            } else {
              errorMessage = "Failed to fetch data. Please try again later."
            }
            setError(errorMessage)
            setLoading(false)
          }
        )

        return () => unsubscribe()
    }, [collectionRef, profileUid, retryFlag])

    const fetchData = useCallback(async () => {
      if(loading || !hasMore || !lastDoc) return

      try {
        const q = query(
          collectionRef,
          ...queryConstraints,
          orderBy("timestamp", "desc"), 
          startAfter(lastDoc),
          limit(pageSize + 1)
        )

        const snapshot = await getDocs(q)
        const docs = snapshot.docs

        if (docs.length > pageSize) {
          const newData = docs.slice(0, pageSize).map(doc => ({ id: doc.id, ...doc.data() }))
          setData(prevData => [...prevData, ...newData])
          setLastDoc(docs[pageSize - 1]) 
          setHasMore(true) 
        } else {
          const newData = docs.map(doc => ({ id: doc.id, ...doc.data() }))
          setData(prevData => [...prevData, ...newData])
          setLastDoc(null) 
          setHasMore(false) 
        }
      } catch(error) {
        console.error('Error from useFirestoreBatch:', error)
        let errorMessage
        if (error.code === "permission-denied") {
          errorMessage = "You don't have permission to access this data."
        } else if (error.code === "unavailable" || error.code === "network-request-failed") {
          errorMessage = "Network error. Please check your connection."
        } else {
          errorMessage = "Failed to fetch data. Please try again later."
        }

        setError(errorMessage)
      } 
  }, [loading, hasMore, collectionRef, lastDoc, pageSize])

  const refetch = () => {
    setRetryFlag(prev => prev + 1) 
  }

  return { data, loading, error, fetchMore: () => fetchData(), hasMore, refetch }
}

export default useFirestoreBatch