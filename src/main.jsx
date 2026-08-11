import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Stop the browser's automatic "Add to Home Screen" / install mini-infobar
// from popping up on its own. The app remains installable through the
// browser's own menu (e.g. Chrome's "Install app" option) — this only
// blocks the unsolicited auto-prompt.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
