import { Link } from "react-router-dom"

const UserItem = ({user}) => {
    return (
      <div key={user?.uid} className="active-user-container">
        <Link to={`/user/${user?.uid}`}>
          <div className="active-user">
            <img 
              src={user?.photoURL || "/images/no-profile-picture.png"} 
              alt="profile"
              className="active-user-profile-image"
            />
            <span>{user?.displayName}</span>
          </div>
        </Link>
      </div>
    )
}

export default UserItem