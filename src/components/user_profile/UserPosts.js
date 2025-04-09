import { useMemo } from "react"
import Post from "../post/Post"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import { firestore, collection } from "../../api/firebase"


const UserPosts = ({room, setRoom, profileUid}) => {
    const roomTags = ['main', 'movies', 'books', 'music']

    const postsRef = useMemo(() => {
      return collection(firestore, room)
    }, [room])

    // Custom hooks
    const { data: posts, loading, fetchMore, hasMore } = useFirestoreBatch(postsRef, 2)

    const userPosts = posts?.filter(post => post.creatorUid === profileUid).reverse()

    return (
        <div>
          <div>
            {
              roomTags.map(tag => (
                <button key={tag} onClick={() => setRoom(tag)} style={{color: room === tag ? "white" : ""}}>{tag}</button>
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
          <div style={{position: 'absolute', bottom: '0', padding: '1em'}}>
            {
              loading ? (
                <ClipLoader color="white" />
              ) : (
                hasMore && <button onClick={fetchMore} disabled={loading}>load more</button>
              )
            }
          </div>
        </div>
    )
}

export default UserPosts