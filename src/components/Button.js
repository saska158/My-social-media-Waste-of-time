const Button = ({ onClick, disabled=false, children, style = null }) => {
    return (
        <button onClick={onClick} disabled={disabled} style={style}>{ children }</button>
    )
}

export default Button