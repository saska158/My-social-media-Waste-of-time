const Input = ({ type, placeholder, value, name='input', onChange, required=true }) => {
    return (
        <input 
          type={type}
          placeholder={placeholder}
          value={value}
          name={name}
          onChange={onChange}
          required={required}
        />
    )
}

export default Input