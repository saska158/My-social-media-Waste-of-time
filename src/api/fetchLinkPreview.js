const fetchLinkPreview = async (url) => {
    const apiKey = process.env.REACT_APP_LINK_PREVIEW_KEY
    const apiUrl = `https://api.linkpreview.net?key=${apiKey}&q=${encodeURIComponent(url)}`

    const response = await fetch(apiUrl)

    const data = await response.json()

    return {
        title: data.title,
        description: data.description,
        image: data.image,
        url: data.url
    }
}

export default fetchLinkPreview

