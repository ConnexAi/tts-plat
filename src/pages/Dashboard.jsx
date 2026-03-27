// Panel principal — visible solo con sesión activa
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { usuario, cerrarSesion } = useAuth()

  async function handleCerrarSesion() {
    await cerrarSesion()
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Barra superior */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">TTS Group</h1>
          <p className="text-xs text-gray-400">Gestión logística de eventos</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{usuario?.email}</span>
          <button
            onClick={handleCerrarSesion}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Bienvenido</h2>
        <p className="text-gray-400 text-sm">El sistema de módulos estará disponible próximamente.</p>
      </main>
    </div>
  )
}
