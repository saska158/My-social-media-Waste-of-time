import { useRef } from "react"
import PostForm from "../PostForm"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import PostSkeleton from "../skeletons/PostSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import Reply from "./Reply"
import ErrorMessage from "../ErrorMessage"

const Replies = ({firestoreRef, creatorName}) => {

  // Hooks that don't trigger re-renders 
  const repliesContainerRef = useRef(null)

  // Custom hooks
  const {data: replies, loading, error, fetchMore, hasMore, refetch } = useFirestoreBatch(firestoreRef, 6)

  return (
    <div className="comments-container">
      <PostForm {...{firestoreRef}} placeholder={`Reply to ${creatorName}...`} type="comments" style={{background: '#f8a9a2'}}/>
      <div 
        className="comments-box"
        id="scrollableRepliesDiv"
        ref={repliesContainerRef}
        style={{height: '200px'}}
      >
        {error && (
          <ErrorMessage message="Failed to load comments." onRetry={refetch} />
        )}
        {
          loading && replies.length === 0 ? (
            <PostSkeleton />
          ) : (
            <InfiniteScroll
              dataLength={replies.length}
              next={fetchMore}
              hasMore={hasMore}
              loader={<ClipLoader color="salmon" />}
              scrollThreshold={0.9}
              scrollableTarget="scrollableRepliesDiv"
            >
              <div>
                {
                  replies.length > 0 ? (
                    replies.map((reply, index) => <Reply key={index} {...{reply}} />)
                  ) : <p>No comments yet.</p>
                }
              </div>
            </InfiniteScroll>
          )
        }
      </div>
    </div>
  )
}

export default Replies