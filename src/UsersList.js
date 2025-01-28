import { useState, useEffect } from "react"
import { 
    database, 
    ref, 
    onValue, 
} from "./firebase"
import ChatBox from "./ChatBox"

const UsersList = () => {
    const [users, setUsers] = useState([]) //mozda ipak null
    const [pickedUser, setPickedUser] = useState(null)
    const [isChatVisible, setisChatVisible] = useState(false)

    useEffect(() => {
        const usersRef = ref(database, 'users')
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val()
           // console.log('Users Data:', Object.values(usersData))
            if(usersData) {
                const usersArray = Object.values(usersData)
                setUsers(usersArray)
            }
        })

        return () => unsubscribe()
    }, [])


    const pickUser = (user) => {
        setisChatVisible(true)
        setPickedUser(user)
    }

    return (
        <div style={{borderTop: '1px solid black', backgroundColor: 'white'}}>
           <p>PICK SOMEONE TO CHAT WITH:</p>
           {
            users.map(user => (
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
            isChatVisible && <ChatBox pickedUser={pickedUser}/>
           }
        </div>
    )
}

export default UsersList