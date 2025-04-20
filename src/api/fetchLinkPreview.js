const fetchLinkPreview = async (url) => {
    const apiKey = 'faf544d8f3ee079721267922823df559'  
    const apiUrl = `https://api.linkpreview.net?key=${apiKey}&q=${encodeURIComponent(url)}`

    try {
        const response = await fetch(apiUrl)
        const data = await response.json()

        return {
            title: data.title,
            description: data.description,
            image: data.image,
            url: data.url
        }
    } catch (error) {
        console.error("Error fetching link preview:", error)
        return null
    }
}

export default fetchLinkPreview

// treba li ova func da proizvodi greske?
// nije firebase i ne daje greske ili mozda ovaj servis isto daje?