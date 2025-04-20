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
        <Link to="/" className="logo-link">Waste of time</Link>
        {
          user ? (
            <div 
              style={{
                display: 'flex', 
                flexDirection: 'column', 
                gap: '.8em',
                fontSize: '1.2rem'
              }}>
              <NavLink
                to="/"
                style={({ isActive }) => ({
                  color: isActive || 
                  location.pathname === '/movies' || 
                  location.pathname === '/music' || 
                  location.pathname === '/books' ? 'white' : 'black',
                  textTransform: 'uppercase'
                })}
              >
                Home
              </NavLink>
              <NavLink 
                to={`/user/${user?.uid}`}
                style={({ isActive }) => ({ color: isActive ? 'white' : 'black', textTransform: 'uppercase' })}
              >
                My profile
              </NavLink>
              <NavLink 
                to="/my-chats"
                style={({ isActive }) => ({ color: isActive ? 'white' : 'black', textTransform: 'uppercase' })}
              >
                My chats
              </NavLink>
              <button onClick={logOut} className="sign-out-button">sign out</button>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <p style={{fontSize: '2rem'}}>Join us</p>
              <Link to='/sign-up' style={{textTransform: 'uppercase'}}>create account</Link>
              <Link to='/sign-in' style={{textTransform: 'uppercase'}}>sign in</Link>
            </div>
          )
        }
      </nav>
      <Outlet />
      <UsersList />
    </div>
  )
}

export default NavigationLayout