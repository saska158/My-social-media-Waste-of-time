import {  firestore, collection, query, where, getDocs} from "./firebase"

const fetchProfile = async (creatorUid, setProfile) => {
    const profilesRef = collection(firestore, "profiles")
    const q = query(profilesRef, where("uid", "==", creatorUid))

    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      setProfile(querySnapshot.docs[0].data()) 
    } else {
      console.log("Profile not found")
    }
}

export default fetchProfile