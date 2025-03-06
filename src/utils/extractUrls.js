const extractUrls = (text) => {
  const regex = /(https?:\/\/[^\s]+)/g
  return text.match(regex)
}

export default extractUrls