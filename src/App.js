import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
//import Room from './Room'
/* 
OVO SU STRANE, KAD IMPORTUJEM U OKVIRU NJIH ONDA SU KOMPONENTE
VIDI DA NAPRAVIS STO VISE ZAJEDNICKIH KOMPONENTI 
*/
import Layout from './Layout'
import ChatLayout from './ChatLayout'
import ChatRoom from './ChatRoom'
import SignIn from './Sign-In'
import SignUp from './Sign-Up'
import EmailVerification from './EmailVerification'
import User from './User'
import { AuthProvider } from './authContext'

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
       <Routes>
        <Route path='/' element={<Layout />}>
          <Route element={<ChatLayout />}>
            <Route index element={<ChatRoom roomId="main" />} />
            <Route path=":roomId" element={<ChatRoom />} />
          </Route>
          <Route path='sign-in' element={<SignIn />} />
          <Route path='sign-up' element={<SignUp />} />
          <Route path='email-verification' element={<EmailVerification />} />
          <Route path='user' element={<User />} />
        </Route>
       </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
