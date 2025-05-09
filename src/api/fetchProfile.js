import {  firestore, collection, query, where, getDocs} from "./firebase"

const fetchProfile = async (userUid, setProfile) => {
    const profilesRef = collection(firestore, "profiles")
    const q = query(profilesRef, where("uid", "==", userUid))

    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      setProfile(querySnapshot.docs[0].data()) 
    } else {
      throw new Error("Profile not found")
    }
}

export default fetchProfile