import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { firestore, doc, getDoc } from './firebase'
import { useAuth } from "./authContext"
import ChatBox from './ChatBox'

const UserProfile = () => {
    const { profileUid } = useParams()
    const { user } = useAuth()

    const [profile, setProfile] = useState({
        displayName: "",
        description: "",
        musicTaste: "",
        politicalViews: "",
        photoURL: "",
    }) //treba li i uid?

    const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        const fetchUserData = async () => {
          //if(!user?.uid) return //da l uopste treba? cim smo na ovoj komponenti to znaci da ima user
          const userDoc = await getDoc(doc(firestore, "profiles", profileUid))
          if(userDoc.exists()) {
            setProfile(userDoc.data())
          }
        }
    
        fetchUserData()
      }, [profileUid])//da l mi uopste treba dependency
    

    const handleMessageButton = () => {
      if(user) {
        setIsChatBoxVisible(!isChatBoxVisible)
      } else {
        navigate('/sign-in')
      }
    }

    return (
        <div style={{background: 'salmon', position: 'relative'}}>
          {/* Profile Picture */}
          <div>
            <img 
              src={profile.photoURL || "/images/no-profile-picture.png"} 
              alt="profile-picture" 
              style={{
                width: '100px', 
                height: '100px', 
                borderRadius: '50%',
                objectFit: 'cover', 
                objectPosition: 'top'
              }}
            />
          </div>
          {/* Description */}
          <div>
            <strong>about me:</strong>
            <p>
              {profile.description}
            </p>
          </div>
          {/* Music Taste */}
          <div>
            <strong>Music Taste:</strong>
            <p>
              {profile.musicTaste} 
            </p>
          </div>
          {/* Political Views */}
          <div>
          <strong>Political Views:</strong>
            <p>
              {profile.politicalViews} 
            </p>
          </div>
          <button onClick={handleMessageButton}>message</button>
          {
            isChatBoxVisible && <ChatBox profileUid={profileUid} profile={profile} setIsChatBoxVisible={setIsChatBoxVisible} />
          }
        </div>
    )
}

export default UserProfile