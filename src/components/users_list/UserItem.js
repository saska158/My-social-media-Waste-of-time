import { Link } from "react-router-dom"

const UserItem = ({user}) => {
    return (
      <Link to={`/user/${user?.uid}`}>
        <div className="user-item">
          <img 
            src={user?.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
            alt="profile"
            className="user-img user-img-medium"
          />
          <span>{user?.displayName}</span>
        </div>
      </Link>
    )
}

export default UserItem