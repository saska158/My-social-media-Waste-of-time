import { NavLink, Outlet } from "react-router-dom"

const RoomsLayout = () => {

  const routes = [
    { path: "/", label: "Main" },
    { path: "/watching", label: "Watching" },
    { path: "/reading", label: "Reading" },
    { path: "/listening", label: "Listening" }
  ]

  return (
    <div className="group-chat-layout-container">
      <div className="group-chat-layout-container-nav"> 
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
              fontWeight: '700'
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