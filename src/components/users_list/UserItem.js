import { Link } from "react-router-dom"

const UserItem = ({user}) => {
    return (
      <>
        {user && (
        <div key={user?.uid} className="active-user-container">
          <Link to={`/user/${user?.uid}`}>
          <div className="active-user">
            <img 
              src={user?.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
              alt="profile"
              className="active-user-profile-image"
            />
            <span style={{color: '#fff'}}>{user?.displayName}</span>
          </div>
        </Link>
      </div>
      )}
      </>
    )
}

export default UserItem