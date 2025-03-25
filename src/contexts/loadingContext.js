import { useState, createContext, useContext } from "react"

const LoadingContext = createContext()

export const LoadingProvider = ({children}) => {
    const [loadingState, setLoadingState] = useState({
        auth: false, // For sign-in/up
        messages: false, // For fetching messages
        upload: false, // For file uploads
    })
    
    return (
        <LoadingContext.Provider value={{loadingState, setLoadingState}}>
            {children}
        </LoadingContext.Provider>
    )
}

export const useLoading = () => useContext(LoadingContext)