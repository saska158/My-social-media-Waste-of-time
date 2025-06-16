import { Outlet, Navigate, useOutletContext } from "react-router-dom"
import { useAuth } from "../contexts/authContext"

const AuthRequired = () => {
    const { user } = useAuth()
    const { toggleNav } = useOutletContext()

    if(!user) {
        return <Navigate to="/" replace/>
    }

    return <Outlet context={{toggleNav}} />
}

export default AuthRequired