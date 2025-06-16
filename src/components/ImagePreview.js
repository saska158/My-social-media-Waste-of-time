const ImagePreview = ({imagePreview, setImagePreview, fileInputRef, setState}) => {
    const cancelImage = (e) => {
        e.stopPropagation()
        setState(prev => ({...prev, image: ''}))
        setImagePreview(null)
        fileInputRef.current.value = null
        console.log("image cancelled")
    }
    return (
        <div className="image-preview">
            <img src={imagePreview} alt="image-post" className="image-preview-img" />
            <button onClick={cancelImage} className="image-preview-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '15px', color: '#fff'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
        </div>
    )
}

export default ImagePreview