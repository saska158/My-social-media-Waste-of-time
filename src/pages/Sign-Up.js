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
import Input from "../components/Input"
import Button from "../components/Button"

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
    const { email, password, name, /*terms*/ } = formData
    setLoading(true)
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
        setLoading(false)
    }
  }

  if(loading) {
    return (
      <p>Loading...</p>
    )
  }

  if(error) {
    return (
      <p>{error}</p>
    )
  }

  return (
    <div 
      style={{
      background: 'salmon'
      }}
    >
      <h4>Personal details</h4>
      <form>
        <Input 
          type="email"
          placeholder="E-MAIL"
          value={formData.email}
          name="email"
          onChange={handleChange}
          required
        />
        <Input 
          type="password"
          placeholder="PASSWORD"
          value={formData.password}
          name="password"
          onChange={handleChange}
          required
        />
        <Input 
          type="text"
          placeholder="NAME"
          value={formData.name}
          name="name"
          onChange={handleChange}
          required
        />
        <label htmlFor="checkbox2" className="checkbox-label">
          <Input 
            type="checkbox"
            checked={formData.terms}
            name="terms"
            onChange={handleChange}
            required
          />
          I have read and understand the Privacy and Cookies Policy
        </label>
        <Button onClick={(e) => handleSignUp(e)}>CREATE ACCOUNT</Button>
      </form>
    </div>
  )
}

export default SignUp