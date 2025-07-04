import { useState, useEffect, useRef, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { 
  collection, 
  firestore, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  startAt, 
  endAt, 
  getDocs, 
  onSnapshot 
} from "../../api/firebase"
import UserCard from "./UserCard"
import { ClipLoader } from "react-spinners"
import InfiniteScroll from "react-infinite-scroll-component"
import UserSkeleton from "../skeletons/UserSkeleton"
import ErrorMessage from "../errors/ErrorMessage"

const UsersSearch = ({style=null}) => { 
  
  // State
  const [filteredUsers, setFilteredUsers] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [retryFlag, setRetryFlag] = useState(0)

  // Memoized values
  const usersRef = useMemo(() => {
    return collection(firestore, 'profiles')
  }, [])
  
 
  // Hooks that don't trigger re-renders
  const location = useLocation()
  const prevLocation = useRef(location.pathname)
  const usersContainerRef = useRef(null)

  // Effects

  useEffect(() => {
    if (!usersRef) return

    const q = query(
      usersRef,
      orderBy("displayName"), 
      startAt(searchQuery),
      endAt(searchQuery + '\uf8ff'),
      limit(15) 
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
          setFilteredUsers(newData)
          setLastDoc(snapshot.docs[snapshot.docs.length - 1])
          setHasMore(snapshot.docs.length === 15)
          setLoading(false)
        } else {
          setFilteredUsers([])
          setHasMore(false)
        }
        setLoading(false)
      },
      (error) => {
        console.error(error)

        let errorMessage 

        if (error.code === "permission-denied") {
          errorMessage = "You don’t have permission to access the users' data."
        } else if (error.code === "unavailable") {
          errorMessage = "Network issue. Please try again later."
        } else if (error.code === "not-found") {
          errorMessage = "Requested data not found."
        } else if (error.code === "cancelled") {
          errorMessage = "The request was cancelled."
        } else {
          errorMessage = "Something went wrong. Please try again."
        }
        setError(errorMessage)
      }
    )

    return () => unsubscribe()
  }, [searchQuery, retryFlag])

  // Functions
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase())
  }  

  const fetchMore = async () => {
    if(loading || !hasMore || !lastDoc) return
  
    try {
      const q = query(
        usersRef,
        orderBy("displayName"), 
        startAfter(lastDoc),
        limit(15 + 1)
      )
  
      const snapshot = await getDocs(q)
      const docs = snapshot.docs
  
      if (docs.length > 15) {
        const newData = docs.slice(0, 15).map(doc => ({ id: doc.id, ...doc.data() }))
        setFilteredUsers(prev => [...prev, ...newData])
        setLastDoc(docs[15 - 1]) 
        setHasMore(true) 
      } else {
        const newData = docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setFilteredUsers(prev => [...prev, ...newData])
        setLastDoc(null) 
        setHasMore(false) 
      }
    } catch(error) {
      console.error(error)
      
      let errorMessage 

      if (error.code === "permission-denied") {
        errorMessage = "You don’t have permission to access the users' data."
      } else if (error.code === "unavailable") {
        errorMessage = "Network issue. Please try again later."
      } else if (error.code === "not-found") {
        errorMessage = "Requested data not found."
      } else if (error.code === "cancelled") {
        errorMessage = "The request was cancelled."
      } else {
        errorMessage = "Something went wrong. Please try again."
      }
      setError(errorMessage)
    } 
  }

  return (
    <div style={style}>
      <div className="input-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px', color: '#4b896f'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Find people"
          value={searchQuery}
          onChange={handleSearchChange}
         style={{fontSize: '1rem'}}
        />
      </div>
      <div 
        className="users-search-infinite"
        id="scrollableUsersDiv"
        ref={usersContainerRef}
      >
        {error && <ErrorMessage message={error} onRetry={() => setRetryFlag(prev => prev + 1)} />}
        <InfiniteScroll
          dataLength={filteredUsers.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<ClipLoader color="#4b896f" />}
          scrollThreshold={0.9}
          scrollableTarget="scrollableUsersDiv"
        >
          <div>
            {
              loading ? <UserSkeleton /> : (
                filteredUsers.length > 0 ? (
                  filteredUsers.map((usr, index) => <UserCard key={index} userItem={usr}/>) 
                ) : (
                  <p>There's no users.</p>
                )
              )
            }
          </div>
        </InfiniteScroll>
      </div>
    </div>  
  )
}

export default UsersSearch



    

    