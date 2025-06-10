import { useEffect, useRef } from "react"
import gsap from "gsap"

const PopUp = ({setIsPopUpShown, setShowEmojiPicker = () => {}, children, style}) => {
    const popUpRef = useRef(null)
    const popUpContainerRef = useRef(null)

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

    useEffect(() => {
      gsap.to(popUpContainerRef.current, {
        duration: .3,
        opacity: 1,
        ease: "power2.out"
      })
    }, [])

    return (
      <div className="pop-up-container" ref={popUpContainerRef}>
        <div className="pop-up-box" style={{...style}} ref={popUpRef}>
          { children }
          <button className="close-pop-up-button" onClick={() => setIsPopUpShown(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}} /*className="size-6"*/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
}

export default PopUp
