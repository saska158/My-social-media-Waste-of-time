const loadMoreItems = async (elementRef, scrollPositionRef, fetchMore) => {
    const scrollableDiv = elementRef.current

    if (scrollableDiv) {
      scrollPositionRef.current = scrollableDiv.scrollTop 
    }

    await fetchMore()
}

export default loadMoreItems