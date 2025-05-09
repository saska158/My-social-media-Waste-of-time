const ErrorMessage = ({message}) => {
    if(!message) return null
    return (
        <div style={{border: '1p solid red'}}>
            <p>{message}</p>
        </div>
    )
}

export default ErrorMessage