import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { CliantaProvider } from '@clianta/sdk/react';


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}


createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
    <BrowserRouter>
      <CliantaProvider config={{
        projectId: import.meta.env.VITE_CLIANTA_PROJECT_ID,
        apiEndpoint: import.meta.env.VITE_CLIANTA_API_ENDPOINT,
      }}>
        <App />
      </CliantaProvider>
    </BrowserRouter>
  </ClerkProvider>
)
