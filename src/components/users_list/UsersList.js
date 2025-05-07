import { useState, useMemo, useRef } from "react"
import { firestore, collection } from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import UsersSearch from "./UsersSearch"
import JoinPopUp from "../JoinPopUp"
import UserItem from "./UserItem"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import InfiniteScroll from "react-infinite-scroll-component"
import { ClipLoader } from "react-spinners"
import UserSkeleton from "../skeletons/UserSkeleton"

const UsersList = () => {
  // Context
  const { user } = useAuth()
  
  // State
  const [isUsersQueryShown, setIsUsersQueryShown] = useState(false)
  const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)

  // Memoized values
  const usersRef = useMemo(() => {
    return collection(firestore, 'profiles')
  }, [])

  const usersContainerRef = useRef(null)

  // Custom hooks
  const {data: users, loading, fetchMore, hasMore } = useFirestoreBatch(usersRef, 10)


  // Functions
  const findPeopleToFollow = (e) => {
    e.stopPropagation()
    if(!user) {
      setIsJoinPopupShown(true)
    } else {
      setIsUsersQueryShown(true)
    }
  }

  return (
    <div className="users-list-container">
      <div 
        className="active-users-container"
        id="scrollableActiveUsersDiv"
        ref={usersContainerRef}
      >
        <InfiniteScroll
          dataLength={users.length}
          next={fetchMore}
          hasMore={hasMore}
          //loader={<ClipLoader color="salmon" />}
          scrollThreshold={0.9}
          scrollableTarget="scrollableActiveUsersDiv"
        >
          <div>
            {
              loading ? <UserSkeleton /> : (
                users.length > 0 ? (users.map((usr, index) => (
                  <div key={index} style={{display: 'flex', alignItems: 'center', gap: '.3em'}}>
                    <div className="activity-btn" style={{background: usr.isActive ? 'green' : 'grey'}}></div>
                    <UserItem key={index} user={usr} />
                  </div>
                ))) : <p>No users yet.</p>
              )
            }
          </div>
        </InfiniteScroll>
      </div>
      <button onClick={findPeopleToFollow} className="users-list-follow-button">find people to follow</button>
      { isUsersQueryShown && <UsersSearch {...{ setIsUsersQueryShown }}/>}
      { isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} /> }
    </div>
  )
}

export default UsersList


            


     

