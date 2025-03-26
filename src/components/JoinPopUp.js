import { Link } from "react-router-dom"
import PopUp from "./PopUp"

const JoinPopUp = ({setIsPopUpShown}) => {
    return (
        <PopUp setIsPopUpShown={setIsPopUpShown}>
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

export default JoinPopUp