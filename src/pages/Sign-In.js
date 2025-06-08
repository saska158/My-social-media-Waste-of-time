import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { auth, signInWithEmailAndPassword, firestore, doc, updateDoc } from "../api/firebase"
import { PulseLoader } from "react-spinners"
import ErrorMessage from "../components/errors/ErrorMessage"

const SignIn = () => {
    // State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Hooks that don't trigger re-renders  
    const location = useLocation()
    const navigate = useNavigate()

    // Functions
    const updateUserActivity = async (uid) => {
        try {
           const userRef = doc(firestore, 'profiles', uid)
           await updateDoc(userRef, {isActive: true})
        } catch(error) {
          console.error("Error during login:", error.message)

          let errorMessage
    
          if (error.code === "permission-denied") {
            errorMessage = "You do not have permission to modify this data.";
          } else if (error.code === "unavailable" || error.code === "network-request-failed") {
            errorMessage = "Network issue occurred. Please check your connection."
          } else if (error.code === "not-found") {
            errorMessage = "User not found."
          } else {
            errorMessage = "Error updating data. Please try again later."
          }

          setError(errorMessage)
        }
    }

    const handleSignIn = async (e) => {
        e.preventDefault()
        if (!email || !password) return
        
        setLoading(true)
        setError(null)
        
        try{
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            setEmail('')
            setPassword('')
            navigate(location.state?.from || '/', {replace: true})
            updateUserActivity(user.uid)
        } catch(error) {
            console.error("Error during sign in:", error.message)

            let errorMessage

            if (error.code === "auth/invalid-email") {
              errorMessage = "The email address is badly formatted."
            } else if (error.code === "auth/missing-password") {
              errorMessage = "Enter a password."
            } else if (error.code === "auth/user-disabled") {
              errorMessage = "Your account has been disabled."
            } else if (error.code === "auth/user-not-found") {
              errorMessage = "No user found with this email address."
            } else if (error.code === "auth/wrong-password") {
              errorMessage = "The password is incorrect."
            } else if (error.code === "auth/invalid-credential") {
              errorMessage = "The user name and password provided do not correspond to any account."
            } else if (error.code === "auth/network-request-failed") {
              errorMessage = "Network error. Please check your connection."
            } else {
              errorMessage = "An error occurred. Please try again later."
            }

            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="sign-in-up-container">
          { location.state?.message ? <p>{location.state.message}</p> : null }
         <h4 style={{fontFamily: "'Anton', sans-serif"}}>Sign in to your account</h4>
         <form className="sign-in-up-form">
            <input 
              type="email"
              placeholder="E-MAIL" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input 
              type='password'
              placeholder="PASSWORD"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {
              loading ? <PulseLoader size={10}  color="#4f3524"/> : (
                <button onClick={e => handleSignIn(e)} disabled={loading} className="dark-border">
                  SIGN IN
                </button>
              )
            }
         </form>
         { error && <ErrorMessage message={error} /> }
        </div>
    )
}

export default SignIn