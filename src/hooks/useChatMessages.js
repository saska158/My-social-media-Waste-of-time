import { useCallback, useEffect, useState } from "react"
import { query, orderBy, limitToLast, endBefore, getDocs, onSnapshot } from "../api/firebase"

const useChatMessages = (collectionRef, pageSize = 10) => {
    const [data, setData] = useState([])
    const [firstDoc, setFirstDoc] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(true)
    
    useEffect(() => {
      if (!collectionRef) return
    
      const q = query(
        collectionRef,
        orderBy("timestamp", "asc"), 
        limitToLast(pageSize)
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
            setFirstDoc(snapshot.docs[0])
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
    }, [collectionRef])
    
    const fetchData = useCallback(async () => {
      if(loading || !hasMore || !firstDoc) return
    
      try {
        const q = query(
          collectionRef,
          orderBy("timestamp", "asc"), 
          endBefore(firstDoc),
          limitToLast(pageSize + 1)
        )
    
        const snapshot = await getDocs(q)
        const docs = snapshot.docs
    
        if (docs.length > pageSize) {
          const newData = docs.slice(0, pageSize).map(doc => ({ id: doc.id, ...doc.data() }))
          setData(prevData => [...newData, ...prevData])
          setFirstDoc(docs[0])
          setHasMore(true) 
        } else {
          const newData = docs.map(doc => ({ id: doc.id, ...doc.data() }))
          setData(prevData => [...newData, ...prevData])
          setFirstDoc(null) 
          setHasMore(false) 
        }
      } catch(error) {
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
      } 
    
    }, [loading, hasMore, collectionRef, firstDoc, pageSize])
    
    return { data, loading, error, fetchMore: () => fetchData(), hasMore }
}

export default useChatMessages