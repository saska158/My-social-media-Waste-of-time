import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavigationLayout from './layouts/NavigationLayout'
import RoomsLayout from './layouts/RoomsLayout'
import Homepage from './pages/Homepage'
import SignIn from './pages/Sign-In'
import SignUp from './pages/Sign-Up'
import EmailVerification from './pages/EmailVerification'
import MyChats from './pages/MyChats'
import UserProfile from './pages/UserProfile'
import AuthRequired from './components/AuthRequired'
import { AuthProvider } from './contexts/authContext'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './components/errors/ErrorFallback'

const App = () => {
  return (
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => window.location.reload()}
          >
            <Routes>
              <Route element={<NavigationLayout />}>
                <Route path='/' element={<RoomsLayout />}>
                  <Route index element={<Homepage roomId="main" />} />
                  <Route path=':roomId' element={<Homepage />} />
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
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
  )
}

export default App
