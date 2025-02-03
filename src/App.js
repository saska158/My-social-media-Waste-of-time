import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
//import Room from './Room'
/* 
OVO SU STRANE, KAD IMPORTUJEM U OKVIRU NJIH ONDA SU KOMPONENTE
VIDI DA NAPRAVIS STO VISE ZAJEDNICKIH KOMPONENTI 
*/
import Homepage from './Homepage'
import NavigationLayout from './NavigationLayout'
import ChatRoomLayout from './ChatRoomLayout'
import ChatRoom from './ChatRoom'
//import UsersList from './UsersList'
import SignIn from './Sign-In'
import SignUp from './Sign-Up'
import EmailVerification from './EmailVerification'
import MyProfile from './MyProfile'
import UserProfile from './UserProfile'
import AuthRequired from './AuthRequired'
import { AuthProvider } from './authContext'


function App() {

  return (
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
         <Route path='sign-in' element={<SignIn />} />
         <Route path='sign-up' element={<SignUp />} />
         <Route path='email-verification' element={<EmailVerification />} />
         <Route element={<AuthRequired />}>
          <Route path='my-profile' element={<MyProfile />} />
         </Route>
         <Route path='user/:profileUid' element={<UserProfile />} />
        </Route>
       </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
