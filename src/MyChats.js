import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
    firestore,
    collection,
    query,
    where,
    onSnapshot
 } from "./firebase"
 import { format } from "date-fns"

const MyChats = ({userUid}) => {
    const [chats, setChats] = useState([])

    useEffect(() => {
        if (!userUid) return

        const chatsRef = collection(firestore, 'chats')
        const chatsQuery = query(chatsRef, where('participants', 'array-contains', userUid))

        const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
            const chatData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().createdAt ? doc.data().createdAt.toDate() : null
            }))
            setChats(chatData)
        })

        return () => unsubscribe
    }, [userUid])

    console.log('Chats', chats)

    return (
        <div>
            <h4>My chats</h4>
            {
                chats.map(chat => (
                    <div key={chat.id} style={{borderBottom: '1px solid black', background: 'white', display: 'flex'}}>
                      <img src={chat.lastMessage.senderPhoto} alt="sender photo" style={{width: '20px', display: 'inline'}} />
                      <p>{chat.lastMessage.senderName}: </p>
                      <p>{chat.lastMessage.content}</p>
                      <p>{format(chat.timestamp, "HH:mm")}</p>
                    </div>
                ))
            }
        </div>
    )
}
//<span>{format(chat.lastMessage.timestamp, "HH:mm dd/MM/yyyy")}</span>
export default MyChats