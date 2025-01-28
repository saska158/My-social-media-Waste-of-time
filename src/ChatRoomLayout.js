//import { useState, useEffect, useMemo } from "react"
import { NavLink, Outlet/*, useParams, useNavigate */} from "react-router-dom"
////import { database, ref, push, onValue } from "./firebase"
//import { useAuth } from './authContext'
//import Form from "./Form"
//import Input from "./Input"
//import Button from "./Button"

/*
funkcija send message treba da proveri da li je user signinovan, 
i ako nije da navigira na sign in stranu, 
posalji i state object message i from
*/

const ChatRoomLayout = () => {
    
    return (
        <>
          <div style={{backgroundColor: 'grey'}}>
            <NavLink to='/'>Main</NavLink>
            <NavLink to='/movies'>Movies</NavLink>
            <NavLink to='/books'>Books</NavLink>
            <NavLink to='/music'>Music</NavLink>
            <Outlet />
          </div>
        </>
    )
}

export default ChatRoomLayout