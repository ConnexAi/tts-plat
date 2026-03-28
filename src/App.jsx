// Configuración de rutas de la aplicación
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './components/RutaProtegida'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Eventos from './pages/Eventos'
import Inventario from './pages/Inventario'
import Asistencia from './pages/Asistencia'
import Evidencias from './pages/Evidencias'
import Informe from './pages/Informe'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            }
          />
          <Route
            path="/eventos"
            element={
              <RutaProtegida>
                <Eventos />
              </RutaProtegida>
            }
          />

          <Route
            path="/inventario/:eventoId"
            element={
              <RutaProtegida>
                <Inventario />
              </RutaProtegida>
            }
          />

          <Route
            path="/asistencia/:eventoId"
            element={
              <RutaProtegida>
                <Asistencia />
              </RutaProtegida>
            }
          />

          <Route
            path="/evidencias/:eventoId"
            element={
              <RutaProtegida>
                <Evidencias />
              </RutaProtegida>
            }
          />

          <Route
            path="/informe/:eventoId"
            element={
              <RutaProtegida>
                <Informe />
              </RutaProtegida>
            }
          />

          {/* Ruta desconocida → inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
