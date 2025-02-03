import { useState, useEffect } from "react"
import { useAuth } from "./authContext"
import { firestore, doc, getDoc, updateDoc } from './firebase'

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

  console.log("Image File:", imageFile)

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
        <>
          {/* Profile Picture */}
          <div>
            <img 
              src={profile.photoURL || "/images/no-profile-picture.png"} 
              alt="profile-picture" 
              style={{width: '100px', height: '100px', objectFit: 'cover', objectPosition: 'top'}} 
            />
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!imageFile || uploading}>
              { uploading ? "Uploading..." : "Upload Image" }
            </button>
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
                  {profile.description || "Click to add a description..."}🖊️
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
                {profile.musicTaste || "Click to add favorite music..."} 🖊️
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
              {profile.politicalViews || "Click to add political views..."} 🖊️
            </p>
          )}
          </div>
        </>
    )
}

export default MyProfile