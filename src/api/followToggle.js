import { firestore, doc, runTransaction, arrayUnion, arrayRemove } from "./firebase"

const followToggle = async (e, currentUserUid, targetUserUid) => {
    e.stopPropagation()
    if(currentUserUid === targetUserUid) return

    const currentUserRef = doc(firestore, 'profiles', currentUserUid)
    const targetUserRef = doc(firestore, 'profiles', targetUserUid)
    //setLoading(true)  // neki skeleton?

    try {
      await runTransaction(firestore, async (transaction) => {
        const currentUserDoc = await transaction.get(currentUserRef)
        const targetUserDoc = await transaction.get(targetUserRef)
    
        if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
          throw new Error("User not found")
        }
    
        const currentFollowing = currentUserDoc.data().following || []
    
        if (currentFollowing.includes(targetUserUid)) {
          transaction.update(currentUserRef, {
            following: arrayRemove(targetUserUid),
          })
          transaction.update(targetUserRef, {
            followers: arrayRemove(currentUserUid),
          })
        } else {
          transaction.update(currentUserRef, {
            following: arrayUnion(targetUserUid),
          })
          transaction.update(targetUserRef, {
            followers: arrayUnion(currentUserUid),
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