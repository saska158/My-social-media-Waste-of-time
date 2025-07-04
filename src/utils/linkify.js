const linkify = (text) => {
    const urlRegex = /(\bhttps?:\/\/[^\s]+)/g
    return text.split(urlRegex).map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(42, 19, 255)' }}>
            {part}
          </a>
        )
      }
      return part
    })
}

export default linkify
