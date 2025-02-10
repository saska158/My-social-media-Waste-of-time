import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { database, ref, push, onValue } from "./firebase"
import { useAuth } from './authContext'
import MessagesList from "./MessagesList"
import Input from "./Input"
import Button from "./Button"

const ChatRoom = () => {
    //const messages = useOutletContext()

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
      push(roomRef, {text: message, name: user.displayName, photoUrl: user.photoURL || ''})
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
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '550px'
        }}>
            <MessagesList messages={messages} roomId={roomId} />
            <form style={{display: 'flex', padding: '.5em'}}>
              <Input
                type="text"
                value={message}
                placeholder='write your thoughts'
                onChange={handleInput}
              />
              <Button onClick={sendMessage}>send</Button>
            </form>  
        </div>
    )
}

export default ChatRoom