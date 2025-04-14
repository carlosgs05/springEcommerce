import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Formulario from './Formulario'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Formulario />
  </StrictMode>,
)
