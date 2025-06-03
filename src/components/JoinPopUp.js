import { Link } from "react-router-dom"
import PopUp from "./PopUp"

const JoinPopUp = ({setIsPopUpShown}) => {
    return (
      <PopUp setIsPopUpShown={setIsPopUpShown}>
        <h1>Waste of Time</h1>
        <p>Sign in or create your account to join the conversation!</p>
        <Link to="/sign-up">
          <button className="join-button">Create an account</button>
        </Link>
        <Link to="/sign-in">
          <button className="join-button">Sign in</button>
        </Link>
      </PopUp>
    )
}

export default JoinPopUp