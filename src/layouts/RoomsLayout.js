import { NavLink, Outlet, useOutletContext } from "react-router-dom"
import { useMediaQuery } from "react-responsive"

const RoomsLayout = () => {
  const { toggleNav } = useOutletContext()

  const routes = [
    { path: "/", label: "Watching" },
    { path: "/reading", label: "Reading" },
    { path: "/listening", label: "Listening" }
  ]

  const isMobile = useMediaQuery({ maxWidth: 767 })

  return (
    <div className="group-chat-layout-container">
      <div className="group-chat-layout-container-nav"> 
        { 
          isMobile && (
            <button onClick={toggleNav}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '25px', color: '#4b896f'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
          )
        }
        {routes.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              background: isActive ? "#eaf4f0" : "none",
              border: isActive ? 'none' : "1px solid #eaf4f0",
              color: '#4b896f',
              borderRadius: '30px',
              padding: '.5em 1em',
              fontWeight: '700',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            })}
          >
            {label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}

export default RoomsLayout