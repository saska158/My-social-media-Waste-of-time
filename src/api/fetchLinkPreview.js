const fetchLinkPreview = async (url) => {
    const apiKey = 'faf544d8f3ee079721267922823df559'  
    const apiUrl = `https://api.linkpreview.net?key=${apiKey}&q=${encodeURIComponent(url)}`

    const response = await fetch(apiUrl)

    /*if (!response.ok) {
        throw new Error(`Link preview failed with status ${response.status}`)
    }*/

    const data = await response.json()

    return {
        title: data.title,
        description: data.description,
        image: data.image,
        url: data.url
    }
}

export default fetchLinkPreview

