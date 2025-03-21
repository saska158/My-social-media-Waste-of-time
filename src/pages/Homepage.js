import { Outlet } from "react-router-dom"

const Homepage = () => {
    return (
        <div 
          style={{
            display: 'flex', 
            justifyContent: 'center', 
            gap: '.5em', 
            height: '100vh',
            padding: '1em',
            width: '73%'
          }}
        >
          <Outlet />
        </div>
    )
}

export default Homepage