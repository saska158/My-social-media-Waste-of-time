import { useState, useEffect, useMemo } from "react"
import fetchProfile from "../api/fetchProfile"
import ItemHeader from "./ItemHeader"
import ItemContent from "./ItemContent"
import ItemActions from "./ItemActions"
import Comments from "./post/Comments"

const FirestoreItem = ({item, room, type}) => {
    const { id, creatorName, creatorUid, content, timestamp } = item

    // State
    const [profile, setProfile] = useState(null)
    const [showComments, setShowComments] = useState(true)
    const [error, setError] = useState(null)

    /*const commentsRef = useMemo(() => {
      return type === 'posts' ? 
        collection(firestore, room, postId, 'comments') : 
        collection(firestore, room, postId, 'comments', commentId, 'replies')
    }, [room, postId])*/
    
    // Effects
    useEffect(() => {
      const getProfile = async () => {
        try {
          await fetchProfile(creatorUid, setProfile)
        } catch(error) {
          console.error("Error fetching profile:", error)
          setError(error)
        }
      }
    
      getProfile()
    }, [creatorUid])

    return (
      <div className="post-container">
        <ItemHeader {...{creatorUid, timestamp, profile}} />
        <ItemContent {...{content}} />
        {/*<ItemActions {...{room, id, type, showComments, setShowComments}} />*/}
        {
          showComments && <Comments {...{room, id}} />
        }
      </div>
    )
}

export default FirestoreItem