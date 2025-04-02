import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { 
    auth, 
    signInWithEmailAndPassword, 
    database, 
    ref, 
    update, 
} from "../api/firebase"
import { useLoading } from "../contexts/loadingContext"
import { PulseLoader } from "react-spinners"

const SignIn = () => {
    // Context
    const { loadingState, setLoadingState } = useLoading()
    // State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    // Hooks that don't trigger re-renders  
    const location = useLocation()
    const navigate = useNavigate()

    // Functions
    const updateUserActivity = async (uid) => {
        try {
            const userRef = ref(database, `users/${uid}`)
            await update(userRef, {isActive: true})
            console.log(`Korisnik ${uid} prijavljen i aktiviran.`)
        } catch(error) {
            console.error("Greška prilikom prijavljivanja:", error.message)
        }
    }

    const handleSignIn = async (e) => {
        e.preventDefault()
        setLoadingState(prev => ({...prev, auth: true}))
        setError(null)
        try{
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            setEmail('')
            setPassword('')
            navigate(location.state?.from || '/', {replace: true})
            updateUserActivity(user.uid)
        } catch(error) {
            let customMessage
            if(error.code === 'auth/invalid-credential') {
                customMessage = `WARNING: The user name and password provided do not correspond to any account.`
            }  else if (error.code === 'auth/invalid-email') {
                customMessage = `WARNING: Enter a valid e-mail address.`
            } else if (error.code === 'auth/missing-password') {
                customMessage = `WARNING: Enter a password.`
            }  else {
                customMessage = `Error signing up: ${error.message}`;
            }
            console.error('Error signing up:', error)
            setError(customMessage)
        } finally {
            setLoadingState(prev => ({...prev, auth: false}))
        }
    }

    if(error) {
        return <p>{error}</p>
    }
    
    return (
        <>
          { location.state?.message ? <p>{location.state.message}</p> : null }
         <h4>Sign in to your account</h4>
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
              loadingState.auth ? <PulseLoader size={10}  color="white"/> : (
                <button onClick={e => handleSignIn(e)} disabled={loadingState.auth} className="sign-in-up-button">
                  SIGN IN
                </button>
              )
            }
         </form>
        </>
    )
}

export default SignIn