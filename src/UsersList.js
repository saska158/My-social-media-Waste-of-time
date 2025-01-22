import { useState, useEffect } from "react"
import { 
    database, 
    ref, 
    onValue, 
} from "./firebase"

const UsersList = () => {
    const [users, setUsers] = useState([]) //mozda ipak null

    useEffect(() => {
        const usersRef = ref(database, 'users')
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val()
            console.log('Users Data:', Object.values(usersData))
            if(usersData) {
                const usersArray = Object.values(usersData)
                setUsers(usersArray)
            }
        })

        return () => unsubscribe()
    }, [])


    return (
        <div style={{borderTop: '1px solid black', backgroundColor: 'white'}}>
           <p>Users List:</p>
           {
            users.map(user => (
                <div key={user.uid}>
                    {
                        user.isActive ?
                        <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'green'}}></div> :
                        <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'grey'}}></div>
                    }
                    <p>{user.displayName}</p>
                </div>
            ))
           }
        </div>
    )
}

export default UsersList