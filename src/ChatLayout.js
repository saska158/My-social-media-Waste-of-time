import { useState, useEffect, useMemo } from "react"
import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom"
import { database, ref, push, onValue } from "./firebase"
import { useAuth } from './authContext'
import UsersList from "./UsersList"

/*
funkcija send message treba da proveri da li je user signinovan, 
i ako nije da navigira na sign in stranu, 
posalji i state object message i from
*/

const ChatLayout = () => {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])

    const { user } = useAuth()
    //console.log("Imamo usera, chatlay:", user)

    const navigate = useNavigate()

    const { roomId } = useParams()

    const roomRef = useMemo(() => {
      const room = roomId ? `${roomId}` : `main`
      return ref(database, room)
    }, [roomId])

    const handleInput = (e) => {
      setMessage(e.target.value)
    }

    const sendMessage = (e) => {
      e.preventDefault()
      if(!user) {
        navigate('/sign-in', {
          state: {
            message: 'You need to sign up to send a message.',
            from: '/' //ovde treba da bude ruta posebnih soba, ne znam kako
          }
        })
        setMessage('')
        return
      }
      push(roomRef, {text: message, name: user.displayName})
      setMessage('')
    }

    /* postavljamo slushac poruka u realtime-u */
    useEffect(() => {
      const unsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val()
        if(data) {
          const messagesArray = Object.keys(data).map((key) => ({id: key, ...data[key]}))
          setMessages(messagesArray)
        } else {
          setMessages([])
        }
      })
  
      return () => unsubscribe()
    }, [roomRef])



    return (
        <>
          <div style={{backgroundColor: 'grey'}}>
            <NavLink to='/'>Main</NavLink>
            <NavLink to='/movies'>Movies</NavLink>
            <NavLink to='/books'>Books</NavLink>
            <NavLink to='/music'>Music</NavLink>
            <Outlet context={messages}/>
            <form>
              <input 
                type="text" 
                value={message}
                onChange={handleInput}
              />
              <button onClick={sendMessage}>send</button>
            </form>
            <UsersList />
          </div>
        </>
    )
}

export default ChatLayout