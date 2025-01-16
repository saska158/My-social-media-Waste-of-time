import { Link, Outlet } from "react-router-dom"
import { useAuth } from "./authContext"

const Layout = () => {
  const { user, logOut } = useAuth()

  return (
    <div style={{backgroundColor: 'salmon'}}>
      <nav>
        {
          user && user.emailVerified ?
          <Link to='/user'>{user.displayName}</Link> :
          <Link to='/sign-in'>sign in</Link>
        }
        {
          user && user.emailVerified ?
          <button onClick={logOut}>sign out</button> :
          null
        }
      </nav>
      <Outlet />
    </div>
  )
}

export default Layout