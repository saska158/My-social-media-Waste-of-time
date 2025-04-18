import { useState, useEffect, useRef, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/authContext"
import { collection, firestore } from "../../api/firebase"
import PopUp from "../PopUp"
import UserItem from "./UserItem"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import InfiniteScroll from "react-infinite-scroll-component"
import UserSkeleton from "../skeletons/UserSkeleton"

const UsersQuery = ({setIsUsersQueryShown}) => {
  // Context
  const { user } = useAuth()  
  
  // State
  const [searchQuery, setSearchQuery] = useState('')

  // Memoized values
  const usersRef = useMemo(() => {
    return collection(firestore, 'profiles')
  }, [])
  
  // Custom hooks
  const {data: users, loading, fetchMore, hasMore } = useFirestoreBatch(usersRef, 5)
 
  // Hooks that don't trigger re-renders
  const location = useLocation()
  const prevLocation = useRef(location.pathname)
  const usersContainerRef = useRef(null)

  // Functions
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }  

  // Effects
  useEffect(() => {
    if(prevLocation.current !== location.pathname) {
        setIsUsersQueryShown(false)
    } 
    prevLocation.current = location.pathname
  }, [location.pathname])
    
  const filteredUsers = useMemo(() => {
    return users?.filter((usr) => (
      usr.uid !== user.uid && usr.displayName.toLowerCase().startsWith(searchQuery.toLowerCase())
    ))
  }, [users, searchQuery])


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
          //loader={<ClipLoader color="salmon" />}
          scrollThreshold={0.9}
          endMessage={
           <p style={{ textAlign: 'center' }}>
            Yay! You have seen it all
           </p>
          }
          scrollableTarget="scrollableUsersDiv"
        >
          <div>
            {
              loading ? <UserSkeleton /> : (
                filteredUsers.length > 0 ? (
                  filteredUsers.map((usr, index) => <UserItem key={index} userItem={usr}/>) 
                ) : (
                  <p>There's no post yet</p>
                )
              )
            }
          </div>
        </InfiniteScroll>
      </div>
    </PopUp>
  )
}

export default UsersQuery



