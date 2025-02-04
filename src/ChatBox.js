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
    updateDoc,
    serverTimestamp,
    orderBy, 
    onSnapshot,
} from "./firebase"
//import MessagesList from './MessagesList'
//import Messages from "./Messages"
import { format } from "date-fns"
import Input from './Input'
import Button from './Button'
import { useAuth } from "./authContext"

const ChatBox = ({profileUid, profile, setIsChatBoxVisible}) => {
    //const [isFullScreen, setIsFullScreen] = useState(false)
    const [chatId, setChatId] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const { user } = useAuth()

    console.log("Useeeeer", user)

    //console.log("Picked", pickedUser)

    // Create or get the chatId when the component mounts or user UIDs change
    useEffect(() => {
        const generatedChatId = [user?.uid, profileUid].sort().join("_")
        setChatId(generatedChatId)
    }, [user?.uid, profileUid])

    // Real-time listener for fetching messages
    useEffect(() => {
        if(!chatId) return

        const messagesRef = collection(firestore, "chats", chatId, "messages")
        const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"))

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null //sto??
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

    const sendMessage = async (e, userA, userBUid) => {
        e.preventDefault()
        console.log("userA", userA)

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
                    participants: [userA.uid, userBUid],
                    createdAt: serverTimestamp(),
                    lastMessage: null
                })
            }

            // Add the message to the messages subcollection of the chat
            const messagesRef = collection(chatDoc, "messages")
            await addDoc(messagesRef, {
                senderUid: userA.uid,
                senderName: userA.displayName,
                senderPhoto: userA.photoURL,
                content: message,
                timestamp: serverTimestamp() 
            })

            //update the lastMessage field in the chat document
            await updateDoc(chatDoc, {
                lastMessage: {  
                    senderUid: userA.uid,
                    senderName: userA.displayName,
                    senderPhoto: userA.photoURL,
                    content: message, 
                    timestamp: serverTimestamp() },
              })

            setMessage('')
            console.log("Message sent successfully!")
        } catch(error) {
            console.error("Error sending message:", error)
        }
    }

    console.log("mess", messages)

    return (
        <div className="chat-box" style={{width: '300px', height: '500px', position: 'relative'}}>
            <button onClick={() => setIsChatBoxVisible(false)}>x</button>
            <p style={{backgroundColor: 'salmon'}}>
                { profile.displayName }
                {/*<span onClick={() => setIsFullScreen(!isFullScreen)}>o</span>*/}
            </p>
            {/*<MessagesList/> */}
            {/* SREDI MESSAGES KOMPONENTU */}
            {/* Display messages */}
            {messages.map((message) => (
              <div key={message.id} style={{
                backgroundColor: message.senderName === user?.displayName ? 'salmon' : 'grey',
                width: 'fit-content',
                marginLeft: message.senderName === user?.displayName ? 'auto' : '0'
                }}>
                <img src={message.senderPhoto} alt="profile photo" style={{width: '20px', display: 'inline'}}/>:
                <span>{message.content}</span>
                <p>{format(message.timestamp, "HH:mm dd/MM/yyyy")}</p>
              </div>
            ))}

            <form>
                <Input 
                  type='text'
                  placeholder='...'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button onClick={(e) => sendMessage(e, user, profileUid)}>send</Button>
            </form>
        </div>
    )
}

export default ChatBox