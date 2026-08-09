// El playground carga las fuentes por su cuenta; la librería ya no las empotra.
import "@fontsource-variable/inter"
import "@fontsource-variable/jetbrains-mono"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
