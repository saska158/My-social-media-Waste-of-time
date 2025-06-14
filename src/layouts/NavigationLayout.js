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
      <nav 
        className="navigation-layout-container-nav"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/background.png)`,
          backgroundSize: 'cover'
        }}
      > 
        <Link to="/" className="logo-link">
          <img src={`${process.env.PUBLIC_URL}/images/logo.png`} />
        </Link>
        { isMobile && <UsersList /> }
        {
          user ? (
            <div className="navigation-layout-nav-links">
             {/* <NavLink
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
              </NavLink>*/}
              <NavLink 
                to={`/user/${user?.uid}`}
                className={({isActive}) => isActive ? 
                  'navigation-layout-nav-link active-nav-link' : 
                  'navigation-layout-nav-link' 
                }
              >
                <img 
                  src={user.photoURL} 
                  alt="profile image" 
                  className="user-img user-img-small" 
                  style={{display: 'inline-block'}} 
                />
                <span>Profile</span>
              </NavLink>
              <NavLink 
                to="/my-chats"
                className={({isActive}) => isActive ? 
                  'navigation-layout-nav-link active-nav-link' : 
                  'navigation-layout-nav-link' 
                }
              >
                Chat
              </NavLink>
              {
                authLoading ? (
                  <ClipLoader color="white" size={30} />
                ) : (
                  <button
                    onClick={logOut} 
                    className="navigation-layout-nav-link"
                    style={{fontSize: '1rem'}}
                    disabled={authLoading}
                  >
                    Sign out
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
        <p style={{color: '#4b896f', marginTop: 'auto'}}>
          Made by <Link to="https://www.justsittingdoingnothing.com/" target="_blank" style={{textDecoration: 'underline'}}>Just Sitting Doing Nothing</Link>
        </p>
      </nav>
      <Outlet />
      { isDesktop && <UsersList /> }
    </div>
  )
}

export default NavigationLayout