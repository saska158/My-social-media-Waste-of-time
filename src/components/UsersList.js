import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
    database, 
    ref, 
    onValue, 
} from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import UsersQuery from "./UsersQuery"
import PopUp from "./PopUp"
import JoinPopUp from "./JoinPopUp"

const UsersList = () => {
  // Context
  const { user } = useAuth()
  
  // State
  const [listOfUsers, setListOfUsers] = useState([]) 
  const [isUsersQueryShown, setIsUsersQueryShown] = useState(false)
  const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)

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


  const activeUsers = listOfUsers.filter(usr => usr.isActive && usr.uid !== user?.uid).map(usr => (
    <div key={usr.uid}>
      {
        usr.isActive ?
          <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'green'}}></div> :
          <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'grey'}}></div>
      }
      <Link to={`user/${usr.uid}`}>
        <div style={{display: 'flex', alignItems: 'center', gap: '.3em'}}>
          <img 
            src={usr.photoURL || "/images/no-profile-picture.png"} 
            alt="profile"
            style={{
              width: '30px', 
              height: '30px',
              objectFit: 'cover',
              objectPosition: 'top',
              display: 'inline',
              borderRadius: '50%'
            }}
          />
          <span>{usr.displayName}</span>
        </div>
      </Link>
    </div>
  ))

  console.log("user iz user list", user)

  return (
    <div 
      style={{
        backgroundColor: 'white', 
        width: '35%',
        padding: '.5em'
      }}
    >
      {
        activeUsers.length > 0 ? (
          <>
            <p>online:</p>
            {activeUsers}
          </>
        ) : <p style={{fontSize: '1rem', color: 'salmon', margin: '.5em 0'}}>Noone is online.</p>
      }
      <button 
        onClick={(e) => {
          e.stopPropagation()
          if(!user) {
            setIsJoinPopupShown(true)
          } else {
              setIsUsersQueryShown(true)
          }
        }}
        style={{
          border: '.3px solid salmon',
          color: 'salmon',
          background: 'rgb(253, 248, 248)',
          width: '150px',
          borderRadius: '30px',
          padding: '1em',
        }}
      >
        find people to follow
      </button>
      {
        isUsersQueryShown && (
          <UsersQuery 
            setIsUsersQueryShown={setIsUsersQueryShown}
          />
        )
      }
      {
        isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} />
      }
    </div>
  )
}

export default UsersList


            


     

