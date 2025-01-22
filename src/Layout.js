import { useState, useEffect } from "react"
import { Link, Outlet } from "react-router-dom"
import { useAuth } from "./authContext"
import { database, ref, onValue } from "./firebase"

const Layout = () => {
  const [activeUser, setActiveUser] = useState(null)
  const { user, logOut } = useAuth()

  console.log("activeUser", activeUser)

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
          <Link to='/user'>{activeUser.displayName}</Link> :
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
    </div>
  )
}

export default Layout