import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { firestore, doc, getDoc } from './firebase'

const UserProfile = () => {
    const { userUid } = useParams()

    console.log('fffffff')

    const [profile, setProfile] = useState({
        displayName: "",
        description: "",
        musicTaste: "",
        politicalViews: "",
        photoURL: "",
    })

    useEffect(() => {
        const fetchUserData = async () => {
          //if(!user?.uid) return //da l uopste treba? cim smo na ovoj komponenti to znaci da ima user
          const userDoc = await getDoc(doc(firestore, "profiles", userUid))
          if(userDoc.exists()) {
            setProfile(userDoc.data())
          }
        }
    
        fetchUserData()
      }, [userUid])//da l mi uopste treba dependency
    

    return (
        <>
          {/* Profile Picture */}
          <div>
            <img 
              src={profile.photoURL || "/images/no-profile-picture.png"} 
              alt="profile-picture" 
              style={{width: '100px', height: '100px', objectFit: 'cover', objectPosition: 'top'}} 
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
        </>
    )
}

export default UserProfile