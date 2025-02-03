import { Outlet } from "react-router-dom"
import UsersList from "./UsersList"

const Homepage = () => {
    return (
        <>
          <Outlet />
          <UsersList />
        </>
    )
}

export default Homepage