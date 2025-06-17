import { useState, useEffect } from "react"
import { NavLink, Outlet, useOutletContext } from "react-router-dom"
import { useMediaQuery } from "react-responsive"

const RoomsLayout = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset)
  const [isVisible, setIsVisible] = useState(true)

  const { toggleNav } = useOutletContext()

  const routes = [
    { path: "/", label: "📺 Watch" },
    { path: "/reading", label: "📚 Read" },
    { path: "/listening", label: "🎷 Listen" }
  ]

  const isMobile = useMediaQuery({ maxWidth: 767 })

  //handling header visibility based on scrolling:

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset
      setIsVisible(prevScrollPos > currentScrollPos)
      setPrevScrollPos(currentScrollPos)
    }
  
    window.addEventListener('scroll', handleScroll)
  
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [prevScrollPos])


  return (
    <div className="group-chat-layout-container">
      <div className={isVisible ? "group-chat-layout-container-nav" : "disappear"}> 
        {
        isMobile && (
          <div style={{display: 'flex', alignItems: 'center', gap: '1em'}}>
            <button onClick={toggleNav} className="no-padding-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '25px', color: '#4b896f'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
            <img
              src={`${process.env.PUBLIC_URL}/images/icon-green.png`}
              className="user-img user-img-medium"
              alt="logo"
            />
          </div>
        )
      }
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1em'}}>
          {routes.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className="post-category-navlink"
            style={({ isActive }) => ({
              background: isActive ? "#eaf4f0" : "none",
              border: isActive ? 'none' : "2px solid #eaf4f0",
            })}
          >
            {label}
          </NavLink>
        ))}
        </div>
      </div>
      <Outlet />
    </div>
  )
}

export default RoomsLayout