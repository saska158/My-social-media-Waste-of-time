import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  firestore, 
  doc, 
  getDoc, 
  updateDoc, 
  database, 
  ref, 
  onValue, 
  arrayUnion,
  arrayRemove, 
  onSnapshot 
} from './firebase'
import { useAuth } from "./authContext"
import ChatBox from './ChatBox'
import Post from "./Post"

const UserProfile = () => {
    const { profileUid } = useParams()
    const { user } = useAuth()

    const [profile, setProfile] = useState({
        displayName: "",
        description: "",
        musicTaste: "",
        politicalViews: "",
        photoURL: "",
        followers: [],
        following: []
    }) //treba li i uid?

    const [isFollowing, setIsFollowing] = useState(false)

    const [userMainPosts, setUserMainPosts] = useState([])
    const [room, setRoom] = useState('main') 
    const [activeSection, setActiveSection] = useState("about")


    const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
      if(!user?.uid) return

      const profileRef = doc(firestore, "profiles", profileUid)
      const unsubscribe = onSnapshot(profileRef, (snapshot) => {
        if(snapshot.exists()) {
          const profileData = snapshot.data()
          setProfile(profileData)
          setIsFollowing(profileData.followers?.some(follower => follower.uid === user?.uid))
        }
      })

      return () => unsubscribe()

    }, [profileUid, user?.uid])//da l mi uopste treba dependency
    

    const handleMessageButton = () => {
      if(user) {
        setIsChatBoxVisible(!isChatBoxVisible)
      } else {
        navigate('/sign-in')
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
          const postsArray = Object.keys(data).map(key => ({id: key, ...data[key]}))
          const userPostsArray = postsArray.filter(post => post.creatorUid === profileUid)
          console.log(userPostsArray)
          setUserMainPosts(userPostsArray)
        } else {
          setUserMainPosts([])
        }
      })

      return () => unsubscribe()
    }, [profileUid, room])

    return (
        <div style={{background: 'salmon', position: 'relative', width: '30%'}}>
          {
            !isChatBoxVisible ? (
              <>
                {/* Profile Picture */}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1em'}}>
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
                    about me
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
        </div>
    )
}

export default UserProfile

/*


*/



