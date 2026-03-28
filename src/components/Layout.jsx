// Estructura base compartida por todas las páginas protegidas
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const enlaces = [
  { ruta: '/', etiqueta: 'Inicio' },
  { ruta: '/eventos', etiqueta: 'Eventos' },
]

export default function Layout({ children }) {
  const { usuario, cerrarSesion } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Barra superior */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 sm:px-6 flex items-stretch justify-between">

          {/* Marca */}
          <div className="flex items-center gap-3 py-4">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">TTS Group</span>
          </div>

          {/* Navegación central — solo escritorio */}
          <nav className="hidden sm:flex items-stretch gap-1 ml-6">
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

          {/* Derecha — email + salir (escritorio) y hamburguesa (móvil) */}
          <div className="flex items-center gap-2 ml-auto py-4">
            <span className="text-xs text-gray-400 hidden sm:block truncate max-w-40">
              {usuario?.email}
            </span>
            <button
              onClick={cerrarSesion}
              className="hidden sm:block text-xs text-gray-400 hover:text-gray-800 transition-colors"
            >
              Salir
            </button>

            {/* Botón hamburguesa — solo móvil */}
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              className="sm:hidden p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuAbierto ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menú desplegable — solo móvil */}
        {menuAbierto && (
          <div className="sm:hidden border-t border-gray-100 px-4 py-3 space-y-1 bg-white">
            {enlaces.map(({ ruta, etiqueta }) => (
              <NavLink
                key={ruta}
                to={ruta}
                end
                onClick={() => setMenuAbierto(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`
                }
              >
                {etiqueta}
              </NavLink>
            ))}
            <div className="border-t border-gray-100 pt-3 mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400 truncate max-w-[200px]">{usuario?.email}</span>
              <button
                onClick={cerrarSesion}
                className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Contenido de la página */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
