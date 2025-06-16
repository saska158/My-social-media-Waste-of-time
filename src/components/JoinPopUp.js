import { Link } from "react-router-dom"
import PopUp from "./PopUp"

const JoinPopUp = ({setIsPopUpShown}) => {
    return (
      <PopUp setIsPopUpShown={setIsPopUpShown}>
        <div style={{color: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em'}}>
          <h1>Waste of Time</h1>
        <p>Sign in or create your account to waste time together!</p>
        <Link to="/sign-up">
          <button 
            style={{
              fontSize: '1rem', 
              padding: '.7em 1.2em', 
              borderRadius: '30px',
              backgroundColor: '#eaf4f0'
            }}>
              Create an account
            </button>
        </Link>
        <Link to="/sign-in">
          <button 
            style={{
              fontSize: '1rem', 
              padding: '.7em 1.2em', 
              borderRadius: '30px',
              backgroundColor: '#eaf4f0'
            }}
          >
            Sign in
          </button>
        </Link>
        </div>
      </PopUp>
    )
}

export default JoinPopUp