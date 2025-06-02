import { useState, useRef } from "react"
import { firestore, doc, updateProfile, ref, database, update, updateDoc} from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import uploadToCloudinaryAndGetUrl from "../../api/uploadToCloudinaryAndGetUrl"
import { PulseLoader } from "react-spinners"
import ErrorMessage from "../errors/ErrorMessage"

const ProfileEditor = ({profile, setProfile, profileUid}) => {
    // Context
    const { user } = useAuth()

    // State
    const [imagePreview, setImagePreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Hooks that don't trigger re-renders 
    const imageInputRef = useRef(null)

    // Functions
    const handleImageChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader() // greske
        reader.onloadend = () => {
          setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }
  
    const handleInputChange = (e) => {
      const { value, name } = e.target
      if(name.includes(".")) {
        const [section, key] = name.split(".")

        setProfile(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [key]: value
          }
        }))
      } else {
        setProfile(prev => ({...prev, [name]: value})) 
      }
    } 

    const saveProfileChanges = async (e) => {
        e.preventDefault()
        const profileRef = doc(firestore, "profiles", profileUid)
        const imageFile = imageInputRef.current.files[0]
        let imageUrl = ''
        
        setLoading(true)
        setError(null)
    
        try {
          if(imageFile) {
            imageUrl = await uploadToCloudinaryAndGetUrl(imageFile)
      
            if(imageUrl) {
              const updatedData = {...profile, photoURL: imageUrl}
              await updateDoc(doc(firestore, "profiles", user.uid), updatedData)
              await updateProfile(user, {
                displayName: profile.displayName,
                photoURL: imageUrl
              })
              setProfile(prev => ({...prev, photoURL: imageUrl}))
            }
          } else {
            await updateDoc(profileRef, profile)
            await updateProfile(user, {
              displayName: profile.displayName,
            })
      
          }      
        } catch(error) {
          console.error("Error saving profile changes:", error)
          setError("Something went wrong. Please try again.")
        } finally {
          setLoading(false)
        }
    }
    
    return (
      <div style={{width: '100%', height: '100%', overflowY: 'auto'}}>
        <form className="edit-profile-form">
          <label className="edit-image-label">
            <img src={imagePreview || profile.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} alt="profile" className="edit-image" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px', position: 'absolute', zIndex: '999', right: '3%', top: '0'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <input
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              ref={imageInputRef}
              className="edit-image-input"
            />
          </label>
          <input
            type="text"
            value={profile.displayName}
            name="displayName"
            onChange={handleInputChange}
            placeholder="name"
          />
          <textarea
            value={profile.bio}
            name="bio"
            onChange={handleInputChange}
            placeholder="bio"
            style={{minHeight: '100px', borderRadius: '20px'}}
          />
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '.5em'
            }}
          >
            Currently:
            <input
              type="text"
              value={profile.currently.watching}
              name="currently.watching"
              onChange={handleInputChange}
              placeholder="watching..."
            />
            <input
              type="text"
              value={profile.currently.reading}
              name="currently.reading"
              onChange={handleInputChange}
              placeholder="reading..."
            />
            <input
              type="text"
              value={profile.currently.listening}
              name="currently.listening"
              onChange={handleInputChange}
              placeholder="listening..."
            />
          </label>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '.5em'
            }}
          >
            Favorites:
            <input
              type="text"
              value={profile.favorites.watching}
              name="favorites.watching"
              onChange={handleInputChange}
              placeholder="watching..."
            />
            <input
              type="text"
              value={profile.favorites.reading}
              name="favorites.reading"
              onChange={handleInputChange}
              placeholder="reading"
            />
            <input
              type="text"
              value={profile.favorites.listening}
              name="favorites.listening"
              onChange={handleInputChange}
              placeholder="listening"
            />
          </label>
          <button 
            style={{background: loading ? 'none' : '#f29bbe'}}
            className="save-changes-button"
            onClick={saveProfileChanges}
            disabled={loading}
          >
            { loading ? <PulseLoader color="#f29bbe" /> : 'save changes' }
          </button>
          {error && <ErrorMessage message={error} />}
        </form>
      </div>
    )
}

export default ProfileEditor