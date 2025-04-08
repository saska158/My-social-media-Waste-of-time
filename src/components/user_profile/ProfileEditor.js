import { useState, useRef } from "react"
import { firestore, doc, updateProfile, ref, database, update, updateDoc} from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import { useLoading } from "../../contexts/loadingContext"
import uploadToCloudinaryAndGetUrl from "../../api/uploadToCloudinaryAndGetUrl"
import { PulseLoader } from "react-spinners"

const ProfileEditor = ({profile, setProfile, profileUid}) => {
    // Context
    const { user } = useAuth()
    const { loadingState, setLoadingState } = useLoading()

    // State
    const [imagePreview, setImagePreview] = useState(null)
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
      setProfile(prevProfile => ({...prevProfile, [name]: value})) 
    } 

    const saveProfileChanges = async (e) => {
        e.preventDefault()
        const profileRef = doc(firestore, "profiles", profileUid)
        const imageFile = imageInputRef.current.files[0]
        
        setLoadingState(prev => ({...prev, upload: true}))
    
        let imageUrl = ''
    
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
              /*const userRef = ref(database, `users/${user.uid}`)
              await update(userRef, {photoURL: imageUrl})*/
              setProfile(prev => ({...prev, photoURL: imageUrl}))
            }
          } else {
            await updateDoc(profileRef, profile)
            await updateProfile(user, {
              displayName: profile.displayName,
            })
      
          }      
        } catch(error) {
          console.error(error)
          setError(error)
        } finally {
          setLoadingState(prev => ({...prev, upload: false}))
        }
    }
    
    return (
      <div style={{width: '80%'}}>
        <p>Edit your profile</p>
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
          <input
            type="text"
            value={profile.description}
            name="description"
            onChange={handleInputChange}
            placeholder="bio"
          />
          <input
            type="text"
            value={profile.musicTaste}
            name="musicTaste"
            onChange={handleInputChange}
            placeholder="music taste"
          />
          <input
            type="text"
            value={profile.politicalViews}
            name="politicalViews"
            onChange={handleInputChange}
            placeholder="political views"
          />
          <button 
            style={{background: loadingState.upload ? 'none' : 'salmon'}}
            className="save-changes-button"
            onClick={saveProfileChanges}
            disabled={loadingState.upload}
          >
            { loadingState.upload ? <PulseLoader color="salmon" /> : 'save changes' }
          </button>
        </form>
      </div>
    )
}

export default ProfileEditor