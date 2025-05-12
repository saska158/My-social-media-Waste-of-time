import { useState, useEffect, useRef, useMemo } from "react"
import { firestore, collection, where, doc, getDoc } from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import ChatBox from "../components/one_on_one_chat/ChatBox"
import ChatPreview from "../components/ChatPreview"
import ChatItemSkeleton from "../components/skeletons/ChatItemSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import useFirestoreBatch from "../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import ErrorMessage from "../components/ErrorMessage"

const MyChats = () => {
    // Context
    const { user } = useAuth()
    
    // State
    const [chatPartnerProfile, setChatPartnerProfile] = useState(null)
    const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)
    const [chatPartnerUid, setChatPartnerUid] = useState(null)
    const [retryFlag, setRetryFlag] = useState(0)
    const [fetchProfileError, setFetchProfileError] = useState(null)

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

    // Functions
    const pickChat = (chatPartnerUid, setIsChatBoxVisible) => {
      setIsChatBoxVisible(true)
      setChatPartnerUid(chatPartnerUid)
    }

    if(error) {
      return <ErrorMessage message={error} isFatal={true} onRetry={refetch} />
    }

    if(fetchProfileError) {
      return <ErrorMessage message={fetchProfileError} isFatal={true} onRetry={() => setRetryFlag(prev => prev + 1)} />
    }

    return (
      <div style={{width: '100%', position: 'relative'}}>
        {
          !isChatBoxVisible ? (
            <div 
              className="my-chats-container"
              id="scrollableChatsDiv"
              ref={chatsContainerRef}
            >
              <InfiniteScroll
                dataLength={chats.length}
                next={fetchMore}
                hasMore={hasMore}
                loader={<ClipLoader color="salmon" />}
                scrollThreshold={0.9}
                endMessage={
                 <p style={{ textAlign: 'center' }}></p>
                }
                scrollableTarget="scrollableChatsDiv"
              >
                <div>
                {
                loading ? <ChatItemSkeleton /> : (
                  chats.length > 0 ? (
                    chats.map((chat, index) => {
                      const { receiverUid, receiverPhoto, receiverName, senderPhoto, senderName, contentText, contentImage, timestamp } = chat.lastMessage
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
                      <p>Start a conversation to see your chats here.</p>
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
