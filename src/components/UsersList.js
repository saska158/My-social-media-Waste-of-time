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
        ) : <p style={{fontSize: '1rem'}}>Noone is online.</p>
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
          background: 'salmon',
          color: 'white',
          padding: '.6em .8em',
          border: '0',
          borderRadius: '20px',
          marginTop: '1.5em'
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
        isJoinPopupShown && (
          <PopUp setIsPopUpShown={setIsJoinPopupShown}>
            <h1>Razgovori</h1>
            <p>Sign in or create your account to join the conversation!</p>
            <Link to="/sign-up">
              <button 
                style={{
                  fontSize: '1rem', 
                  background: 'salmon', 
                  padding: '.7em 1.2em', 
                  borderRadius: '10px',
                  color: 'white'
                }}
              >
                Create an account
              </button>
            </Link>
            <Link to="/sign-in">
              <button 
                style={{
                  fontSize: '1rem',
                  padding: '.7em 1.2em', 
                  borderRadius: '10px',
                  background: 'rgba(238, 171, 163, .5)'
                }}
              >
                Sign in
              </button>
            </Link>
          </PopUp>
        )
      }
    </div>
  )
}

export default UsersList


            


     

