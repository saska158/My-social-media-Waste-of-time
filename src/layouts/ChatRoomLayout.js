import { NavLink, Outlet } from "react-router-dom"

const ChatRoomLayout = () => {
  return (
    <div 
      style={{
        width: '100%',
      }}>
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
          <NavLink to='/'>Main</NavLink>
          <NavLink to='/movies'>Movies</NavLink>
          <NavLink to='/books'>Books</NavLink>
          <NavLink to='/music'>Music</NavLink>
        </nav>
        <Outlet />
      </div>
    </div>
  )
}

export default ChatRoomLayout