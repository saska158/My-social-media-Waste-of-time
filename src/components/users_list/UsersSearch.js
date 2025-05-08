import { useState, useEffect, useRef, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/authContext"
import { collection, firestore, query, orderBy , limit, startAfter, startAt, endAt, getDocs, onSnapshot } from "../../api/firebase"
import PopUp from "../PopUp"
import UserCard from "./UserCard"
import { ClipLoader } from "react-spinners"
import InfiniteScroll from "react-infinite-scroll-component"
import UserSkeleton from "../skeletons/UserSkeleton"

const UsersSearch = ({setIsUsersQueryShown}) => {
  // Context
  const { user } = useAuth()  
  
  // State
  const [filteredUsers, setFilteredUsers] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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
    if(prevLocation.current !== location.pathname) {
        setIsUsersQueryShown(false)
    } 
    prevLocation.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    if (!usersRef) return

      const q = query(
          usersRef,
          orderBy("displayName"), 
          startAt(searchQuery),
          endAt(searchQuery + '\uf8ff'),
          limit(10) 
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
            setHasMore(snapshot.docs.length === 10)
            setLoading(false)
          } else {
            setFilteredUsers([])
            setHasMore(false)
          }
          setLoading(false)
        },
        (error) => {
          console.error(error)
          setError(error.message)
        }
      )

      return () => unsubscribe()
  }, [searchQuery])

  // Functions
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }  

  const fetchMore = async () => {
    //console.log("Fetching more data...")
    if(loading || !hasMore || !lastDoc) return
  
    try {
      const q = query(
        usersRef,
        orderBy("displayName"), 
        startAfter(lastDoc),
        limit(10 + 1)
      )
  
      const snapshot = await getDocs(q)
      const docs = snapshot.docs
  
      if (docs.length > 10) {
        const newData = docs.slice(0, 10).map(doc => ({ id: doc.id, ...doc.data() }))
        setFilteredUsers(prev => [...prev, ...newData])
        setLastDoc(docs[10 - 1]) 
        setHasMore(true) 
      } else {
        const newData = docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setFilteredUsers(prev => [...prev, ...newData])
        setLastDoc(null) 
        setHasMore(false) 
        setLoading(false)
      }
    } catch(error) {
      console.error(error)
      setError(error.message)
      // setLoading(false)
    } 
  
    setLoading(false)
  }
    

  return (
    <PopUp setIsPopUpShown={setIsUsersQueryShown}>
      <input
        type="text"
        placeholder="search users"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{margin: '1em', alignSelf: 'flex-start'}}
      />
      <div 
        style={{ height: '300px', overflowY: 'auto'}}
        id="scrollableUsersDiv"
        ref={usersContainerRef}
      >
        <InfiniteScroll
          dataLength={filteredUsers.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<ClipLoader color="salmon" />}
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
    </PopUp>
  )
}

export default UsersSearch



    

    