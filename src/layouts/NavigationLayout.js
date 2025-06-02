import { useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/authContext"
import UsersList from "../components/users_list/UsersList"
import { ClipLoader } from "react-spinners"
import ErrorMessage from "../components/errors/ErrorMessage"
import { useMediaQuery } from "react-responsive"
import { useTheme } from "../contexts/themeContext"

const NavigationLayout = () => {
  // Context
  const { user, logOut, authLoading, authError } = useAuth() 
  const { theme, toggleTheme} = useTheme()

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
                style={({ isActive }) => ({
                  color: isActive || 
                  location.pathname === '/movies' || 
                  location.pathname === '/music' || 
                  location.pathname === '/books' ? 'white' : '#f29bbe',
                  textTransform: 'uppercase'
                })}
              >
                Home
              </NavLink>
              <NavLink 
                to={`/user/${user?.uid}`}
                style={({ isActive }) => ({ color: isActive ? 'white' : '#f29bbe', textTransform: 'uppercase' })}
              >
                My profile
              </NavLink>
              <NavLink 
                to="/my-chats"
                style={({ isActive }) => ({ color: isActive ? 'white' : '#f29bbe', textTransform: 'uppercase' })}
              >
                My chats
              </NavLink>
              {
                authLoading ? (
                  <ClipLoader color="white" size={30} />
                ) : (
                  <button
                    onClick={logOut} 
                    className="sign-out-button"
                    disabled={authLoading}
                  >
                    sign out
                  </button>

                )
              }
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <p style={{fontSize: '2rem'}}>Join us</p>
              <Link to='/sign-up' style={{textTransform: 'uppercase'}}>create account</Link>
              <Link to='/sign-in' style={{textTransform: 'uppercase'}}>sign in</Link>
            </div>
          )
        }
        <button style={{marginTop: 'auto'}} onClick={toggleTheme}>
          {
            theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{color: '#f29bbe', width: '30px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{color: '#f29bbe', width: '30px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )
          }
        </button>
      </nav>
      <Outlet />
      { isDesktop && <UsersList /> }
    </div>
  )
}

export default NavigationLayout