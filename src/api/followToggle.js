import { firestore, doc, runTransaction, arrayUnion, arrayRemove } from "./firebase"

const followToggle = async (e, currentUser, targetUser) => {
    e.stopPropagation()
    if(currentUser.uid === targetUser.uid) return

    const currentUserRef = doc(firestore, 'profiles', currentUser.uid)
    const targetUserRef = doc(firestore, 'profiles', targetUser.uid)
    //setLoading(true)  // neki skeleton?

    try {
      await runTransaction(firestore, async (transaction) => {
        const currentUserDoc = await transaction.get(currentUserRef)
        const targetUserDoc = await transaction.get(targetUserRef)
    
        if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
          throw new Error("User not found")
        }
    
        const currentFollowing = currentUserDoc.data().following || []
    
        if (currentFollowing.some(user => user.uid === targetUser.uid)) {
          transaction.update(currentUserRef, {
            following: arrayRemove(targetUser)
          })
          transaction.update(targetUserRef, {
            followers: arrayRemove(currentUser)
          })
        } else {
          transaction.update(currentUserRef, {
            following: arrayUnion(targetUser)
          })
          transaction.update(targetUserRef, {
            followers: arrayUnion(currentUser)
          })
        }
      })
    } catch(error) {
      console.error(error)
      //setError(error)
    } //finally {
      //setLoading(false)
    //}
}

export default followToggle