import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"

export const formatPostTimestamp = (timestamp) => {
    const date = timestamp.toDate()
    const now = new Date()

    const differenceInMs = now - date

    if(differenceInMs < 1000 * 60 * 60 * 24 * 7) {
        return formatDistanceToNow(date, {addSuffix: true})
    } else {
        return format(date, 'MMMM d, yyyy')
    }
}

export const formatMessageTimestamp = (timestamp) => {
    const date = timestamp.toDate()

    if(isToday(date)) {
        return format(date, 'p')
    } else if(isYesterday(date)) {
        return 'Yesterday'
    } else {
        return format(date, 'MMMM d')
    }
}