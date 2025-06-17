import { useMemo, useRef, useState } from "react"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import { firestore, collection, where } from "../../api/firebase"
import Post from "../post/Post"
import PostSkeleton from "../skeletons/PostSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import ErrorMessage from "../errors/ErrorMessage"
import { useMediaQuery } from "react-responsive"

const UserPosts = ({profileUid}) => {
    const roomTags = ['watching', 'reading', 'listening']
    const [room, setRoom] = useState('watching')

    const userPostsRef = useMemo(() => {
      return collection(firestore, room)
    }, [room])

    const postsContainerRef = useRef(null)
  
    // Custom hooks
    const { data: posts, loading, error, fetchMore, hasMore, refetch } = useFirestoreBatch(userPostsRef, 2, [where("creatorUid", "==", profileUid)], profileUid)



    return (
      <div>
        <div style={{marginBottom: '1em'}}>
          {
            roomTags.map(tag => (
              <button 
                key={tag} 
                onClick={() => setRoom(tag)} 
                style={{
                  background: room === tag ? "#eaf4f0" : "none", 
                  border: room === tag ? "none" : ".2px solid #eaf4f0", 
                  color: '#4b896f',
                  borderRadius: '30px', 
                  padding: '.5em .8em',
                  marginRight: '1em',
                  fontFamily: '"Manrope", sans-serif'
                }}
              >
                {tag}
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
                {/*<div style={{width: '100%'}}>*/}
                  {
                    posts.length > 0 ? (
                      posts.map((post, index) => (
                        <Post
                          key={index}
                          post={post}
                          room={room}
                          style={{width: '90%', padding: '1em 0'}}
                        />
                      ))
                    ) : <p>No posts yet.</p>
                  } 
                {/*</div>*/}  
              </InfiniteScroll>  
            )
          }
        </div>
      </div>
    )
}

export default UserPosts

