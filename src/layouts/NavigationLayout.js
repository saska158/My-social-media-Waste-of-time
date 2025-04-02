import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/authContext"
import UsersList from "../components/users_list/UsersList"


const NavigationLayout = () => {
  // Context
  const { user, logOut } = useAuth() 

  // Hooks that don't trigger re-renders  
  const location = useLocation()

  return (
    <div className="navigation-layout-container">
      <nav> 
        <Link to="/" className="logo-link">Razgovori</Link>
        {
          user ? (
            <>
              <NavLink
                to="/"
                style={({ isActive }) => ({
                  color: 
                    isActive 
                    || location.pathname === '/movies' 
                    || location.pathname === '/music' 
                    || location.pathname === '/books' ? 'white' : 'black'
                })}
              >
                Home
              </NavLink>
              <NavLink 
                to={`/user/${user?.uid}`}
                style={({ isActive }) => ({
                  color: isActive ? 'white' : 'black'
                })}
              >
                My profile
              </NavLink>
              <NavLink 
                to="/my-chats"
                style={({ isActive }) => ({
                  color: isActive ? 'white' : 'black'
                })}
              >
                My chats
              </NavLink>
              <button onClick={logOut} className="sign-out-button">
                sign out
              </button>
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