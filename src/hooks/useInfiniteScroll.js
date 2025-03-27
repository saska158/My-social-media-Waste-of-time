const useInfiniteScroll = () => {
    //const [lastVisible, setLastVisible] = useState(null)
    //const [initialLoad, setInitialLoad] = useState(true)
    //const [isFetchingOldMessages, setIsFetchingOldMessages] = useState(false)
    // const messageRefs = useRef([])

    /*
    const loadMoreMessages = () => {
    if (loading || !lastVisible) return
    setLoading(true)
    setIsFetchingOldMessages(true) // Prevent auto-scroll

    const chatBox = chatRef.current
    const scrollPosition = chatBox.scrollTop
    const messagesRef = collection(firestore, "chats", chatId, "messages")
    const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), startAfter(lastVisible || 0), limit(10))

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      if (!snapshot.empty) {
        const newMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null //sto??
        })).reverse()
        setMessages(prevMessages => [ ...newMessages, ...prevMessages]) // Append older messages
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
      } 

      setTimeout(() => {
        // Maintain scroll position
        chatBox.scrollTop = scrollPosition + 10
      }, 0)

      setIsFetchingOldMessages(false)
      setLoading(false)

    })
  
    return () => unsubscribe()
  }

  const handleScroll = () => {
    if(chatRef.current) {
        const chatBox = chatRef.current
 
        // Check if user scrolled to the top
        if(chatBox.scrollTop === 0) {
            loadMoreMessages()
        }
    }
  }
    */
  /*useEffect(() => {
    const chatBox = chatRef.current
    if(chatBox) {
        chatBox.addEventListener("scroll", handleScroll)
        return () => chatBox.removeEventListener("scroll", handleScroll)
    }
  }, [messages])*/

  /* useEffect(() => {
    if(messages.length < 11) {
        const chatBox = chatRef.current
    
        if (messages.length > 0) {
            if (initialLoad) {
                // First load -> scroll to bottom
                setTimeout(() => {
                    chatBox.scrollTop = chatBox.scrollHeight
                }, 0)
                setInitialLoad(false)
            } else if (!isFetchingOldMessages) {
                // New message sent -> scroll to bottom
                setTimeout(() => {
                    chatBox.scrollTop = chatBox.scrollHeight
                }, 0)
            }
        }
    }
  }, [messages])*/

  /* handling date based on scrolling */
  /*useEffect(() => {
    let timestamp = messages[0]?.timestamp
    if(timestamp) {
      console.log('poruke', format(timestamp, "dd/MM/yyyy"))
      setVisibleDate(format(timestamp, "dd/MM/yyyy"))
    }

    const chatBox = chatRef.current
    if(!chatBox) return
    // create an Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      for(const entry of entries) {
        if(entry.isIntersecting) {
          timestamp = entry.target.getAttribute("data-timestamp")
          //if(timestamp) {
            //setVisibleDate(format(timestamp, "dd/MM/yyyy"))
          //}
          break  // Stop checking after first visible message
        }
      }
    },
    { root: chatBox, threshold: 0 }) // Adjust threshold as needed
    // observe each message
    messageRefs.current.forEach((message) => {
      if(message instanceof Element) {
        observer.observe(message)
      }
    })
    if(timestamp) {
      setVisibleDate(format(timestamp, "dd/MM/yyyy"))
    }

    return () => {
      if (!chatBox) return // Ensure the chat box still exists
      messageRefs.current.forEach((message) => {
        if(message instanceof Element) {
          observer.unobserve(message)
        }
      })
    }
  }, [messages])  */
}

export default useInfiniteScroll