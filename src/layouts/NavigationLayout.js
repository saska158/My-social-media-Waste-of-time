import { useState, useEffect } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/authContext"
import UsersList from "../components/users_list/UsersList"
import { ClipLoader } from "react-spinners"
import ErrorMessage from "../components/errors/ErrorMessage"
import { useMediaQuery } from "react-responsive"

const NavigationLayout = () => {
  // Context
  const { user, logOut, authLoading, authError } = useAuth() 
  console.log('user', user?.uid)

  const isMobile = useMediaQuery({ maxWidth: 767 })
  const isDesktop = useMediaQuery({ minWidth: 768 })

  const [navOpen, setNavOpen] = useState(false)

  // Hooks that don't trigger re-renders  
  const location = useLocation()

  const toggleNav = () => {
    console.log("navopen", navOpen)
    setNavOpen(prev => !prev)
  }

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  if(authError) {
    return <ErrorMessage message={authError} />
  }

  return (
    <div className="navigation-layout-container">
      <nav 
        className={`navigation-layout-container-nav ${isMobile && navOpen && 'navigation-layout-container-nav-open'}`}
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/background.png)`,
          backgroundSize: 'cover'
        }}
      > 
        {
          isMobile && (
            <button
              onClick={() => setNavOpen(false)} 
              style={{position: 'absolute', top: '0', right: '0'}}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '25px', color: '#fff'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )
        }
        <Link to="/" className="logo-link">
          <img src={`${process.env.PUBLIC_URL}/images/logo-light.png`} />
        </Link>
        { !user && (
          <p 
            style={{
              fontFamily: '"Cormorant", serif', 
              fontStyle: 'italic',
              fontSize: '1.5rem',
              fontWeight: '300'
            }}
          >
            Do nothing. It's beautiful.
          </p>
        ) }
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
                <img 
                  src={`${process.env.PUBLIC_URL}/images/icon-light.png`}
                  alt="profile image" 
                  className="user-img user-img-small" 
                  style={{display: 'inline-block'}} 
                />
                <span>Home</span>
              </NavLink>
              <NavLink 
                to={`/user/${user?.uid}`}
                /*className={({isActive}) => isActive ? 
                  'navigation-layout-nav-link active-nav-link' : 
                  'navigation-layout-nav-link' 
                }*/
                className='navigation-layout-nav-link'
                style={({isActive}) => ({
                  background: isActive ? 'rgba(250, 250, 250, .3)' : 'transparent'
                })}
              >
                <img 
                  src={user.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
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
                💬 Chat
              </NavLink>
              {
                authLoading ? (
                  <ClipLoader color="white" size={30} />
                ) : (
                  <button
                    onClick={logOut} 
                    className="navigation-layout-nav-link sign-out-btn"
                    disabled={authLoading}
                  >
                    👋 Sign out
                  </button>

                )
              }
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5em'}}>
              <Link to='/sign-up' className="navigation-layout-nav-link" >✨ Create account</Link>
              <Link to='/sign-in' className="navigation-layout-nav-link" >🚪 Sign in</Link>
            </div>
          )
        }
        <div className="navigation-layout-footer">
          <p style={{display: 'flex', alignItems: 'flex-end', gap: '.3em'}}>
            Made by
            <img
              src={`${process.env.PUBLIC_URL}/images/saki.jpg`}
              alt="profile img"
              className="user-img user-img-extra-small"
              style={{display: 'inline'}}
            />   
          <Link 
            to="https://www.linkedin.com/in/saska-mikic-4ba087270/" 
            target="_blank" 
            style={{textDecoration: 'underline'}}
          >
            Saska (Linkedin)
          </Link>
          </p>
          <p>
            <Link 
            to="https://github.com/saska158/My-social-media-Waste-of-time" 
            target="_blank" 
            style={{textDecoration: 'underline', display: 'inline-block'}}
          >
            For Developers (Github)
          </Link> 
          </p>
          <p>
            <Link 
            to="https://www.justsittingdoingnothing.com/"
            target="_blank" 
            style={{textDecoration: 'underline'}}
          >Just Sitting Doing Nothing (Personal Website)</Link>
          </p>
        </div>
      </nav>
      <Outlet context={{ toggleNav }} />
      { isDesktop && <UsersList /> }
    </div>
  )
}

export default NavigationLayout