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
              borderBottom: isActive ? ".5px solid white" : "none",
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