const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert" style={{ padding: "1rem", color: "red" }}>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

export default ErrorFallback
