import { useState, useEffect, memo } from "react"
import { firestore, collection, query, where, getDocs } from "../../api/firebase"
import PostHeader from "./PostHeader"
import PostContent from "./PostContent"
import PostActions from "./PostActions"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const Post = ({id, creatorUid, post, roomId, style}) => {
  // State
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)

  // Effects
  useEffect(() => {
    const fetchProfile = async () => {
      const profilesRef = collection(firestore, "profiles")
      const q = query(profilesRef, where("uid", "==", creatorUid))
      try {
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          setProfile(querySnapshot.docs[0].data()) // Store first matching profile
        } else {
            console.log("Profile not found")
        }
      } catch (error) {
          console.error("Error fetching profile:", error)
          setError(error)
      }
    }
    fetchProfile()
  }, [creatorUid])

  return (
    <div key={id} className="post-container" style={style}>
      <PostHeader {...{creatorUid, profile}} />
      <PostContent {...{post}} />
      <PostActions {...{roomId, id}} />
    </div>
  )
}

export default memo(Post)