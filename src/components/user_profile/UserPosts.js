import { useMemo, useRef, useState, useEffect } from "react"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import { firestore, collection, where } from "../../api/firebase"
import Post from "../post/Post"
import PostSkeleton from "../skeletons/PostSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import ErrorMessage from "../errors/ErrorMessage"
import { useMediaQuery } from "react-responsive"

const UserPosts = ({profileUid}) => {
    const roomTags = ['main', 'watching', 'reading', 'listening']
    const [room, setRoom] = useState('main')

    const userPostsRef = useMemo(() => {
      return collection(firestore, room)
    }, [room])

    const postsContainerRef = useRef(null)
  
    // Custom hooks
    const { data: posts, loading, error, fetchMore, hasMore, refetch } = useFirestoreBatch(userPostsRef, 2, [where("creatorUid", "==", profileUid)], profileUid)

    const isMobile = useMediaQuery({ maxWidth: 767 })

    return (
        <div style={{paddingLeft: '1.5em'}}>
          <div style={{marginBottom: '1em'}}>
            {
              roomTags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setRoom(tag)} 
                  style={{
                    border: room === tag ? ".2px solid #f05593" : "none", 
                    borderRadius: '30px', 
                    padding: '.5em .8em',
                    marginRight: '1em',
                    fontSize: '.75rem'
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
                  loader={<ClipLoader color="#4f3524" />}
                  scrollThreshold={0.9}
                  scrollableTarget="scrollableUserPostsDiv"
                >
                  <div style={{width: isMobile ? '100%' : '70%'}}>
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
                  </div>  
                </InfiniteScroll>  
              )
            }
          </div>
        </div>
    )
}

export default UserPosts

