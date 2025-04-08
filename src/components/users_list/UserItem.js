import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/authContext"
import FollowButton from "../FollowButton"

const UserItem = ({userItem}) => {
    // Context
    const { user } = useAuth()

    return (
        <div className="user-item-container">
          <Link to={`user/${userItem.uid}`}>
            <div className="user-item-infos">
              <img src={userItem.photoURL} alt="profile" className="user-item-profile-image"/>
              <span>{userItem.displayName}</span>
            </div>
          </Link>
          <div style={{width: '50%'}}>
            <FollowButton 
              currentUserUid={user.uid} 
              targetUserUid={userItem.uid} 
            />
          </div>
        </div>
    )
}

export default UserItem

