import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/authContext"
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
        <div className="user-item-container">
          <UserItem user={userItem} />
          <div style={{width: '50%'}}>
            {
              currentUser.uid !== userItem.uid && (
                <FollowButton 
                  currentUser={currentUser}
                  targetUser={userItem}
            />
              )
            }
            {error && <ErrorMessage message={error} />}     
          </div>
        </div>
    )
}

export default UserCard

