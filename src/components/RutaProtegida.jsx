// Componente para proteger rutas que requieren sesión activa
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ children }) {
  const { sesion, cargando } = useAuth()

  // Mostrar pantalla vacía mientras se verifica la sesión
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  // Redirigir al login si no hay sesión activa
  if (!sesion) {
    return <Navigate to="/login" replace />
  }

  return children
}
