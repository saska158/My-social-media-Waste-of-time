import { addDoc, serverTimestamp } from "../api/firebase"
import uploadToCloudinaryAndGetUrl from "./uploadToCloudinaryAndGetUrl"

const sendPostToFirestore =  async (user, data, firestoreRef) => {
    let imageUrl = ''
   
    if(data.image) {
      imageUrl = await uploadToCloudinaryAndGetUrl(data.image)
    }
   
    const newData = {
      ...data, 
      image: imageUrl
    }
  
    await addDoc(firestoreRef, {
      creatorUid: user.uid,  
      creatorName: user.displayName, 
      creatorPhoto: user.photoURL || '',
      content: newData,
      timestamp: serverTimestamp(),
      //room: roomId || 'main',
      likes: {},
      comments: []
    })
}

export default sendPostToFirestore  