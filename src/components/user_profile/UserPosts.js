import { useMemo, useRef, useLayoutEffect } from "react"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import { firestore, collection } from "../../api/firebase"
import Post from "../post/Post"
import PostSkeleton from "../skeletons/PostSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"


const UserPosts = ({room, setRoom, profileUid}) => {
    const roomTags = ['main', 'movies', 'books', 'music']

    const postsRef = useMemo(() => {
      return collection(firestore, room)
    }, [room])

    const postsContainerRef = useRef(null)
    const scrollPositionRef = useRef(0)

    // Custom hooks
    const { data: posts, loading, fetchMore, hasMore } = useFirestoreBatch(postsRef, 2)
    const userPosts = posts?.filter(post => post.creatorUid === profileUid)

    // Effects
     /* useLayoutEffect(() => {
        if (postsContainerRef.current) {
          postsContainerRef.current.scrollTop = scrollPositionRef.current // Restore scroll
        }
      }, [userPosts?.length]) // Runs after posts update*/

      const loadMorePosts = async () => {
        const scrollableDiv = postsContainerRef.current
    
        if (scrollableDiv) {
          scrollPositionRef.current = scrollableDiv.scrollTop // Save scroll position
        }
    
        await fetchMore() // Fetch new posts
      }  

    return (
        <div>
          <div>
            {
              roomTags.map(tag => (
                <button key={tag} onClick={() => setRoom(tag)} style={{color: room === tag ? "white" : ""}}>{tag}</button>
              ))
            }
          </div>
          <div 
            style={{padding: '.5em', height: '400px', overflowY: 'auto'}} 
            id="scrollableDiv"
            ref={postsContainerRef}
          >
            <InfiniteScroll
              dataLength={userPosts.length}
              next={loadMorePosts}
              hasMore={hasMore}
              loader={<ClipLoader color="salmon" />}
              scrollThreshold={0.9}
              endMessage={
               <p style={{ textAlign: 'center' }}>
                Yay! You have seen it all
               </p>
              }
              scrollableTarget="scrollableDiv"
            >
              <div>
              {
                loading ? <PostSkeleton /> : (
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
                        style={{ width: '400px', minHeight: '200px'}}
                      />
                    ))
                  ) : (
                    <p>There's no post yet</p>
                  )
                )
              } 
              </div>  
            </InfiniteScroll>  
          </div>
        </div>
    )
}

export default UserPosts

/*
<div style={{padding: '1em'}}>
              {
                loading ? (
                  <ClipLoader color="white" />
                ) : (
                  hasMore && <button onClick={fetchMore} disabled={loading}>load more</button>
                )
              }
            </div>
*/