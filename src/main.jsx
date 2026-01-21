
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { RealtimeProvider } from './context/RealtimeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RealtimeProvider>
      <App />
    </RealtimeProvider>
  </React.StrictMode>
)
