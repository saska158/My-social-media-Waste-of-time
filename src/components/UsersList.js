import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
    database, 
    ref, 
    onValue, 
} from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import UsersQuery from "./UsersQuery"


const UsersList = () => {
    const { user } = useAuth()
    const [listOfUsers, setListOfUsers] = useState([]) //mozda ipak null
    const [isUsersQueryShown, setIsUsersQueryShown] = useState(false)


    useEffect(() => {
        const usersRef = ref(database, 'users')
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val()
           // console.log('Users Data:', Object.values(usersData))
            if(usersData) {
                const usersArray = Object.values(usersData)
                setListOfUsers(usersArray)
            }
        })

        return () => unsubscribe()
    }, [])

    console.log("iz q", user?.uid)

    const activeUsers = listOfUsers.filter(usr => usr.isActive && usr.uid !== user?.uid).map(usr => (
        <div key={usr.uid} /*onClick={() => pickUser(user)}*/>
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
    </div>))

    return (
        <div style={{
              backgroundColor: 'white', 
              width: '35%',
            }}
        >
            {
                activeUsers.length > 0 ? (
                    <>
                      <p>online:</p>
                      {activeUsers}
                    </>
                ) : <p>noone is online</p>
            }
           {
           /*<p>and {listOfUsers.length} others</p>*/}
           <button 
             onClick={(e) => {
                e.stopPropagation()
                setIsUsersQueryShown(true)
             }}
             style={{
                background: 'salmon',
                color: 'white',
                padding: '.6em .8em',
                border: '0',
                borderRadius: '20px'
             }}
            >
                find people to follow
            </button>
           {
            isUsersQueryShown && <UsersQuery 
                                   //listOfUsers={listOfUsers} 
                                   //setListOfUsers={setListOfUsers}
                                   setIsUsersQueryShown={setIsUsersQueryShown}
                                 />
           }
        </div>
    )
}

export default UsersList


            


     

