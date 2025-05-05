import { useMemo, useRef, useState, useEffect } from "react"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import { firestore, collection, where } from "../../api/firebase"
import Post from "../post/Post"
import PostSkeleton from "../skeletons/PostSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"


const UserPosts = ({profileUid}) => {
    const roomTags = ['main', 'watching', 'reading', 'listening']
    const [room, setRoom] = useState('main')

    console.log("uid", profileUid)
    const userPostsRef = useMemo(() => {
      return collection(firestore, room)
    }, [room])

    const postsContainerRef = useRef(null)
  
    // Custom hooks
    const { 
      data: posts, 
      loading, 
      fetchMore, 
      hasMore 
    } = useFirestoreBatch(userPostsRef, 2, [where("creatorUid", "==", profileUid)], profileUid)


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
              next={fetchMore}
              hasMore={hasMore}
              loader={<ClipLoader color="salmon" />}
              scrollThreshold={0.9}
              /*endMessage={
               <p style={{ textAlign: 'center' }}>
                Yay! You have seen it all
               </p>
              }*/
              scrollableTarget="scrollableUserPostsDiv"
            >
              <div>
              {
                loading ? <PostSkeleton /> : (
                  posts.length > 0 ? (
                    posts.map((post, index) => (
                      <Post
                        key={index}
                        post={post}
                        roomId={post.room}
                        style={{width: '70%'}}
                      />
                    ))
                  ) : (
                    <p>No posts yet</p>
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

