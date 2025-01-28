import { useState, useEffect } from "react"
import {
    firestore, 
    collection,
    doc, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    setDoc,
    serverTimestamp,
    orderBy, 
    onSnapshot
} from "./firebase"
//import MessagesList from './MessagesList'
//import Messages from "./Messages"
import Input from './Input'
import Button from './Button'
import { useAuth } from "./authContext"

const ChatBox = ({pickedUser}) => {
    //const [isFullScreen, setIsFullScreen] = useState(false)
    const [chatId, setChatId] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const { user } = useAuth()


    // Create or get the chatId when the component mounts or user UIDs change
    useEffect(() => {
        const generatedChatId = [user.uid, pickedUser.uid].sort().join("_")
        setChatId(generatedChatId)
    }, [user.uid, pickedUser.uid])

    // Real-time listener for fetching messages
    useEffect(() => {
        if(!chatId) return

        const messagesRef = collection(firestore, "chats", chatId, "messages")
        const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"))

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            setMessages(fetchedMessages)
        })

        return () => unsubscribe()

    }, [chatId])

    //console.log("User iz Box:", user.uid)
    //console.log("picked", pickedUser.uid)
    //ovaj chat id: const chatId = [userAUid, userBUid].sort().join("_")
    //mi treba van funkcije sendMessage da ga upotrebim za 
    //slusanje poruka i mozda useMemo?
    //i ovo: const chatsRef = collection(firestore, 'chats')

    const sendMessage = async (e, userAUid, userBUid) => {
        e.preventDefault()

        try {
            const chatsRef = collection(firestore, 'chats')
            const chatDoc = doc(chatsRef, chatId)

            // Ensure consistent order for user IDs (e.g., 'user1_user2' and 'user2_user1' are treated the same)
            //const chatId = [userAUid, userBUid].sort().join("_")

            // Check if the chat exists, if not create it
            const chatSnapshot = await getDocs(query(chatsRef, where("__name__", "==", chatId)))
            
            if(chatSnapshot.empty) {
                // Chat doesn't exist, create a new one
                await setDoc(chatDoc, {
                    participants: [userAUid, userBUid],
                    createdAt: serverTimestamp(),
                })
            }

            // Add the message to the messages subcollection of the chat
            const messagesRef = collection(chatDoc, "messages")
            await addDoc(messagesRef, {
                senderUid: userAUid,
                content: message,
                timestamp: serverTimestamp() 
            })
            setMessage('')
            console.log("Message sent successfully!")
        } catch(error) {
            console.error("Error sending message:", error)
        }
    }

    return (
        <div className="chat-box" style={{width: '300px', height: '500px'}}>
            <p style={{backgroundColor: 'salmon'}}>
                { pickedUser.displayName }
                {/*<span onClick={() => setIsFullScreen(!isFullScreen)}>o</span>*/}
            </p>
            {/*<MessagesList/> */}
            {/* SREDI MESSAGES KOMPONENTU */}
            {/* Display messages */}
            {messages.map((message) => (
              <div key={message.id}>
                <strong>{message.senderUid}</strong>: {message.content}
              </div>
            ))}

            <form>
                <Input 
                  type='text'
                  placeholder='...'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button onClick={(e) => sendMessage(e, user.uid, pickedUser.uid)}>send</Button>
            </form>
        </div>
    )
}

export default ChatBox