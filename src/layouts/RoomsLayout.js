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
              border: isActive ? ".5px solid #4f3524" : "none",
              borderRadius: '30px',
              padding: '.5em 1em'
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