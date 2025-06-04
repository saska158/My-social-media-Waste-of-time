import { useEffect, useState } from "react"
import { firestore, doc, getDoc } from "../api/firebase"
import { ClipLoader } from "react-spinners"
import followToggle from "../api/followToggle"
import ErrorMessage from "./errors/ErrorMessage"

const FollowButton = ({currentUser, targetUser}) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser || !targetUser) return

    const checkFollowingStatus = async () => {
      try {
        const currentUserDoc = await getDoc(doc(firestore, "profiles", currentUser.uid))
        if (currentUserDoc.exists()) {
          const following = currentUserDoc.data().following || []
          setIsFollowing(following.some(user => user.uid === targetUser.uid))
        }
      } catch (error) {
        console.error("Error fetching following status:", error)
        setError("Error fetching following status. Please try again.")
      } 
    }

    checkFollowingStatus()
  }, [currentUser, targetUser])


  const handleFollowToggle = async (e, currentUser, targetUser) => {
    setLoading(true)
    setError(null)

    try {
      await followToggle(e, currentUser, targetUser)
    } catch(error) {
      console.error("Error toggling follow:", error)
      setError("Failed to toggle follow status. Please try again.")
    } finally {
      setLoading(false)
    }
    setIsFollowing((prev) => !prev)
  }

  return (
    <div>
      <button 
        onClick={(e) => handleFollowToggle(e, currentUser, targetUser)} 
        disabled={loading}
        className="user-item-follow-toggle-button"
        style={{border: loading ? '0' : '.2px solid #4f3524'}}
      >
        {
           loading ? <ClipLoader color="#4f3524" /> : (
            isFollowing ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px', color: '#4f3524'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
               ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px', color: '#4f3524'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
               )
           )
        }
      </button>
      {error && <ErrorMessage message={error} />}
    </div>
  )
}

export default FollowButton