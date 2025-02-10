import { Outlet } from "react-router-dom"
import UsersList from "./UsersList"

const Homepage = () => {
    return (
        <div style={{
            display: 'flex', 
            justifyContent: 'center', 
            gap: '.5em', 
            height: '100vh',
            padding: '1em',
        }}>
          <Outlet />
          <UsersList />
        </div>
    )
}

export default Homepage