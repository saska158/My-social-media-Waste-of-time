import { useRef } from "react"
import { format } from "date-fns"
import Message from "./Message"

const Messages = ({messages}) => {
    let lastDate = null
    const messageRefs = useRef([])
    console.log("messages", messages)

    return messages.map((message, index) => {
      //const messageDate = message.timestamp ? format(message.timestamp, "dd/MM/yyyy") : ''
      console.log(message.timestamp)
      //const showDateDivider = lastDate !== messageDate
      //lastDate = messageDate

      const isLastIndex = index === messages.length - 1
      return (
        <Message 
          key={index}
          index={index}
          message={message} 
          //showDateDivider={showDateDivider}
          messageRefs={messageRefs}
          //messageDate={messageDate}
          //isLastIndex={isLastIndex}
        />
      )
    })
}

export default Messages