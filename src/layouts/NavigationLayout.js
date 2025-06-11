import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/authContext"
import UsersList from "../components/users_list/UsersList"
import { ClipLoader } from "react-spinners"
import ErrorMessage from "../components/errors/ErrorMessage"
import { useMediaQuery } from "react-responsive"

const NavigationLayout = () => {
  // Context
  const { user, logOut, authLoading, authError } = useAuth() 

  const isMobile = useMediaQuery({ maxWidth: 767 })
  const isDesktop = useMediaQuery({ minWidth: 768 })

  // Hooks that don't trigger re-renders  
  const location = useLocation()

  if(authError) {
    return <ErrorMessage message={authError} />
  }

  return (
    <div className="navigation-layout-container">
      <nav className="navigation-layout-container-nav"> 
        <Link to="/" className="logo-link">Waste of time</Link>
        { isMobile && <UsersList /> }
        {
          user ? (
            <div className="navigation-layout-nav-links">
              <NavLink
                to="/"
                className={({isActive}) => isActive || 
                  location.pathname === '/watching' || 
                  location.pathname === '/listening' || 
                  location.pathname === '/reading' ? 
                  'navigation-layout-nav-link active-nav-link' : 
                  'navigation-layout-nav-link' 
                }
              >
                Home
              </NavLink>
              <NavLink 
                to={`/user/${user?.uid}`}
                className={({isActive}) => isActive ? 
                  'navigation-layout-nav-link active-nav-link' : 
                  'navigation-layout-nav-link' 
                }
              >
                My profile
              </NavLink>
              <NavLink 
                to="/my-chats"
                className={({isActive}) => isActive ? 
                  'navigation-layout-nav-link active-nav-link' : 
                  'navigation-layout-nav-link' 
                }
              >
                My chats
              </NavLink>
              {
                authLoading ? (
                  <ClipLoader color="white" size={30} />
                ) : (
                  <button
                    onClick={logOut} 
                    className="light-border"
                    disabled={authLoading}
                  >
                    sign out
                  </button>

                )
              }
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '.5em'}}>
              <Link to='/sign-up' className="navigation-layout-nav-link" >create account</Link>
              <Link to='/sign-in' className="navigation-layout-nav-link" >sign in</Link>
            </div>
          )
        }
      </nav>
      <Outlet />
      { isDesktop && <UsersList /> }
    </div>
  )
}

export default NavigationLayout