//import { useOutletContext, useParams} from "react-router-dom"

const MessagesList = ({ messages, roomId=null }) => {
    //const messages = useOutletContext()
    //const { roomId } = useParams()
    //console.log('messages from outlet:', messages)
    return (
        <div style={{backgroundColor: 'white'}}>
            { 
                roomId && <h4>{roomId}</h4>
            }
            {
                messages && messages.map(message => (
                    <p key={message.id}>
                        {`${message.name}: ${message.text}`}
                        {
                            message.photoUrl && <img src={message.photoUrl} alt="profile" style={{width: '20px', display: 'inline'}} />
                        }
                    </p>
                ))
            }
        </div>
    )
}

export default MessagesList