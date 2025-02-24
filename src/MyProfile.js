import { useState, useEffect } from "react"
import { useAuth } from "./authContext"
import { database, firestore, doc, getDoc, updateDoc, updateProfile, ref, update } from './firebase'
import Post from "./Post"
//import MyChats from "./MyChats"

const MyProfile = () => {
  const { user } = useAuth()
  //console.log("user iz profile:", user?.uid)

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dsjpoak0f/upload"  
  const UPLOAD_PRESET = "profile_pictures"

  const [profile, setProfile] = useState({
    displayName: "",
    description: "",
    musicTaste: "",
    politicalViews: "",
    photoURL: "",
   // posts: [],
    followers: [],
    following: []
  })
  const [editingField, setEditingField] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if(!user?.uid) return //da l uopste treba? cim smo na ovoj komponenti to znaci da ima user
      const userDoc = await getDoc(doc(firestore, "profiles", user.uid))
      if(userDoc.exists()) {
        setProfile(userDoc.data())
      }
    }

    fetchUserData()
  }, [user?.uid])//da l mi uopste treba dependency

  //console.log(profile)

  const handleEdit = (field) => {
    setEditingField(field)
    setInputValue(profile[field] || "") // Initialize input with existing data
  }

  const handleSave = async (field) => {
    if (!user.uid) return //vrv ne treba
    const profileRef = doc(firestore, "profiles", user.uid)
    await updateDoc(profileRef, {[field]: inputValue})

    setProfile((prev) => ({ ...prev, [field]: inputValue }))
    setEditingField(null)
  }

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0])
  }

  
  const handleUpload = async () => {
    if(!imageFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", imageFile)
    formData.append("upload_preset", UPLOAD_PRESET)
    
    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
      })
      const data = await response.json()
      console.log(data.secure_url)

      if(data.secure_url) {
        await updateDoc(doc(firestore, "profiles", user.uid), {photoURL: data.secure_url})
        await updateProfile(user, {
          photoURL: data.secure_url
        })
        const userRef = ref(database, `users/${user.uid}`)
        await update(userRef, {photoURL: data.secure_url})
        console.log("user reeeeeeeef", userRef)
        setProfile(prev => ({...prev, photoURL: data.secure_url}))
      }
    } catch(error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
      setImageFile(null)
    }
  }

    return (
        <div style={{display: 'flex', gap: '1em', padding: '1em', width: '100%'}}>
          <div /*style={{width: '55%'}}*/>
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
              }}/>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!imageFile || uploading}>
              { uploading ? "Uploading..." : "Upload Image" }
            </button>
          </div>
          <div style={{display: 'flex', gap: '.5em'}}>
                  <span>
                    <strong>{profile.followers?.length || 0}</strong>
                    {profile.followers?.length === 1 ? 'follower' : 'followers'}
                  </span>
                  <span>
                    <strong>{profile.following?.length || 0}</strong>
                    following
                  </span>
                </div>
          {/* Description */}
          <div>
            <strong>about me:</strong>
            {
              editingField === 'description' ? (
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={() => handleSave("description")}
                  autoFocus
                /> //stavi komponentu Input
              ) : (
                <p onClick={() => handleEdit("description")}>
                  {profile.description || "Click to add a description..."}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </p>
              )
            }
          </div>
          {/* Music Taste */}
          <div>
            <strong>Music Taste:</strong>
            {editingField === "musicTaste" ? (
              <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => handleSave("musicTaste")}
              autoFocus
              />
            ) : (
              <p onClick={() => handleEdit("musicTaste")}>
                {profile.musicTaste || "Click to add favorite music..."}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </p>
            )}
          </div>
          {/* Political Views */}
          <div>
            <strong>Political Views:</strong>
            {editingField === "politicalViews" ? (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={() => handleSave("politicalViews")}
                autoFocus
              />
              ) : (
                <p onClick={() => handleEdit("politicalViews")}>
                  {profile.politicalViews || "Click to add political views..."} 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </p>
            )}
          </div>
          {/* Posts */}
          <div>
            <strong>Posts:</strong>
            {/*
              profile && profile?.posts?.length > 0 ? (
                profile.posts.map((post, index) => <Post 
                                            id={index}
                                            //userUid={profileUid}
                                            photoURL={profile.photoURL}
                                            username={profile.displayName}
                                            messageText={post}
                                          />)
              ) : (
                <p>There's no post yet</p>
              )
            */}
          </div>
        </div>
         {/* <MyChats userUid={user.uid} /> */}
        </div>
    )
}

export default MyProfile

/*
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>

*/