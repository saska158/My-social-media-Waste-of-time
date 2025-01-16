import { useOutletContext, useParams} from "react-router-dom"

const ChatRoom = () => {
    const messages = useOutletContext()
    const { roomId } = useParams()
    //console.log('messages from outlet:', messages)
    return (
        <div style={{backgroundColor: 'white'}}>
            <h4>{roomId}</h4>
            {
                messages.map(message => (
                    <p key={message.id}>{`${message.name}: ${message.text}`}</p>
                ))
            }
        </div>
    )
}

export default ChatRoom