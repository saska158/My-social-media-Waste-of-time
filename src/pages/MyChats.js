import { useState, useEffect, useRef, useMemo } from "react"
import { firestore, collection, where, doc, getDoc } from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import ChatBox from "../components/one_on_one_chat/ChatBox"
import ChatPreview from "../components/ChatPreview"
import ChatItemSkeleton from "../components/skeletons/ChatItemSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import useFirestoreBatch from "../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"

const MyChats = () => {
    // Context
    const { user } = useAuth()
    
    // State
    const [chatPartnerProfile, setChatPartnerProfile] = useState(null)
    const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)
    const [chatPartnerUid, setChatPartnerUid] = useState(null)
    const [error, setError] = useState(null)

    const chatsContainerRef = useRef(null)

    const chatsRef = useMemo(() => {
      return collection(firestore, 'chats')
    }, [])

    // Custom hooks
    const { 
      data: chats, 
      loading, 
      fetchMore, 
      hasMore 
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
            setError(error)  
          } 
        }
        
        fetchProfile()
      }
    }, [chatPartnerUid])

    // Functions
    const pickChat = (chatPartnerUid, setIsChatBoxVisible) => {
      setIsChatBoxVisible(true)
      setChatPartnerUid(chatPartnerUid)
    }

    return (
      <div style={{width: '30%'}}>
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
                      <p>There's no chats yet.</p>
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
