import { firestore, collection, doc, getDocs, setDoc, addDoc, updateDoc, serverTimestamp, where, query } from "./firebase"
import uploadToCloudinaryAndGetUrl from "./uploadToCloudinaryAndGetUrl"

export const sendMessageToFirestore = async (chatId, userA, userBUid, receiverName, receiverPhoto, message) => {
    if(!chatId || (!message.text && !message.image)) return

    const chatsRef = collection(firestore, 'chats')
    const chatDoc = doc(chatsRef, chatId)
    const messagesRef = collection(chatDoc, "messages")

    let imageUrl = ''
    if(message.image) {
      imageUrl = await uploadToCloudinaryAndGetUrl(message.image)
    }
    const newMessage = {
      ...message,
      image: imageUrl
    }

    const chatSnapshot = await getDocs(query(chatsRef, where("__name__", "==", chatId)))
    if(chatSnapshot.empty) {
      await setDoc(chatDoc, {
        participants: [userA.uid, userBUid],
        timestamp: serverTimestamp(),
        lastMessage: null
      })
    }

    await addDoc(messagesRef, {
      receiverUid: userBUid,
      senderUid: userA.uid,
      senderName: userA.displayName,
      senderPhoto: userA.photoURL,
      content: newMessage,
      timestamp: serverTimestamp(),
      status: 'sent' 
    })

    await updateDoc(chatDoc, {
      lastMessage: {  
        senderUid: userA.uid,
        senderName: userA.displayName,
        senderPhoto: userA.photoURL,
        receiverPhoto,  
        receiverName,
        receiverUid: userBUid, 
        contentText: message.text,
        contentImage: message.image,
        timestamp: serverTimestamp() 
      }
    })
} 