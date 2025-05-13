const uploadToCloudinaryAndGetUrl = async (imageFile) => {
    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dsjpoak0f/upload"  
    const UPLOAD_PRESET = "profile_pictures"

    const formData = new FormData()
    formData.append("file", imageFile)
    formData.append("upload_preset", UPLOAD_PRESET)

    const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
    })
    const data = await response.json()

    if (!response.ok) {
        const errorMessage = data.error?.message || "Image upload failed."
        throw new Error(errorMessage)
    }
        
    return data.secure_url
}

export default uploadToCloudinaryAndGetUrl