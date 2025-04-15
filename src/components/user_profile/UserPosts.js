import { useMemo, useRef } from "react"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import { firestore, collection } from "../../api/firebase"
import Post from "../post/Post"
import PostSkeleton from "../skeletons/PostSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import { where } from "../../api/firebase"
import loadMoreItems from "../../utils/loadMoreItems"


const UserPosts = ({room, setRoom, profileUid}) => {
    const roomTags = ['main', 'movies', 'books', 'music']

    const postsRef = useMemo(() => {
      return collection(firestore, room)
    }, [room])

    const postsContainerRef = useRef(null)
    const scrollPositionRef = useRef(0)

    // Custom hooks
    const { 
      data: posts, 
      loading, 
      fetchMore, 
      hasMore 
    } = useFirestoreBatch(postsRef, 2, [where("creatorUid", "==", profileUid)], profileUid)

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
            id="scrollableUserPostsDiv"
            ref={postsContainerRef}
          >
            <InfiniteScroll
              dataLength={posts.length}
              next={() => loadMoreItems(postsContainerRef, scrollPositionRef, fetchMore)}
              hasMore={hasMore}
              loader={<ClipLoader color="salmon" />}
              scrollThreshold={0.9}
              endMessage={
               <p style={{ textAlign: 'center' }}>
                Yay! You have seen it all
               </p>
              }
              scrollableTarget="scrollableUserPostsDiv"
            >
              <div>
              {
                loading ? <PostSkeleton /> : (
                  posts.length > 0 ? (
                    posts.map((post, index) => (
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

