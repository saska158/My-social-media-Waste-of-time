import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
    auth, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification,
    database,
    ref,
    set,
    firestore,
    doc, 
    setDoc, 
    getDoc 
} from "../api/firebase"
import { useLoading } from "../contexts/loadingContext"
import { PulseLoader } from "react-spinners"

const SignUp = () => {
  const initialState = {
    email: '',
    password: '',
    name: '',
    terms: false
  }

  // Context
  const { loadingState, setLoadingState } = useLoading()

  // State
  const [formData, setFormData] = useState(initialState)
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

  const saveUserToDatabase = (user) => {
    set(ref(database, `users/${user.uid}`), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isActive: false,
      photoURL: ''
    })
  }

  const createUserProfile = async (user) => {
    const userRef = doc(firestore, "profiles", user.uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      // Create a new user profile in Firestore
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || "",
        description: "",
        musicTaste: "",
        politicalViews: "",
        photoURL: user.photoURL || "",
        createdAt: new Date(),
      })
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    const { email, password, name } = formData
    setLoadingState(prev => ({...prev, auth: true}))
    setError(null)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log('Ovo je user:', user)
      await updateProfile(user, {
        displayName: name
      })
      await sendEmailVerification(user)
      console.log('User signed up successfully:', user)
      saveUserToDatabase(user)
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
        setLoadingState(prev => ({...prev, auth: false}))
    }
  }

  if(error) {
    return (
      <p>{error}</p>
    )
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
          loadingState.auth ? (
            <PulseLoader size={10}  color="white"/>
          ) : (
            <button 
              onClick={(e) => handleSignUp(e)}
              disabled={loadingState.auth}
              className="sign-in-up-button"
            >
              CREATE ACCOUNT
            </button>
          )
        }
      </form>
    </div>
  )
}

export default SignUp