const Button = ({ onClick, disabled=false, children }) => {
    return (
        <button onClick={onClick} disabled={disabled}>{ children }</button>
    )
}

export default Button