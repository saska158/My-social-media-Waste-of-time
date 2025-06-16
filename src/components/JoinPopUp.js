import { Link } from "react-router-dom"
import PopUp from "./PopUp"

const JoinPopUp = ({setIsPopUpShown}) => {
    return (
      <PopUp setIsPopUpShown={setIsPopUpShown} style={{alignItems: 'center', justifyContent: 'center', gap: '1em'}}>
        <div className="join-popup-container">
          <img
            src={`${process.env.PUBLIC_URL}/images/logo-green-2.png`}
            style={{width: '20%'}}
            alt="logo"
          />  
          <h4 style={{fontSize: '2rem'}}>The Waste of Time</h4>
          <p>Sign in or create your account to waste time together!</p>
          <Link to="/sign-up">
            <button className="green-btn" style={{padding: '.75em 1.5em'}}>
              Create an account
            </button>
          </Link>
          <Link to="/sign-in">
            <button className="green-btn" style={{padding: '.75em 1.5em'}}>
              Sign in
            </button>
          </Link>
        </div>
      </PopUp>
    )
}

export default JoinPopUp