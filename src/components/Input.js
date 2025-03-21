const Input = ({ type, placeholder, value, name='input', onChange, required=true, style, ref=null }) => {
    return (
        <input 
          type={type}
          placeholder={placeholder}
          value={value}
          name={name}
          onChange={onChange}
          required={required}
          style={{...style, flex: '1'}}
          ref={ref}
        />
    )
}

export default Input