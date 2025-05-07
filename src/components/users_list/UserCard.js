import { useAuth } from "../../contexts/authContext"
import FollowButton from "../FollowButton"
import UserItem from "./UserItem"

const UserCard = ({userItem}) => {
    // Context
    const { user } = useAuth()

    return (
        <div className="user-item-container">
          <UserItem user={userItem} />
          <div style={{width: '50%'}}>
            <FollowButton 
              currentUserUid={user.uid} 
              targetUserUid={userItem.uid} 
            />
          </div>
        </div>
    )
}

export default UserCard

