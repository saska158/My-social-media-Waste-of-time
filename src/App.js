import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import NavigationLayout from './layouts/NavigationLayout'
import ChatRoomLayout from './layouts/ChatRoomLayout'
import ChatRoom from './pages/ChatRoom'
import SignIn from './pages/Sign-In'
import SignUp from './pages/Sign-Up'
import EmailVerification from './pages/EmailVerification'
import MyChats from './pages/MyChats'
import UserProfile from './pages/UserProfile'
import AuthRequired from './components/AuthRequired'
import { AuthProvider } from './contexts/authContext'
import { LoadingProvider } from './contexts/loadingContext'

function App() {

  return (
    <LoadingProvider>
      <AuthProvider>
        <BrowserRouter>
         <Routes>
          <Route element={<NavigationLayout />}>
           <Route path='/' element={<Homepage />}>
             <Route element={<ChatRoomLayout />}>
               <Route index element={<ChatRoom roomId="main" />} />
               <Route path=':roomId' element={<ChatRoom />} />
             </Route>
           </Route>
           <Route element={<AuthRequired />}>
            <Route path='my-chats' element={<MyChats />} />
           </Route>
           <Route path='user/:profileUid' element={<UserProfile />} />
          </Route>
          <Route path='sign-in' element={<SignIn />} />
          <Route path='sign-up' element={<SignUp />} /> 
          <Route path='email-verification' element={<EmailVerification />} />
         </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LoadingProvider>
  )
}

export default App
