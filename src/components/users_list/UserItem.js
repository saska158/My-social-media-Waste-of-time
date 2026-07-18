import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { database, ref, onValue } from "../../api/firebase"

const UserItem = ({user}) => {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    const presenceRef = ref(database, `presence/${user.uid}`)
    const unsubscribe = onValue(presenceRef, (snap) => {
      setIsOnline(snap.val() === true)
    })
    return () => unsubscribe()
  }, [user?.uid])

  return (
    <Link to={`/user/${user?.uid}`}>
      <div className="user-item">
        <div style={{position: 'relative', width: '45px', height: '45px'}}>
          <img
            src={user?.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"}
            alt="profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: '50%'
            }}
          />
          {isOnline && <span className="online-indicator"></span>}
        </div>
        <span style={{fontWeight: '800', color: '#000'}}>{user?.displayName}</span>
      </div>
    </Link>
  )
}

export default UserItem
