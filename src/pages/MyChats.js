import { useState, useEffect, useRef, useMemo } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { firestore, collection, where, doc, getDoc } from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import ChatBox from "../components/one_on_one_chat/ChatBox"
import ChatPreview from "../components/ChatPreview"
import ChatItemSkeleton from "../components/skeletons/ChatItemSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import useFirestoreBatch from "../hooks/useFirestoreBatch"
import ErrorMessage from "../components/errors/ErrorMessage"
import { useMediaQuery } from "react-responsive"

const MyChats = () => {
  // Context
  const { user } = useAuth()
    
  // State
  const [chatPartnerProfile, setChatPartnerProfile] = useState(null)
  const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)
  const [chatPartnerUid, setChatPartnerUid] = useState(null)
  const [retryFlag, setRetryFlag] = useState(0)
  const [fetchProfileError, setFetchProfileError] = useState(null)
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset)
  const [isVisible, setIsVisible] = useState(true)

  const { toggleNav } = useOutletContext()

  const isMobile = useMediaQuery({ maxWidth: 767 })

  const chatsContainerRef = useRef(null)

  const chatsRef = useMemo(() => {
    return collection(firestore, 'chats')
  }, [])

  // Custom hooks
  const { 
    data: chats, 
    loading, 
    error,
    fetchMore, 
    hasMore,
    refetch 
  } = useFirestoreBatch(chatsRef, 10, [where("participants", "array-contains", user.uid)])


  // Effects
  useEffect(() => {
    if(chatPartnerUid) {
      const fetchProfile = async () => {
        const profileRef = doc(firestore, "profiles", chatPartnerUid)
        try {
          const snapshot = await getDoc(profileRef)
          if(snapshot.exists()) {
            setChatPartnerProfile(snapshot.data())
          }
        } catch(error) {
          console.error(error) 

          let errorMessage

          if (error.code === "permission-denied") {
            errorMessage = "You don't have permission to access this document."
          } else if (error.code === "unavailable" || error.code === "network-request-failed") {
            errorMessage = "Network error. Please check your connection."
          } else {
            errorMessage = "Failed to fetch document. Please try again later."
          }

          setFetchProfileError(errorMessage)  
        } 
      }
        
      fetchProfile()
    }
  }, [chatPartnerUid, retryFlag])

  //handling header visibility based on scrolling:

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset
      setIsVisible(prevScrollPos > currentScrollPos)
      setPrevScrollPos(currentScrollPos)
    }
  
    window.addEventListener('scroll', handleScroll)
  
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [prevScrollPos])

  // Functions
  const pickChat = (chatPartnerUid, setIsChatBoxVisible) => {
    setIsChatBoxVisible(true)
    setChatPartnerUid(chatPartnerUid)
  }

  if(error) {
    return (
      <ErrorMessage 
        message={error} 
        isFatal={true} 
        onRetry={refetch} 
      />
    )
  }

  if(fetchProfileError) {
    return (
      <ErrorMessage 
        message={fetchProfileError} 
        isFatal={true} 
        onRetry={() => setRetryFlag(prev => prev + 1)} 
      />
    )
  }

  return (
    <div className="my-chats-container">
      {
        isMobile && (
          <div 
            style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '.5em',
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              transition: 'transform 500ms'
            }}
            className={isVisible ? '' : 'disappear'}
          >
            <Link to="/">
              <img
                src={`${process.env.PUBLIC_URL}/images/icon-green.png`}
                className="user-img user-img-medium"
                alt="logo"
              />
            </Link>

            <button onClick={toggleNav} className="no-padding-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '25px', color: '#4b896f'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
          </div>
        )
      }
      {
        !isChatBoxVisible ? (
          <div 
            id="scrollableChatsDiv"
            ref={chatsContainerRef}
            className="my-chats-content"
          >
            <InfiniteScroll
              dataLength={chats.length}
              next={fetchMore}
              hasMore={hasMore}
              loader={<ChatItemSkeleton />}
              scrollThreshold={0.9}
            >
              <div>
                {
                  loading ? <ChatItemSkeleton /> : (
                    chats.length > 0 ? (
                      chats.map((chat, index) => {
                        const { 
                          receiverUid, 
                          receiverPhoto, 
                          receiverName, 
                          senderPhoto, 
                          senderName, 
                          contentText, 
                          contentImage, 
                          timestamp } = chat.lastMessage
                        const chatPartnerUid = chat.participants.filter(participant => participant !== user.uid)[0]
                        return (
                          <ChatPreview {...{
                            chatPartnerUid, 
                            setIsChatBoxVisible, 
                            receiverUid, 
                            receiverPhoto, 
                            receiverName, senderPhoto, 
                            senderName, 
                            contentText, 
                            contentImage,
                            pickChat,
                            timestamp
                          }}
                          key={index}
                          />
                        )
                      })
                    ) : (
                      <p style={{margin: '1em'}}>Start a conversation to see your chats here.</p>
                    )
                  )
                }
              </div>
            </InfiniteScroll>
          </div>
        ) : <ChatBox {...{chatPartnerProfile, setIsChatBoxVisible}}/>
      }  
    </div>
  )
}

export default MyChats
