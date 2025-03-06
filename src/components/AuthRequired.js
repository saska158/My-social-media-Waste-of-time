import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/authContext"

const AuthRequired = () => {
    const { user } = useAuth()

    if(!user) {
        return <Navigate to="/" replace/>
    }

    return <Outlet />
}

export default AuthRequired