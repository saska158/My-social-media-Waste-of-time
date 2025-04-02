import { useState, useEffect } from "react"
import { firestore, collection, onSnapshot } from "../../api/firebase"
import Post from "../post/Post"

const UserPosts = ({room, setRoom, profileUid}) => {
    const [userPosts, setUserPosts] = useState([])
    const roomTags = ['main', 'movies', 'books', 'music']

    useEffect(() => {
      const roomRef = collection(firestore, room)
      const unsubscribe = onSnapshot(roomRef, (snapshot) => { //ovde neki loading state i skeleton
        if(!snapshot.empty) {
          const postsArray = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
          }))
          const userPostsArray = postsArray.filter(post => post.creatorUid === profileUid)
          setUserPosts(userPostsArray)
        }
      })
      return () => unsubscribe()
    }, [profileUid, room])

    return (
        <div>
          <div>
            {
              roomTags.map(tag => (
                <button onClick={() => setRoom(tag)} style={{color: room === tag ? "white" : ""}}>{tag}</button>
              ))
            }
          </div>
          {
            userPosts.length > 0 ? (
              userPosts.map((post, index) => (
                <Post
                  key={index}
                  id={post.id}
                  creatorUid={post.creatorUid}
                  photoUrl={post.photoUrl}
                  creatorName={post.creatorName}
                  post={post.post}
                  roomId={post.room}
                />
              ))
            ) : (
              <p>There's no post yet</p>
            )
          } 
        </div>
    )
}

export default UserPosts