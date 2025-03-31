import { useState, useEffect, useCallback } from "react"
import {
    firestore,
    collection,
    query,
    onSnapshot,
    addDoc,
    orderBy,
    updateDoc,
    setDoc,
    getDocs,
    doc,
    where,
    serverTimestamp,
    limit,
    startAfter
} from "../api/firebase"
import { useLoading } from "../contexts/loadingContext"
import uploadToCloudinaryAndGetUrl from "../api/uploadToCloudinaryAndGetUrl"


const useMessages = (chatId) => {
    // State
    const [messages, setMessages] = useState([])
    const [lastVisible, setLastVisible] = useState(null)
    const [hasMore, setHasMore] = useState(null)

    // Context
    const { loadingState, setLoadingState } = useLoading()
    
  // Effects  

  /* real-time listener for fetching messages */
  useEffect(() => {
    if(!chatId) return
    //ovde treba neki loading
    const messagesRef = collection(firestore, "chats", chatId, "messages")
    const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(10))

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      if(!snapshot.empty) {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null //sto??
        }))
        setMessages(newMessages.reverse())
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        setHasMore(snapshot.docs.length === 10)
      } else {
        setHasMore(false)
      }
    })
    //ovde treba neki loading false
    return () => unsubscribe()
  }, [chatId])

  // Functions

  /*
  I put fetchMoreMessages in useCallback to have a stable reference when passing
  fetchMoreMessages to useInfiniteScroll as props
  */
  const fetchMoreMessages = useCallback(async () => {
    if(!hasMore || !lastVisible?.exists) return
    const messagesRef = collection(firestore, "chats", chatId, "messages")
    const messagesQuery = query(
      messagesRef, 
      orderBy("timestamp", "desc"), 
      startAfter(lastVisible), 
      limit(10)
    )
  
    try {
      const snapshot = await getDocs(messagesQuery)
  
      if (!snapshot.empty) {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
        })).reverse()
  
        setMessages(prevMessages => [...newMessages, ...prevMessages])
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        setHasMore(snapshot.docs.length === 10)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error fetching more messages:", error)
    }
  }, [lastVisible, hasMore])

  const sendMessage = async (userA, userBUid, message) => {
    if(!chatId) return
    if(message.text || message.image) {
      let imageUrl = ''
      const chatsRef = collection(firestore, 'chats')
      const chatDoc = doc(chatsRef, chatId)
      const messagesRef = collection(chatDoc, "messages")

      setLoadingState(prev => ({...prev, upload: true}))

      try {
        if(message.image) {
          imageUrl = await uploadToCloudinaryAndGetUrl(message.image)
        }
        const newMessage = {
          ...message,
          image: imageUrl
        }
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
        await addDoc(messagesRef, {
            receiverUid: userBUid,
            senderUid: userA.uid,
            senderName: userA.displayName,
            senderPhoto: userA.photoURL,
            content: newMessage,
            timestamp: serverTimestamp(),
            status: 'sent' 
        })
        //update the lastMessage field in the chat document
        await updateDoc(chatDoc, {
            lastMessage: {  
                senderUid: userA.uid,
                senderName: userA.displayName,
                senderPhoto: userA.photoURL,
                content: message.text || message.image, 
                timestamp: serverTimestamp() },
          })
        console.log("Message sent successfully!")
      } catch(error) {
        console.error("Error sending message:", error)
      } finally {
        setLoadingState(prev => ({...prev, upload: false}))
      }
    }
  }

    return {messages, sendMessage, fetchMoreMessages, hasMore, loadingState}
}

export default useMessages
