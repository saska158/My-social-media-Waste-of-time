import { useState, useMemo, useRef } from "react"
import { firestore, collection, where } from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import UsersSearch from "./UsersSearch"
import JoinPopUp from "../JoinPopUp"
import UserItem from "./UserItem"
import useFirestoreBatch from "../../hooks/useFirestoreBatch"
import InfiniteScroll from "react-infinite-scroll-component"
import { ClipLoader } from "react-spinners"
import UserSkeleton from "../skeletons/UserSkeleton"
import ErrorMessage from "../errors/ErrorMessage"
import { useMediaQuery } from "react-responsive"

const UsersList = () => {
  // Context
  const { user } = useAuth()

  const isMobile = useMediaQuery({ maxWidth: 767 })
  const isDesktop = useMediaQuery({ minWidth: 768 })
  
  // State
  const [isUsersQueryShown, setIsUsersQueryShown] = useState(false)
  const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)

  // Memoized values
  const usersRef = useMemo(() => {
    return collection(firestore, 'profiles')
  }, [])

  const usersContainerRef = useRef(null)

  // Custom hooks
  const {data: users, loading, error, fetchMore, hasMore, refetch } = useFirestoreBatch(
    usersRef, 
    20, 
    [where("isActive", "==", true)]
  )


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
      <button 
        onClick={findPeopleToFollow} 
        className="users-list-follow-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <span>search people</span>
      </button>
      {
        isDesktop && (
          <div>
            <span>online:</span>
            {error && <ErrorMessage message={error} onRetry={refetch} />}
            <div 
              className="active-users-container"
              id="scrollableActiveUsersDiv"
              ref={usersContainerRef}
            >
              <InfiniteScroll
                dataLength={users.length}
                next={fetchMore}
                hasMore={hasMore}
                loader={<ClipLoader color="salmon" />}
                scrollThreshold={0.9}
                scrollableTarget="scrollableActiveUsersDiv"
              >
                <div>
                  {
                    loading ? <UserSkeleton /> : (
                      users.length > 0 ? (users.map((usr, index) => <UserItem key={index} user={usr} />)) : <p>Noone is online.</p>
                    )
                  }
                </div>
               </InfiniteScroll>
            </div>
          </div>
        )
      }
      { isUsersQueryShown && <UsersSearch {...{ setIsUsersQueryShown }}/>}
      { isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} /> }
    </div>
  )
}

export default UsersList


            


     

