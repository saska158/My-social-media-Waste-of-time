import { useEffect, useRef } from "react"

const PopUp = ({setIsPopUpShown, setShowEmojiPicker = () => {}, children}) => {
    const popUpRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if(popUpRef.current && !popUpRef.current.contains(e.target)) {
                setIsPopUpShown(false)
                setShowEmojiPicker(false)
            }
        }
        document.addEventListener("click", handleClickOutside)

        return () => document.removeEventListener("click", handleClickOutside)
    }, [])

    return (
        <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(238, 171, 163, .8)'
        }}>
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            width: '50%',
            height: '70%',
            overflow: 'auto',
            background: 'white',
            padding: '1em',
            borderRadius: '30px',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1em',
            //alignItems: 'center'
          }}
          ref={popUpRef}
          >
            { children }
            <button
              style={{
                position: 'absolute',
                top: '5%',
                right: '5%'
              }}
              onClick={() => setIsPopUpShown(false)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}} /*className="size-6"*/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        </div>
    )
}

export default PopUp
