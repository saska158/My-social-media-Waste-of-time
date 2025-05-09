import { useState, useEffect } from "react"
import { format, formatDistanceToNow } from "date-fns"

const useFormattedTime = (timestamp) => {
    const [formattedTime, setFormattedTime] = useState('')
    
    useEffect(() => {
        if(!timestamp) return

        const date = timestamp.toDate()

        const updatedFormattedtTime = () => {
          const now = new Date()
          const differenceInMs = now - date

          if(differenceInMs < 1000 * 60 * 60 * 24 * 7) {
            setFormattedTime(formatDistanceToNow(date, {addSuffix: true}))
          } else {
            setFormattedTime(format(date, 'MMMM d, yyyy'))
          }
        }

        updatedFormattedtTime()

        const intervalId = setInterval(updatedFormattedtTime, 60000)

        return () => clearInterval(intervalId)

    }, [timestamp])

    return formattedTime
}

export default useFormattedTime