import { useRef } from "react"
import Comment from "./Comment"
import PostForm from "../PostForm"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import PostSkeleton from "../skeletons/PostSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import ErrorMessage from "../errors/ErrorMessage"

const Comments = ({room, postId, firestoreRef}) => {

  // Hooks that don't trigger re-renders 
  const commentsContainerRef = useRef(null)

  // Custom hooks
  const {data: comments, loading, error, fetchMore, hasMore, refetch } = useFirestoreBatch(firestoreRef, 6)

  return (
    <div className="comments-container">
      <div 
        className="comments-box"
        id="scrollableCommentsDiv"
        ref={commentsContainerRef}
      >
        {error && (
          <ErrorMessage message="Failed to load comments." onRetry={refetch} />
        )}
        {
          loading && comments.length === 0 ? (
            <PostSkeleton />
          ) : (
            <InfiniteScroll
              dataLength={comments.length}
              next={fetchMore}
              hasMore={hasMore}
              loader={<ClipLoader color="#f29bbe" />}
              scrollThreshold={0.9}
              scrollableTarget="scrollableCommentsDiv"
            >
              <div>
                {
                  comments.length > 0 ? (
                    comments.map((comment, index) => <Comment key={index} {...{comment, room, postId}} />)
                  ) : <p>No comments yet.</p>
                }
              </div>
            </InfiniteScroll>
          )
        }
      </div>
      <PostForm {...{firestoreRef}} placeholder="Add comment..." type="comments" style={{background: '#402b1d'}} />
    </div>
  )
}

export default Comments