import { useState, useEffect } from "react"
import { 
    firestore,
    collection,
    doc,
    getDoc,
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

        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
            const chatData = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const chat = docSnap.data()

                    // Find the other participant
                    const otherUserUid = chat.participants.find(uid => uid !== userUid)

                    // Fetch the other user's profile
                    const otherUserRef = doc(firestore, 'profiles', otherUserUid)
                    const otherUserSnap = await getDoc(otherUserRef)
                    const otherUserData = otherUserSnap.exists() ? otherUserSnap.data() : null

                    return {
                        id: docSnap.id,
                        lastMessage: chat.lastMessage || null,
                        otherUser: otherUserData,
                        timestamp: docSnap.data().createdAt ? docSnap.data().createdAt.toDate() : null
                    }
                })
            )

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
                    <div key={chat.id} style={{borderBottom: '1px solid black', background: 'white'}}>
                      <img src={chat.otherUser.photoURL} alt="sender" style={{width: '20px', display: 'inline'}} />
                      <span>{chat.otherUser.displayName}</span>
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