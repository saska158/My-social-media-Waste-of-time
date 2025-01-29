import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
    database, 
    ref, 
    onValue, 
} from "./firebase"
import { useAuth } from "./authContext"
import ChatBox from "./ChatBox"

const UsersList = () => {
    const { user } = useAuth()
    const [listOfUsers, setListOfUsers] = useState([]) //mozda ipak null
    const [pickedUser, setPickedUser] = useState(null)
    const [isChatVisible, setIsChatVisible] = useState(false)

    const navigate = useNavigate()
    //console.log("user from list", user)

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

    useEffect(() => {
        if(!user) {
            setIsChatVisible(false)
        }
    }, [user])


    const pickUser = (userFromList) => {
        if(user) {
            setIsChatVisible(true)
            setPickedUser(userFromList)
        } else {
            navigate('/sign-in') //nemas poruku iz state
        }
    }

    return (
        <div style={{borderTop: '1px solid black', backgroundColor: 'white'}}>
           <p>PICK SOMEONE TO CHAT WITH:</p>
           {
            listOfUsers.map(user => (
                <div key={user.uid} onClick={() => pickUser(user)}>
                    {
                        user.isActive ?
                        <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'green'}}></div> :
                        <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'grey'}}></div>
                    }
                    <p>{user.displayName}</p>
                </div>
            ))
           }
           {
            isChatVisible && <ChatBox pickedUser={pickedUser} setIsChatVisible={setIsChatVisible}/>
           }
        </div>
    )
}

export default UsersList