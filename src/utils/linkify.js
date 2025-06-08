const linkify = (text) => {
    const urlRegex = /(\bhttps?:\/\/[^\s]+)/g
    return text.split(urlRegex).map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#f05593' }}>
            {part}
          </a>
        )
      }
      return part
    })
}

export default linkify
