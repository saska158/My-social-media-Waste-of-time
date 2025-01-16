/*import { useState } from "react"
import { database } from "./firebase"
import { ref, set, onValue } from "firebase/database"

const Room = () => {
    const [message, setMessage] = useState('')
    //const [messages, setMessages] = useState([])

    const messagesBase = ref(database, 'messages')

    onValue(messagesBase, (snapshot) => {
      const data = snapshot.val()
      console.log("messages:", data)
    })

    return (
        <>
          <div className="poruke">
            {}
          </div>
          <input 
            type="text"
            value={message}
            onChange={(e) => { setMessage(e.target.value)}}
          />
          <button onClick={() => set(messagesBase, {text: message})}>send</button>
        </>
    )
}

export default Room*/