// Estructura base compartida por todas las páginas protegidas
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const enlaces = [
  { ruta: '/', etiqueta: 'Inicio' },
  { ruta: '/eventos', etiqueta: 'Eventos' },
]

export default function Layout({ children }) {
  const { usuario, cerrarSesion } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Barra superior */}
      <header className="bg-white border-b border-gray-100 px-6 py-0 flex items-stretch justify-between sticky top-0 z-10">

        {/* Marca */}
        <div className="flex items-center gap-3 py-4">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">TTS Group</span>
        </div>

        {/* Navegación central */}
        <nav className="flex items-stretch gap-1 ml-6">
          {enlaces.map(({ ruta, etiqueta }) => (
            <NavLink
              key={ruta}
              to={ruta}
              end
              className={({ isActive }) =>
                `flex items-center px-3 text-sm border-b-2 transition-colors ${
                  isActive
                    ? 'border-gray-900 text-gray-900 font-medium'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`
              }
            >
              {etiqueta}
            </NavLink>
          ))}
        </nav>

        {/* Usuario + cerrar sesión */}
        <div className="flex items-center gap-4 ml-auto py-4">
          <span className="text-xs text-gray-400 hidden sm:block truncate max-w-40">
            {usuario?.email}
          </span>
          <button
            onClick={cerrarSesion}
            className="text-xs text-gray-400 hover:text-gray-800 transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Contenido de la página */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
