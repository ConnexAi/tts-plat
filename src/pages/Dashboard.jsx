// Panel principal — accesos directos a los módulos de la plataforma
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

// Módulos disponibles (se irán completando con las próximas etapas)
const modulos = [
  {
    ruta: '/eventos',
    titulo: 'Eventos',
    descripcion: 'Crea y administra los eventos logísticos de la Secretaría de Salud.',
    disponible: true,
    icono: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
    ),
  },
  {
    ruta: '/inventario',
    titulo: 'Inventario',
    descripcion: 'Controla los recursos y materiales asignados a cada evento.',
    disponible: false,
    icono: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    ),
  },
  {
    ruta: '/asistencia',
    titulo: 'Asistencia',
    descripcion: 'Registra aforo estimado vs real por evento.',
    disponible: false,
    icono: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    ),
  },
  {
    ruta: '/evidencias',
    titulo: 'Evidencias',
    descripcion: 'Sube y gestiona fotografías por evento con fecha.',
    disponible: false,
    icono: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    ),
  },
  {
    ruta: '/informes',
    titulo: 'Informes PDF',
    descripcion: 'Genera reportes consolidados de cada evento.',
    disponible: false,
    icono: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    ),
  },
]

export default function Dashboard() {
  const navegar = useNavigate()

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Saludo */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Panel principal</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Secretaría de Salud Distrital de Cali — TTS Group S.A.S.
          </p>
        </div>

        {/* Cuadrícula de módulos */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modulos.map((modulo) => (
            <button
              key={modulo.ruta}
              onClick={() => modulo.disponible && navegar(modulo.ruta)}
              disabled={!modulo.disponible}
              className={`text-left p-5 bg-white border rounded-2xl transition-all ${
                modulo.disponible
                  ? 'border-gray-100 hover:border-gray-300 hover:shadow-sm cursor-pointer'
                  : 'border-gray-100 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Ícono */}
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {modulo.icono}
                </svg>
              </div>

              {/* Texto */}
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-semibold text-gray-900">{modulo.titulo}</h2>
                {!modulo.disponible && (
                  <span className="text-xs text-gray-300 font-normal">Próximamente</span>
                )}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{modulo.descripcion}</p>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}
