import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/authContext"
import { collection, firestore, onSnapshot } from "../../api/firebase"
import PopUp from "../PopUp"
import UserItem from "./UserItem"

const UsersQuery = ({users, setIsUsersQueryShown}) => {
  // Context
  const { user } = useAuth()  
  
  // State
  //const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Hooks that don't trigger re-renders
  const location = useLocation()
  const prevLocation = useRef(location.pathname)

  // Functions
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }  
  
  // Effects
  /*useEffect(() => {
    if(user) {
      const usersRef = collection(firestore, 'profiles')
      const unsubscribe = onSnapshot(usersRef, (snapshot) => { // loading, skeleton?
        if(!snapshot.empty) {
          const usersArray = snapshot.docs.map((doc) => ({
            ...doc.data(),
            followedByMe: doc.data()?.followers?.some(follower => follower.uid === user.uid)
          }))
          setUsers(usersArray)    
        } else {
            setUsers([])
        }
      })

      return () => unsubscribe()
    }
  }, [])*/

  useEffect(() => {
    if(prevLocation.current !== location.pathname) {
        setIsUsersQueryShown(false)
    } 
    prevLocation.current = location.pathname
  }, [location.pathname])
    
  const filteredUsers = users.filter((user) =>
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
      { filteredUsers.filter(usr => usr.uid !== user.uid).map(usr => <UserItem userItem={usr} users={users} />) }
    </PopUp>
  )
}

export default UsersQuery



