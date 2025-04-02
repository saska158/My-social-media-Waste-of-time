import { Outlet } from "react-router-dom"

const Homepage = () => {
    return (
        <div className="home-page-container">
          <Outlet />
        </div>
    )
}

export default Homepage