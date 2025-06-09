import { useEffect } from "react"

const Textarea = ({value, onChange, onKeyDown, placeholder, textareaRef, style = {}}) => {

    const defaultStyle = {
      width: '100%',
      resize: 'none',
      overflow: 'hidden',
      padding: '1em',
      fontFamily: 'inherit'
    }

    const combinedStyle = {...defaultStyle, ...style}

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
          textarea.style.height = 'auto' // Reset height
          textarea.style.height = `${textarea.scrollHeight}px` // Set height based on content
        }
    }, [value])

    useEffect(() => {
      if(textareaRef.current) {
        textareaRef.current.focus()
      }
    }, [])

    return (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          style={combinedStyle}
        />
    )
}

export default Textarea