import { useEffect, useState } from "react"
import { query, orderBy , limit, startAfter, getDocs, onSnapshot} from "../api/firebase"

const useFirestoreBatch = (collectionRef, pageSize = 5) => {
    //console.log("Fetching more...")
    const [data, setData] = useState([])
    const [lastDoc, setLastDoc] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        const q = query(
            collectionRef,
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
              })).reverse()
              setData(newData)
              setLastDoc(snapshot.docs[snapshot.docs.length - 1])
              setHasMore(snapshot.docs.length === pageSize)
            } else {
                setHasMore(false)
            }
            setLoading(false)
          },
          (error) => {
            console.error(error)
            setError(error.message)
            setLoading(false)
          }
        )

        return () => unsubscribe()
    }, [])

    const fetchData = async () => {
      //console.log("Fetching more data...")
      if(loading || !hasMore) return

      const q = query(
          collectionRef,
          orderBy("timestamp", "desc"), 
          startAfter(lastDoc),
          limit(pageSize)
      )

      setLoading(true)
      setError(null)

      try {
          const snapshot = await getDocs(q)
          const newData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})).reverse()

          setData(prevData => ([...newData, ...prevData]))
          setLastDoc(snapshot.docs[snapshot.docs.length - 1])
          setHasMore(snapshot.docs.length === pageSize)
      } catch(error) {
          console.error(error)
          setError(error.message)
      } 

      setLoading(false)
  }

    return { data, loading, error, fetchMore: () => fetchData(), hasMore }
}

export default useFirestoreBatch