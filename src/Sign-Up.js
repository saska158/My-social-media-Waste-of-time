import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
    auth, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification,
    database,
    ref,
    set 
} from "./firebase"
import Input from "./Input"
import Button from "./Button"

const SignUp = () => {
    const initialState = {
        email: '',
        password: '',
        name: '',
        terms: false
    }
    const [formData, setFormData] = useState(initialState)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
   // const [alert, setAlert] = useState('')

    const navigate = useNavigate()

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
        isActive: false
      })
    }

    const handleSignUp = async (e) => {
        e.preventDefault()
        const { email, password, name, /*terms*/ } = formData
       /* if (!name || !email || !password || !terms) {
            setAlert("Please fill in all fields and agree to the terms and conditions.")
            return
        }*/
        setLoading(true)
        setError(null)/* da li treba, mozda pravi bespotrevni rerender? */
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
        <div style={{background: 'salmon'}}>
            <h4>Personal details</h4>
            <form>
                {/*<input 
                   type="email"
                  // id="email"
                   placeholder="E-MAIL" 
                   value={formData.email}
                   name="email"
                   onChange={handleChange}
                   required
                />*/}
                <Input 
                  type="email"
                  placeholder="E-MAIL"
                  value={formData.email}
                  name="email"
                  onChange={handleChange}
                  required
                />
                {/*<input 
                  //type={showPassword ? 'text' : 'password'}
                  type="password"
                 // id="password"
                  placeholder="PASSWORD"
                  value={formData.password}
                  name="password"
                  onChange={handleChange}
                  required
                />*/}
                <Input 
                  type="password"
                  placeholder="PASSWORD"
                  value={formData.password}
                  name="password"
                  onChange={handleChange}
                  required
                />
                {/*<input 
                  type="text"
                 // id="name"
                  placeholder="NAME"
                  value={formData.name}
                  name="name"
                  onChange={handleChange}
                  required
                />*/}
                <Input 
                  type="text"
                  placeholder="NAME"
                  value={formData.name}
                  name="name"
                  onChange={handleChange}
                  required
                />
                <label htmlFor="checkbox2" className="checkbox-label">
                {/*<input 
                  type="checkbox"
                //  id="checkbox2"
                  checked={formData.terms}
                  name="terms"
                  onChange={handleChange}
                  required
                />*/}
                <Input 
                  type="checkbox"
                  //  id="checkbox2"
                  checked={formData.terms}
                  name="terms"
                  onChange={handleChange}
                  required
                />
                  I have read and understand the Privacy and Cookies Policy
                </label>
              {/*<button onClick={(e) => handleSignUp(e)}>CREATE ACCOUNT</button>*/}
              <Button onClick={(e) => handleSignUp(e)}>CREATE ACCOUNT</Button>
            </form>
        </div>
    )
}

export default SignUp