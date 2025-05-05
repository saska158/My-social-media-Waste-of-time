import { useMemo, useRef } from "react"
import { firestore, collection } from "../../api/firebase"
import Comment from "./Comment"
import PostForm from "../PostForm"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import PostSkeleton from "../skeletons/PostSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"

const Comments = ({room, postId, firestoreRef, type}) => {

  // Hooks that don't trigger re-renders 
  const commentsContainerRef = useRef(null)
  
  // Memoized values

  // Custom hooks
  const {data: comments, loading, fetchMore, hasMore } = useFirestoreBatch(firestoreRef, 6)

  console.log("comments", comments)

  return (
    <div className="comments-container">
      <div 
        className="comments-box"
        id="scrollableCommentsDiv"
        ref={commentsContainerRef}
      >
        <InfiniteScroll
          dataLength={comments.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<ClipLoader color="salmon" />}
          scrollThreshold={0.9}
          scrollableTarget="scrollableCommentsDiv"
        >
          <div>
            {
              loading ? <PostSkeleton /> : (
                comments.length > 0 ? (
                  comments.map((comment, index) => <Comment key={index} {...{comment, room, postId, type}} />)
                ) : <p>No comments yet</p>
              )
            }
          </div>
        </InfiniteScroll>
      </div>
      <PostForm {...{firestoreRef}} placeholder="Add comment..." type="comments" />
    </div>
  )
}

export default Comments