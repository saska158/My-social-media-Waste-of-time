import { useState, useEffect } from "react"
import { database, ref, onValue } from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import UsersQuery from "./UsersQuery"
import JoinPopUp from "../JoinPopUp"
import ActiveUser from "./ActiveUser"

const UsersList = () => {
  // Context
  const { user } = useAuth()
  
  // State
  const [listOfUsers, setListOfUsers] = useState([]) 
  const [isUsersQueryShown, setIsUsersQueryShown] = useState(false)
  const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)

  // Functions
  const findPeopleToFollow = (e) => {
    e.stopPropagation()
    if(!user) {
      setIsJoinPopupShown(true)
    } else {
      setIsUsersQueryShown(true)
    }
  }

  // Effects
  useEffect(() => {
    const usersRef = ref(database, 'users')
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val()
      if(usersData) {
        const usersArray = Object.values(usersData)
        setListOfUsers(usersArray)
      }
    })

    return () => unsubscribe()
  }, [])


  const activeUsersArray = listOfUsers.filter(usr => usr.isActive && usr.uid !== user?.uid)
  const activeUsers = activeUsersArray.map(usr => <ActiveUser user={usr} />)

  return (
    <div className="users-list-container">
      <div>
        {activeUsers.length > 0 ? activeUsers : 'Noone is online.'}
      </div>
      <button onClick={findPeopleToFollow} className="users-list-follow-button">
        find people to follow
      </button>
      { isUsersQueryShown && <UsersQuery {...{ setIsUsersQueryShown }}/>}
      { isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} /> }
    </div>
  )
}

export default UsersList


            


     

