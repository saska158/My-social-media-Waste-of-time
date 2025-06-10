import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../contexts/authContext"
import { firestore, doc, getDoc } from "../../api/firebase"
import fetchProfile from "../../api/fetchProfile"
import FollowButton from "../FollowButton"
import UserItem from "./UserItem"
import ErrorMessage from "../errors/ErrorMessage"

const UserCard = ({userItem}) => {
    // Context
    const { user } = useAuth()

    // State
    const [currentUser, setCurrentUser] = useState(false)
    const [error, setError] = useState(null)

    // Effects
    useEffect(() => {
      if(!user) return
    
      const getCurrentUserProfile = async () => {
        setError(null)
        try {
          await fetchProfile(user.uid, setCurrentUser)
        } catch(error) {
          console.error("Error fetching profile:", error)
          setError("Oops! Can’t follow the user. Please try again later.")
        } 
      }
    
      getCurrentUserProfile()
    }, [user?.uid])



    return (
        <div className="user-card-container">
          <UserItem user={userItem} />
          {
            currentUser.uid !== userItem.uid && (
              <FollowButton 
                currentUser={currentUser}
                targetUser={userItem}
                type="bordered"
              />
            )
          }
          {error && <ErrorMessage message={error} />}     
        </div>
    )
}

export default UserCard