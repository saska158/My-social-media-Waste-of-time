import { useState, useEffect } from "react"
import { 
    firestore,
    collection,
    doc,
    getDoc,
    query,
    where,
    onSnapshot
 } from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import ChatBox from "../components/ChatBox"

const MyChats = () => {
    const { user } = useAuth()
    const [chats, setChats] = useState([])
    const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)
    const [otherUser, setOtherUser] = useState({ //katastrofa od imena i konfuzije
        uid: '',
        otherUserProfile: ''
    })

    useEffect(() => {
        if (!user.uid) return

        const chatsRef = collection(firestore, 'chats')
        const chatsQuery = query(chatsRef, where('participants', 'array-contains', user.uid))

        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
            const chatData = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const chat = docSnap.data()

                    // Find the other participant
                    const otherUserUid = chat.participants.find(uid => uid !== user.uid)

                    // Fetch the other user's profile
                    const otherUserRef = doc(firestore, 'profiles', otherUserUid)
                    const otherUserSnap = await getDoc(otherUserRef)
                    const otherUserData = otherUserSnap.exists() ? otherUserSnap.data() : null

                    return {
                        id: docSnap.id,
                        lastMessage: chat.lastMessage || null,
                        otherUserUid,
                        otherUser: otherUserData,
                        timestamp: docSnap.data().createdAt ? docSnap.data().createdAt.toDate() : null
                    }
                })
            )

            setChats(chatData)
        })

        return () => unsubscribe
    }, [user.uid])

    //console.log("otheruser",otherUser)

    const pickChat = (otherUserUid, otherUser, setIsChatBoxVisible) => {
        setIsChatBoxVisible(true)
        setOtherUser({uid: otherUserUid, otherUserProfile: otherUser})
    }


    return (
        <div style={{width: '30%'}}>
            {
                !isChatBoxVisible ? (
                    <div>
                    <h4>My chats</h4>
                    {
                        chats.length > 0 ? (
                            
                                chats.map(chat => (
                                    <div 
                                      key={chat.id} 
                                      style={{borderBottom: '1px solid black', background: 'white', cursor: 'pointer'}}
                                      onClick={() => pickChat(chat.otherUserUid, chat.otherUser, setIsChatBoxVisible)}
                                    >
                                      <img 
                                        src={chat.otherUser.photoURL} 
                                        alt="sender" 
                                        style={{
                                            width: '20px', 
                                            height: '20px', 
                                            display: 'inline',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            objectPosition: 'top'
                                        }}/>
                                      <span>{chat.otherUser.displayName}</span>
                                      <p>{chat.lastMessage.content}</p>
                                    </div>
                                ))
                            
                        ) : (
                            <p>You still don't have any chats.</p>
                        )
                    }
                    </div>
                ) : (
                    <ChatBox profileUid={otherUser.uid} profile={otherUser.otherUserProfile} setIsChatBoxVisible={setIsChatBoxVisible} />
                )
            }
        </div>
    )
}

export default MyChats