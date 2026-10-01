import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/manrope'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider.jsx'
import AuthGate from './components/auth/AuthGate.jsx'
import './index.css' // <-- FONDAMENTALE: Se manca questa riga, Tailwind non viene caricato!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </AuthProvider>
  </React.StrictMode>,
)
