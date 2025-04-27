import { useRef, useEffect } from "react"
import { format } from "date-fns"
import Message from "./Message"

const Messages = ({messages}) => {
  const messageRefs = useRef([])

  let lastDate = null

  return (
    <div>
      {
        messages.map((message, index) => {
          const messageDate = message.timestamp ? format(message.timestamp.toDate(), "dd/MM/yyyy") : ''
        
          const showDateDivider = lastDate !== messageDate
          lastDate = messageDate
      
          const isLastIndex = index === messages.length - 1
          return (
            <Message 
              key={index}
              index={index}
              message={message} 
              showDateDivider={showDateDivider}
              messageRefs={messageRefs}
              messageDate={messageDate}
              isLastIndex={isLastIndex}
            />
          )
        })
      }
    </div>
  )
}

export default Messages
