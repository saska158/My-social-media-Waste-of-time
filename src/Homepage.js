import { useState, useEffect } from "react"
import { Link, Outlet } from "react-router-dom"
import { useAuth } from "./authContext"
import { database, ref, onValue } from "./firebase"
import UsersList from "./UsersList"

const Homepage = () => {
  const [activeUser, setActiveUser] = useState(null)//sta sam ovde sve izbrljala sa ovim active, proveriiii
  const { user, logOut } = useAuth() //sto nisam samo pomocu ovoga???

  //console.log("activeUser", activeUser)

  useEffect(() => {
    const userRef = ref(database, `users/${user?.uid}`)
    const unsubscribe = onValue(userRef, (snapshot) => {
      const userData = snapshot.val()
      if(userData) {
        setActiveUser(userData)
      }
    })
    return () => unsubscribe()
  }, [user])

  return (
    <div style={{backgroundColor: 'salmon'}}>
      <nav>
        {
          //user && user.emailVerified ?
          activeUser && activeUser.isActive ?
          <Link to='/my-profile'>{activeUser.displayName}</Link> :
          <Link to='/sign-in'>sign in</Link>
        }
        {
          //user && user.emailVerified ?
          activeUser && activeUser.isActive ?
          <button onClick={logOut}>sign out</button> :
          null
        }
      </nav>
      <Outlet />
      <UsersList />
    </div>
  )
}

export default Homepage