import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { 
  firestore, 
  doc, 
  getDoc, 
  updateDoc, 
  database, 
  ref, 
  update,
  onValue, 
  arrayUnion,
  onSnapshot,
  updateProfile, 
  collection
} from '../api/firebase'
import { useAuth } from "../contexts/authContext"
import ChatBox from '../components/ChatBox'
import Post from "../components/Post"
import PopUp from "../components/PopUp"

const UserProfile = () => {
    const { profileUid } = useParams()
    const { user } = useAuth()

    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dsjpoak0f/upload"  
    const UPLOAD_PRESET = "profile_pictures"

    const isMyProfile = profileUid === user?.uid

    const [profile, setProfile] = useState({
        displayName: "",
        description: "",
        musicTaste: "",
        politicalViews: "",
        photoURL: "",
        followers: [],
        following: []
    }) //treba li i uid?

    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [uploading, setUploading] = useState(false)


    const [isFollowing, setIsFollowing] = useState(false)

    const [userMainPosts, setUserMainPosts] = useState([])
    const [room, setRoom] = useState('main') 
    const [activeSection, setActiveSection] = useState("about")


    const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)
    const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)
    const [isEditPopupShown, setIsEditPopupShown] = useState(false)

    //const navigate = useNavigate()

    const imageInputRef = useRef(null)

    useEffect(() => {
      //if(!user?.uid) return

      const profileRef = doc(firestore, "profiles", profileUid)
      const unsubscribe = onSnapshot(profileRef, (snapshot) => {
        if(snapshot.exists()) {
          const profileData = snapshot.data()
          setProfile(profileData)
          if(user) {
            setIsFollowing(profileData.followers?.some(follower => follower.uid === user?.uid))
          }
        }
      })

      return () => unsubscribe()

    }, [profileUid, user?.uid])
    

    const handleMessageButton = (e) => {
      e.stopPropagation()
      if(user) {
        setIsChatBoxVisible(!isChatBoxVisible)
      } else {
        //navigate('/sign-in', {
          //state: {
            //message: 'Sign in or create your account to join the conversation!',
            //from: '/' //ovde treba da bude ruta posebnih soba, ne znam kako
          //}
        //})
        setIsJoinPopupShown(true)
      }
    }

  

    /*
    const followUser = () => {
      //ovde treba dodati ovog user-a u profiles/user koji dodaje
      //u property following
      //napraviti i property followers
      //onda omoguciti message
      //videti je l + dugme moze da bude reusabilno
      //jer ga ima ovde a i u user listi - UsersQuery
    }*/

    const handleFollowToggle = async (otherUserUid) => {
      if (!user) return alert("You must be logged in to follow users.")
      //nemas try/catch
            
      const myProfileRef = doc(firestore, "profiles", user.uid)
      const myProfileSnap = await getDoc(myProfileRef)
      const otherUserProfileRef = doc(firestore, "profiles", otherUserUid)
      const otherUserProfileSnap = await getDoc(otherUserProfileRef)
                 
      if(isFollowing) {
        await updateDoc(myProfileRef, {following: myProfileSnap.data().following.filter(profile => profile.uid !== profileUid)})
      } else {
        await updateDoc(myProfileRef, {following: arrayUnion(otherUserProfileSnap.data())})
      }
            
      if(isFollowing) {
        await updateDoc(otherUserProfileRef, {followers: profile.followers.filter(follower => follower.uid !== user.uid)})
      } else {
        await updateDoc(otherUserProfileRef, {followers: arrayUnion(myProfileSnap.data())})
      }
      
      console.log('follow', isFollowing)
    }
    

    //console.log("followers", profile.followers, isFollowing)

    /* postavljamo slushac postova u realtime-u */
    
    useEffect(() => {
      const mainRoomRef = ref(database, room)  
    
      const unsubscribe = onValue(mainRoomRef, (snapshot) => {
        const data = snapshot.val()
        if(data) {
          //console.log("evoooo", Object.values(data).filter(value => value.creatorUid === profileUid))
          //const userPostsArray = Object.values(data).filter(value => value.creatorUid === profileUid)
          const postsArray = Object.keys(data).map(key => ({id: key, ...data[key]})).reverse()
          const userPostsArray = postsArray.filter(post => post.creatorUid === profileUid)
          //console.log(userPostsArray)
          setUserMainPosts(userPostsArray)
        } else {
          setUserMainPosts([])
        }
      })

      return () => unsubscribe()
    }, [profileUid, room])

    const handleImageChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          console.log("result", reader.result)
          //setProfile(prevProfile => ({...prevProfile, photoURL: reader.result}))
          setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }

    const handleInputChange = (e) => {
      const { value, name } = e.target
      setProfile(prevProfile => ({...prevProfile, [name]: value})) 
    } 

    /*const uploadImage = async () => {
      if(!imageFile) return

      setUploading(true)
      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("upload_preset", UPLOAD_PRESET)

      try {
        const response = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData
        })
        const data = await response.json()
        console.log('dataaaa', data.secure_url)

        if(data.secure_url) {
          await updateDoc(doc(firestore, "profiles", user.uid), {photoURL: data.secure_url})
          await updateProfile(user, {
          photoURL: data.secure_url
          })
          setProfile(prev => ({...prev, photoURL: data.secure_url}))
        }
      } catch(error) {
        console.error("Upload failed:", error)
      } finally {
        setUploading(false)
        setImageFile(null)
      }
    }*/

    const saveProfileChanges = async (e) => {
      e.preventDefault()
      const profileRef = doc(firestore, "profiles", profileUid)
      const imageFile = imageInputRef.current.files[0]

      setUploading(true)

      if(imageFile) {
        //await uploadImage()

        const formData = new FormData()
        formData.append("file", imageFile)
        formData.append("upload_preset", UPLOAD_PRESET)

        try {
          const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData
          })
          const data = await response.json()
          console.log('dataaaa', data.secure_url)

          if(data.secure_url) {
            const updatedData = {...profile, photoURL: data.secure_url}
            await updateDoc(doc(firestore, "profiles", user.uid), updatedData)
            await updateProfile(user, {
             displayName: profile.displayName,
             photoURL: data.secure_url
            })
            const userRef = ref(database, `users/${user.uid}`)
            await update(userRef, {photoURL: data.secure_url})
            setProfile(prev => ({...prev, photoURL: data.secure_url}))
            //await updateDoc(profileRef, profile)
            //await updateProfile(user, {
              //displayName: profile.displayName,
              //photoURL: profile.photoURL
            //})
          }
        } catch(error) {
          console.error("Upload failed:", error)
        } finally {
          setUploading(false)
          setImageFile(null)
        }
      } else {
        await updateDoc(profileRef, profile)
        await updateProfile(user, {
          displayName: profile.displayName,
          //photoURL: profile.photoURL
        })

      }      //const profileRef = doc(firestore, "profiles", profileUid)
      //await updateDoc(profileRef, profile)
      //await updateProfile(user, {
        //displayName: profile.displayName,
        //photoURL: profile.photoURL
      //})
      setIsEditPopupShown(false)
    }

    //console.log("prof", profile.photoURL)

    return (
        <div style={{background: 'salmon', position: 'relative', width: '100%'}}>
          {isMyProfile && <p>Ovo je moj profil</p>}
          {
            !isChatBoxVisible ? (
              <>
                {/* Profile Picture */}
                <div style={{display: 'flex', alignItems: 'center', gap: '3em', padding: '1em'}}>
                  <div>
                  <img 
                    src={profile.photoURL || "/images/no-profile-picture.png"} 
                    alt="profile-picture" 
                    style={{
                      width: '100px', 
                      height: '100px', 
                      borderRadius: '50%',
                      objectFit: 'cover', 
                      objectPosition: 'top'
                    }}
                  />
                  <p style={{color: 'white', textAlign: 'center', fontSize: '1.5rem'}}>{profile.displayName}</p>
                  </div>
                  {
                    user && !isMyProfile ? (
                      <button
                  style={{
                    textAlign: 'center',
                    fontSize: '1rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onClick={() => handleFollowToggle(profileUid)}
                >
                  {
                    isFollowing ? (
                      <div
                        style={{
                          border: '.5px solid white',
                          color: 'white',
                          padding: '.5em .8em',
                          borderRadius: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1em'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                        </svg>
                        <span>unfollow</span>
                      </div>
                    ) : (
                      <div
                        style={{
                          border: '.5px solid white',
                          color: 'white',
                          padding: '.5em .8em',
                          borderRadius: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1em'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                        </svg>
                        <span>follow</span>
                      </div>
                    )
                  }
                </button>
                    ) : null
                  }
                  {
                    isMyProfile && (
                      <button
                        style={{
                          border: '.5px solid white',
                          color: 'white',
                          padding: '.5em .8em',
                          borderRadius: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1em'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsEditPopupShown(true)
                        }}
                      >
                        Edit Profile
                      </button>
                    )
                  }
                </div>

                <div style={{display: 'flex', gap: '.5em'}}>
                  <span>
                    <strong>{profile.followers?.length || 0}</strong>
                    {profile.followers?.length === 1 ? 'follower' : 'followers'}
                  </span>
                  <span>
                    <strong>{profile.following?.length || 0}</strong>
                    following
                  </span>
                </div>

                <nav>
                  <button
                   onClick={() => setActiveSection("about")}
                   style={{color: activeSection === "about" ? "white" : ''}}
                  >
                    bio
                  </button>
                  <button 
                   onClick={() => setActiveSection("music")}
                   style={{color: activeSection === "music" ? "white" : ''}}
                  >
                    music taste
                  </button>
                  <button 
                   onClick={() => setActiveSection("politics")}
                   style={{color: activeSection === "politics" ? "white" : ''}}
                  >
                    political views
                  </button>
                  <button 
                   onClick={() => setActiveSection("posts")}
                   style={{color: activeSection === "posts" ? "white" : ''}}
                  >
                    posts
                  </button>
                </nav>
                <div style={{background: '#f7a1a1', padding: '1em'}}>
                {
                  activeSection === "about" && (
                    <p>
                      {profile.description}
                    </p>
                  )
                }

                {
                  activeSection === "music" && (
                    <p>
                      {profile.musicTaste} 
                    </p>
                  )
                }

                {
                  activeSection === "politics" && (
                    <p>
                      {profile.politicalViews} 
                    </p>
                  )
                }

                {
                  activeSection === "posts" && (
                    <div>
                      <nav>
                        <button 
                          onClick={() => setRoom("main")}
                          style={{color: room === "main" ? "white" : ""}}
                        >
                          main
                        </button>
                        <button 
                          onClick={() => setRoom("movies")}
                          style={{color: room === "movies" ? "white" : ""}}
                        >
                          movies
                        </button>
                        <button 
                          onClick={() => setRoom("books")}
                          style={{color: room === "books" ? "white" : ""}}
                        >
                          books
                        </button>
                        <button 
                          onClick={() => setRoom("music")}
                          style={{color: room === "music" ? "white" : ""}}
                        >
                          music
                        </button>
                      </nav>
                      {
                        userMainPosts.length > 0 ? (
                          userMainPosts.map((post, index) => <Post
                                                          key={index}
                                                          id={post.id}
                                                          creatorUid={post.creatorUid}
                                                          photoUrl={post.photoUrl}
                                                          creatorName={post.creatorName}
                                                          post={post.post}
                                                          //setPost={setPost}
                                                          roomId={post.room}
                                                        />)
                        ) : (
                          <p>There's no post yet</p>
                        )
                      } 
                    </div>
                  )
                }
                </div>
                
                <button 
                  onClick={handleMessageButton}
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '.5em .8em',
                    margin: '.8em'
                  }}
                >
                  message
                </button>
              </>
            ) : (
              <ChatBox profileUid={profileUid} profile={profile} setIsChatBoxVisible={setIsChatBoxVisible} />
            )
          }

          {
            isJoinPopupShown && (
              <PopUp setIsPopUpShown={setIsJoinPopupShown}>
                <h1>Razgovori</h1>
                <p>Sign in or create your account to join the conversation!</p>
                <Link to="/sign-up">
                  <button 
                    style={{
                      fontSize: '1rem', 
                      background: 'salmon', 
                      padding: '.7em 1.2em', 
                      borderRadius: '10px',
                      color: 'white'
                    }}
                  >
                    Create an account
                  </button>
                </Link>
                <Link to="/sign-in">
                  <button 
                    style={{
                      fontSize: '1rem',
                      padding: '.7em 1.2em', 
                      borderRadius: '10px',
                      background: 'rgba(238, 171, 163, .5)'
                    }}
                  >
                    Sign in
                  </button>
                </Link>
              </PopUp>
            )
          }

          {
            isEditPopupShown && (
              <PopUp setIsPopUpShown={setIsEditPopupShown}>
                <div style={{width: '80%'}}>
                <p>Edit your profile</p>
                <form style={{display: 'flex', flexDirection: 'column', gap: '1em', margin: '1em'}}>
                  <label
                    style={{
                      //border: '1px solid black',
                      position: 'relative',
                      display: 'inline-block',
                      cursor: 'pointer',
                      borderRadius: '50%',
                      //overflow: 'hidden',
                      width: '100px',
                      height: '100px'
                    }}
                  >
                    <img 
                      src={imagePreview || profile.photoURL /*"/images/no-profile-picture.png"*/}
                      alt="profile"
                      style={{
                        position: 'absolute',
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%',
                        objectFit: 'cover', 
                        objectPosition: 'top'
                      }}
                    />

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px', position: 'absolute', zIndex: '999', right: '3%', top: '0'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>

                    <input
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={imageInputRef}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                        opacity: '0'
                      }}
                      //value={profile.photoURL}
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
                    style={{
                      background: 'salmon', 
                      borderRadius: '20px', 
                      color: 'white',
                      padding: '.5em .8em',
                      alignSelf: 'center'
                    }}
                    onClick={saveProfileChanges}
                  >
                    save changes
                  </button>
                </form>
                </div>
              </PopUp>
            )
          }
        </div>
    )
}

export default UserProfile

/*
ne znam

*/



