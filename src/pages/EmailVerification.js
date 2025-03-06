import { auth, reload } from "../api/firebase"
import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/authContext"

const EmailVerification = () => {
    const { user, setUser } = useAuth()
    const [isEmailVerified, setIsEmailVerified] = useState(user?.emailVerified)
    const [verificationMessage, setVerificationMessage] = useState('')
    console.log('Ovo je nas user:', user)

    useEffect(() => {
        if(user) {
          setIsEmailVerified(user?.emailVerified)
        }
    }, [user]) //Cudno, razmisli...ne bi ni bili na ovoj strani da nema user-a...

    const checkEmailVerified = async () => {
        await reload(auth.currentUser)
        const updatedUser = auth.currentUser
        setUser(updatedUser)
        setIsEmailVerified(updatedUser?.emailVerified)
        if(!updatedUser.emailVerified) {
            setVerificationMessage("Your email is not verified yet. Please check your email and verify your account.")
        } 
        /*
        razmisli o svemu u ovoj funkciji, mozda moze i jednostavnije...
        nemas try/catch
        */
    }

    return (
        <>
          {
            !isEmailVerified ? (
                <div className="content-container">
                  <div className="email-verification-content">
                    <h4>Two More Steps to Creating Your Account</h4><br />
                    <p>
                      1. A verification email has been sent to your email address. Please check your inbox and follow the instructions to verify your account.
                    </p><br />
                    <p>
                      2. Once you have verified your email, click the button below to confirm your verification status.
                    </p><br />
                    <button onClick={checkEmailVerified}>I've Verified My Email</button>
                    { verificationMessage && <p>{verificationMessage}</p> }
                  </div>
                </div>
            ) : <Navigate to="/" />//treba da vrati na sobu odakle ga je prebacilo na pravljenje naloga
          }
        </>
    )
}

export default EmailVerification