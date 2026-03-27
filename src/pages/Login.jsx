// Página de inicio de sesión — diseño moderno, limpio y minimalista
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { iniciarSesion, sesion } = useAuth()
  const navegar = useNavigate()

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Si ya hay sesión activa, redirigir al panel principal
  if (sesion) {
    navegar('/', { replace: true })
    return null
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')

    // Validación básica antes de enviar
    if (!correo.trim() || !contrasena.trim()) {
      setError('Por favor completa todos los campos.')
      return
    }

    setCargando(true)
    const { error: errorAuth } = await iniciarSesion(correo.trim(), contrasena)
    setCargando(false)

    if (errorAuth) {
      // Traducir mensajes comunes de Supabase al español
      if (errorAuth.message.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos.')
      } else if (errorAuth.message.includes('Email not confirmed')) {
        setError('Confirma tu correo electrónico antes de iniciar sesión.')
      } else if (errorAuth.message.includes('Too many requests')) {
        setError('Demasiados intentos. Espera unos minutos e intenta de nuevo.')
      } else {
        setError('Ocurrió un error al iniciar sesión. Intenta de nuevo.')
      }
      return
    }

    navegar('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* Tarjeta de login */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* Encabezado con nombre de empresa */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-900 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-1.989-.487-3.867-1.348-5.523" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">TTS Group</h1>
          <p className="text-sm text-gray-400 mt-1">Plataforma de gestión logística</p>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} noValidate className="space-y-4">

          {/* Campo correo */}
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-300"
              disabled={cargando}
            />
          </div>

          {/* Campo contraseña */}
          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-300"
              disabled={cargando}
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3.5 py-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-2 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ingresando…
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
      </div>

      {/* Pie de página */}
      <p className="mt-6 text-xs text-gray-300">
        © {new Date().getFullYear()} TTS Group S.A.S. — Cali, Colombia
      </p>
    </div>
  )
}
