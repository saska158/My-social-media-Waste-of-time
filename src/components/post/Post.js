import { useState, useEffect } from "react"
import { 
  firestore,
  collection, 
  query, 
  where, 
  getDocs 
} from "../../api/firebase"
import PostHeader from "./PostHeader"
import PostContent from "./PostContent"
import PostActions from "./PostActions"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

//const PostSkeleton = () => <Skeleton height={20} width={200} borderRadius={8} />

const Post = ({id, creatorUid, post, roomId}) => {
  
  // State
  const [profile, setProfile] = useState(null)

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
      }
    }
  
    fetchProfile()
  }, [creatorUid])

  return (
    <div 
      key={id}
      style={{
        background: 'white',
        border: '.5px solid rgb(247, 198, 193)',
        borderRadius: '10px',
        width: '70%',
        margin: '1em',
        padding: '1em'
      }}
    >
      <PostHeader
        creatorUid={creatorUid}
        profile={profile}
      />
      <PostContent
        post={post}
      />
      <PostActions
        roomId={roomId}
        id={id}
      />
    </div>
  )
}

export default Post