import { useState, useEffect, useRef, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/authContext"
import { collection, firestore } from "../../api/firebase"
import PopUp from "../PopUp"
import UserItem from "./UserItem"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"

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
  const {data: users, loading, fetchMore, hasMore } = useFirestoreBatch(usersRef, 3)

  // Hooks that don't trigger re-renders
  const location = useLocation()
  const prevLocation = useRef(location.pathname)

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
    
  const filteredUsers = users?.filter((user) =>
      user.displayName.toLowerCase().startsWith(searchQuery.toLowerCase())
  )

  return (
    <PopUp setIsPopUpShown={setIsUsersQueryShown} style={{overflow: 'auto'}}>
      <input
        type="text"
        placeholder="search users"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{margin: '1em', alignSelf: 'flex-start'}}
      />
      { filteredUsers
          .filter(usr => usr.uid !== user.uid)
          .map((usr, index) => <UserItem key={index} userItem={usr}/>) 
      }
      <div style={{position: 'absolute', bottom: '0', padding: '1em'}}>
        {
          loading ? (
            <ClipLoader color="salmon" />
          ) : (
            hasMore && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  fetchMore()
                }} 
                disabled={loading}
              >
                load more
              </button>
            )
          )
        }
      </div>
    </PopUp>
  )
}

export default UsersQuery



