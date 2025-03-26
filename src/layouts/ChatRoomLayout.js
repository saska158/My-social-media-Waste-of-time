import { NavLink, Outlet } from "react-router-dom"

const ChatRoomLayout = () => {

  const routes = [
    { path: "/", label: "Main" },
    { path: "/movies", label: "Movies" },
    { path: "/books", label: "Books" },
    { path: "/music", label: "Music" }
  ]


  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        background: 'white'
      }}
    >
      <nav 
        style={{
          display: 'flex', 
          justifyContent: 'flex-start', 
          gap: '1em', 
          color: 'white',
          backgroundColor: 'salmon',
          padding: '1em'
        }}
      >
        {routes.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              borderBottom: isActive ? ".5px solid white" : "none"
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}

export default ChatRoomLayout