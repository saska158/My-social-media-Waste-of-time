import useFirestoreBatch from "../hooks/useFirestoreBatch"
import InfiniteScroll from "react-infinite-scroll-component"
import FirestoreItem from "./FirestoreItem"
import PostSkeleton from "./skeletons/PostSkeleton"
import Post from "./post/Post"

const FirestoreInfiniteList = ({firestoreCollection, room, type, roomId=null}) => {

    // Custom hooks
    const { data, loading, fetchMore, hasMore } = useFirestoreBatch(firestoreCollection)
    console.log("data", data)

    return (
        <div className="posts-container" id="scrollableDiv">
          <InfiniteScroll
            dataLength={data.length}
            next={fetchMore}
            hasMore={hasMore}
            //loader={<ClipLoader color="salmon" />}
            scrollThreshold={0.9}
            scrollableTarget="scrollableDiv"
            style={{width: '500px'}}
          >
            <div className="posts">
              {
                loading ? <PostSkeleton /> : ( // preimenuj u Skeleton
                  data.length > 0 && data.map(item=> (
                    <FirestoreItem
                      key={item.id}
                      item={item}
                      room={room}
                      type={type}
                    />
                  )) 
                )
              }    
            </div> 
          </InfiniteScroll>
        </div>
    )
}

export default FirestoreInfiniteList