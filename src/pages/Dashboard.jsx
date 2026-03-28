// Panel principal — accesos directos a los módulos y resumen de estado
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

const MODULOS = [
  {
    ruta: '/eventos',
    titulo: 'Eventos',
    descripcion: 'Crea y administra los eventos de la organización.',
    icono: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />,
  },
  {
    ruta: '/eventos',
    titulo: 'Inventario',
    descripcion: 'Controla recursos y materiales asignados a cada evento.',
    desdeEvento: true,
    icono: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
  },
  {
    ruta: '/eventos',
    titulo: 'Asistencia',
    descripcion: 'Registra aforo estimado vs real por evento.',
    desdeEvento: true,
    icono: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
  },
  {
    ruta: '/eventos',
    titulo: 'Evidencias',
    descripcion: 'Sube y gestiona fotografías por evento con fecha.',
    desdeEvento: true,
    icono: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
  },
  {
    ruta: '/eventos',
    titulo: 'Informes PDF',
    descripcion: 'Genera reportes consolidados de cada evento.',
    desdeEvento: true,
    icono: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
  },
]

export default function Dashboard() {
  const navegar = useNavigate()
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('eventos')
      .select('id, estado, fecha, fecha_fin')
      .then(({ data }) => {
        setEventos(data ?? [])
        setCargando(false)
      })
  }, [])

  // Estadísticas derivadas
  const hoy = new Date().toISOString().split('T')[0]
  const total = eventos.length

  // Evento activo hoy: estado activo Y hoy cae dentro de su rango de fechas
  const activosHoy = eventos.filter((e) => {
    if (e.estado !== 'activo') return false
    if (e.fecha_fin) return e.fecha <= hoy && e.fecha_fin >= hoy
    return e.fecha === hoy
  }).length

  const totalActivos = eventos.filter((e) => e.estado === 'activo').length

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Panel principal</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Gestión logística de eventos — TTS Group S.A.S.
          </p>
        </div>

        {/* Widget de estado */}
        <div className="mb-8">
          {cargando ? (
            // Skeleton de carga
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 flex-1 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : total === 0 ? (
            // Sin eventos registrados
            <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">No hay eventos registrados</p>
                <button
                  onClick={() => navegar('/eventos')}
                  className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
                >
                  Crear el primero
                </button>
              </div>
            </div>
          ) : (
            // Estadísticas
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                valor={total}
                etiqueta={total === 1 ? 'evento registrado' : 'eventos registrados'}
                color="gray"
              />
              <StatCard
                valor={activosHoy}
                etiqueta={activosHoy === 1 ? 'evento en curso hoy' : 'eventos en curso hoy'}
                color={activosHoy > 0 ? 'emerald' : 'gray'}
                vacio={activosHoy === 0}
              />
              <StatCard
                valor={totalActivos}
                etiqueta={totalActivos === 1 ? 'evento activo' : 'eventos activos'}
                color={totalActivos > 0 ? 'blue' : 'gray'}
                vacio={totalActivos === 0}
              />
            </div>
          )}
        </div>

        {/* Cuadrícula de módulos */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map((modulo) => (
            <button
              key={modulo.titulo}
              onClick={() => navegar(modulo.ruta)}
              className="text-left p-5 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
            >
              {/* Ícono */}
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {modulo.icono}
                </svg>
              </div>
              {/* Texto */}
              <h2 className="text-sm font-semibold text-gray-900 mb-1">{modulo.titulo}</h2>
              {modulo.desdeEvento ? (
                <p className="text-xs text-gray-300 leading-relaxed">Accede desde cada evento</p>
              ) : (
                <p className="text-xs text-gray-400 leading-relaxed">{modulo.descripcion}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}

// Tarjeta de estadística del widget
function StatCard({ valor, etiqueta, color, vacio }) {
  const colores = {
    gray:    { num: 'text-gray-900', bg: 'bg-white border-gray-100' },
    emerald: { num: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
    blue:    { num: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
  }
  const c = colores[color] ?? colores.gray

  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${c.bg}`}>
      <p className={`text-2xl font-bold ${vacio ? 'text-gray-300' : c.num}`}>{valor}</p>
      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{etiqueta}</p>
    </div>
  )
}
