import { useMemo, useRef, useState } from "react"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import { firestore, collection, where } from "../../api/firebase"
import Post from "../post/Post"
import PostSkeleton from "../skeletons/PostSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import ErrorMessage from "../errors/ErrorMessage"

const UserPosts = ({profileUid}) => {
    const roomTags = ['watching', 'reading', 'listening']
    const icons = {
      watch: '📺',
      read: '📚',
      listen: '🎷'
    }
    const [room, setRoom] = useState('watching')

    const userPostsRef = useMemo(() => {
      return collection(firestore, room)
    }, [room])

    const postsContainerRef = useRef(null)
  
    // Custom hooks
    const { data: posts, loading, error, fetchMore, hasMore, refetch } = useFirestoreBatch(userPostsRef, 2, [where("creatorUid", "==", profileUid)], profileUid)



    return (
      <div style={{padding: '.5em 0'}}> 
        <div style={{marginBottom: '1em', display: 'flex', gap: '1em'}}>
          {
            roomTags.map(tag => (
              <button 
                key={tag} 
                onClick={() => setRoom(tag)} 
                style={{
                  background: room === tag ? "#eaf4f0" : "none",
                  border: room === tag ? 'none' : "2px solid #eaf4f0",
                  fontSize: '.9rem'
                }}
                className="post-category-navlink"
              >
                {icons[tag.slice(0, -3)]} {tag.slice(0, -3).charAt(0).toUpperCase()+tag.slice(0, -3).slice(1)}
              </button>
            ))
          }
        </div>
        <div 
          style={{height: '400px', overflowY: 'auto'}} 
          id="scrollableUserPostsDiv"
          ref={postsContainerRef}
        >
          {error && (
            <ErrorMessage message="Failed to load comments." onRetry={refetch} />
          )}
          {
            loading && posts.length === 0 ? (
              <PostSkeleton />
            ) : (
              <InfiniteScroll
                dataLength={posts.length}
                next={fetchMore}
                hasMore={hasMore}
                loader={<ClipLoader color="#4b896f" />}
                scrollThreshold={0.9}
                scrollableTarget="scrollableUserPostsDiv"
              >
                  {
                    posts.length > 0 ? (
                      posts.map((post, index) => (
                        <Post
                          key={index}
                          post={post}
                          room={room}

                        />
                      ))
                    ) : <p>No posts yet.</p>
                  }   
              </InfiniteScroll>  
            )
          }
        </div>
      </div>
    )
}

export default UserPosts

