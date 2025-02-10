//import { useOutletContext, useParams} from "react-router-dom"

const MessagesList = ({ messages, roomId=null }) => {
    //const messages = useOutletContext()
    //const { roomId } = useParams()
    //console.log('messages from outlet:', messages)
    return (
        <div style={{
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
            overflowY: 'auto',
            height: '500px'
        }}>
            { /*
                roomId && <h4>{roomId}</h4>
            */}
            {
                messages && messages.map(message => (
                    <p key={message.id}>
                        {/*{`${message.name}: ${message.text}`}*/}
                        {
                            message.photoUrl ? (<img 
                                                  src={message.photoUrl} 
                                                  alt="profile" 
                                                  style={{
                                                    width: '30px', 
                                                    height: '30px',
                                                    objectFit: 'cover',
                                                    objectPosition: 'top',
                                                    display: 'inline',
                                                    borderRadius: '50%'
                                                }}/>) : null
                        }
                        {`${message.name}: ${message.text}`}
                    </p>
                ))
            }
        </div>
    )
}

export default MessagesList