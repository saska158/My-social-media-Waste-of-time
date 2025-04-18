export const readImageAsDataURL = (file, callback, errorCallback) => {
    if(!file) return

    const reader = new FileReader()

    reader.onloadend = () => {
        callback(reader.result)
    }

    reader.onerror = (error) => {
        console.error("File reading error:", error)
        errorCallback(error)
    }

    reader.readAsDataURL(file)
}