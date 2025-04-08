import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
    auth, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification,
    firestore,
    doc, 
    setDoc, 
    getDoc,
    serverTimestamp
} from "../api/firebase"
import { PulseLoader } from "react-spinners"

const SignUp = () => {
  const initialState = {
    email: '',
    password: '',
    name: '',
    terms: false
  }

  // State
  const [formData, setFormData] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hooks that don't trigger re-renders   
  const navigate = useNavigate()

  // Functions
  const handleChange = (e) => {
    const { value, name, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const createUserProfile = async (user) => { // nema try/catch, loading i greske
    const userRef = doc(firestore, "profiles", user.uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || "",
        description: "", // ove propertije promeni tako da mogu i da budu prikazani(bio, music, politics...)
        musicTaste: "",
        politicalViews: "",
        photoURL: user.photoURL || "",
        followers: [],
        following: [],
        timestamp: serverTimestamp(),
      })
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    const { email, password, name } = formData
    setLoading(true)
    setError(null)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await updateProfile(user, {
        displayName: name
      })
      await sendEmailVerification(user)
      createUserProfile(user)
      setFormData(initialState)
      navigate('/email-verification', {replace:true})// treba nesto da uradim povodom ovoga
    } catch(error) {
        let customMessage
        if(error.code === 'auth/email-already-in-use') {
          customMessage = `WARNING: The email address entered is already being used. Please select another.`
        } else if (error.code === 'auth/invalid-email') {
            customMessage = `WARNING: Enter a valid e-mail address.`
        } else if (error.code === 'auth/missing-password') {
            customMessage = `WARNING: Enter a password.`
        } else {
            customMessage = `Error signing up: ${error.message}`;
        }
        console.error('Error signing up:', error)
        setError(customMessage)
    } finally {
        setLoading(false)
    }
  }

  if(error) {
    return <p>{error}</p>
  }

  return (
    <div>
      <h4>Personal details</h4>
      <form className="sign-in-up-form">
        <input 
          type="email"
          placeholder="E-MAIL"
          value={formData.email}
          name="email"
          onChange={handleChange}
          required
        />
        <input 
          type="password"
          placeholder="PASSWORD"
          value={formData.password}
          name="password"
          onChange={handleChange}
          required
        />
        <input 
          type="text"
          placeholder="NAME"
          value={formData.name}
          name="name"
          onChange={handleChange}
          required
        />
        <label htmlFor="checkbox2" className="checkbox-label">
          <input 
            type="checkbox"
            checked={formData.terms}
            name="terms"
            onChange={handleChange}
            required
          />
          I have read and understand the Privacy and Cookies Policy
        </label>
        {
          loading ? <PulseLoader size={10}  color="white"/> : (
            <button onClick={(e) => handleSignUp(e)} disabled={loading} className="sign-in-up-button">
              CREATE ACCOUNT
            </button>
          )
        }
      </form>
    </div>
  )
}

export default SignUp