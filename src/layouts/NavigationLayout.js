import { useState, useEffect } from "react"
import { Link, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/authContext"
import { database, ref, onValue } from "../api/firebase"
import UsersList from "../components/UsersList"


const NavigationLayout = () => {
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
    <div style={{
      backgroundColor: 'rgb(238, 171, 163)',
      display: 'flex',
      }}
    >
      <nav style={{
        backgroundColor: 'rgb(241, 137, 125)',
        padding: '.5em 2em',
        width: '27%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        }}
      >
        {
          activeUser && activeUser.isActive ? (
            <>
              <Link to="/">Home</Link>
              {/*<Link to="/my-profile">My profile</Link>*/}
              <Link to={`/user/${user?.uid}`}>My profile</Link>
              <Link to="/my-chats">My chats</Link>
              <button onClick={logOut}>sign out</button>
            </>
          ) : (
            <>
            <p style={{fontSize: '2rem'}}>Join us</p>
              <Link to='/sign-up'>create account</Link>
              <Link to='/sign-in'>sign in</Link>
            </>
          )
        }
      </nav>
      <Outlet />
      <UsersList />
    </div>
  )
}

export default NavigationLayout