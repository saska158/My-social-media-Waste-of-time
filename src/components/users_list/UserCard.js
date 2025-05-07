import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/authContext"
import fetchProfile from "../../api/fetchProfile"
import FollowButton from "../FollowButton"
import UserItem from "./UserItem"

const UserCard = ({userItem}) => {
    // Context
    const { user } = useAuth()

    // State
    const [currentUser, setCurrentUser] = useState(false)
    const [error, setError] = useState(null)

    // Effects
    useEffect(() => {
      if(!user) return
      const getProfile = async () => {
        try {
          await fetchProfile(user.uid, setCurrentUser)
        } catch(error) {
          console.error("Error fetching profile:", error)
          setError(error)
        }
      }
    
      getProfile()
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
          </div>
        </div>
    )
}

export default UserCard

