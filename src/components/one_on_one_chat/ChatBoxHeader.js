import UserItem from "../users_list/UserItem"

const ChatBoxHeader = ({chatPartnerProfile, setIsChatBoxVisible}) => {
    return (
        <div className="chat-box-header-container">
          <UserItem user={chatPartnerProfile} />
          <button onClick={() => setIsChatBoxVisible(false)} style={{marginLeft: 'auto', color: "#4b896f"}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
    )
}

export default ChatBoxHeader