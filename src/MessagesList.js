//import { useOutletContext, useParams} from "react-router-dom"
import Post from "./Post"

const MessagesList = ({ posts, roomId=null }) => {
    //const messages = useOutletContext()
    //const { roomId } = useParams()
    //console.log('messages from outlet:', messages)
    return (
        <div style={{
            background: 'rgb(253, 239, 237)',
            display: 'flex',
            flexDirection: "column-reverse",
            flex: '1',
            /*overflowY: 'auto',
            height: '500px'*/
        }}>
            { /*
                roomId && <h4>{roomId}</h4>
            */}
            {
                posts && posts.map(postItem => <Post
                                                      id={postItem.id}
                                                      userUid={postItem.userUid}
                                                      photoUrl={postItem.photoUrl}
                                                      username={postItem.name}
                                                      post={postItem.post}
                                                    />)
            }
        </div>
    )
}

export default MessagesList