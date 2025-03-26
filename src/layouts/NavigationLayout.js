import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/authContext"
import UsersList from "../components/UsersList"


const NavigationLayout = () => {
  // Context
  const { user, logOut } = useAuth() 

  // Hooks that don't trigger re-renders  
  const location = useLocation()

  return (
    <div style={{
      backgroundColor: 'rgb(238, 171, 163)',
      display: 'flex',
      height: '100vh'
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
        <Link 
          to="/" 
          style={{
            fontSize: '2rem',
            textTransform: 'initial',
            color: 'white'
          }}
        >
          Razgovori
        </Link>
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