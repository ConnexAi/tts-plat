// Módulo de control de asistencia — registros estimado vs real por evento
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import FormularioAsistencia from '../components/FormularioAsistencia'
import { useAsistencia } from '../hooks/useAsistencia'

export default function Asistencia() {
  const { eventoId } = useParams()
  const navegar = useNavigate()
  const {
    registros, evento, cargando, error,
    ultimoRegistro, estadisticas,
    crearRegistro, actualizarRegistro, eliminarRegistro,
  } = useAsistencia(eventoId)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [registroEditando, setRegistroEditando] = useState(null)

  function abrirCrear() {
    setRegistroEditando(null)
    setMostrarFormulario(true)
  }

  function abrirEditar(registro) {
    setRegistroEditando(registro)
    setMostrarFormulario(true)
  }

  function cerrarFormulario() {
    setMostrarFormulario(false)
    setRegistroEditando(null)
  }

  async function guardar(campos) {
    let resultado
    if (registroEditando) {
      resultado = await actualizarRegistro(registroEditando.id, campos)
    } else {
      resultado = await crearRegistro(campos)
    }
    if (!resultado.error) cerrarFormulario()
    return resultado
  }

  async function confirmarEliminar(id) {
    if (window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) {
      await eliminarRegistro(id)
    }
  }

  const fechaEvento = evento
    ? new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Botón volver */}
        <button
          onClick={() => navegar('/eventos')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a eventos
        </button>

        {/* Cargando */}
        {cargando && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !cargando && (
          <div className="text-center py-16">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!cargando && !error && evento && (
          <>
            {/* Cabecera del evento */}
            <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Control de asistencia
                </p>
                <h1 className="text-xl font-semibold text-gray-900">{evento.nombre}</h1>
                <p className="text-sm text-gray-400 mt-1">
                  {fechaEvento} · {evento.lugar}
                </p>
              </div>
              <button
                onClick={abrirCrear}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Registrar asistencia
              </button>
            </div>

            {/* Tarjetas de resumen — último registro */}
            {ultimoRegistro && estadisticas && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <TarjetaStat
                  valor={ultimoRegistro.aforo_estimado.toLocaleString('es-CO')}
                  etiqueta="Aforo estimado"
                  color="gray"
                />
                <TarjetaStat
                  valor={ultimoRegistro.asistencia_real.toLocaleString('es-CO')}
                  etiqueta="Asistencia real"
                  color="gray"
                />
                <TarjetaStat
                  valor={`${estadisticas.porcentaje}%`}
                  etiqueta="Ocupación"
                  color={
                    estadisticas.porcentaje >= 90 ? 'emerald'
                    : estadisticas.porcentaje >= 60 ? 'amber'
                    : 'red'
                  }
                />
                <TarjetaStat
                  valor={
                    (estadisticas.diferencia >= 0 ? '+' : '') +
                    estadisticas.diferencia.toLocaleString('es-CO')
                  }
                  etiqueta={estadisticas.diferencia >= 0 ? 'Por encima' : 'Por debajo'}
                  color={estadisticas.diferencia >= 0 ? 'emerald' : 'red'}
                />
              </div>
            )}

            {/* Historial vacío */}
            {registros.length === 0 && (
              <div className="text-center py-20">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">No hay registros de asistencia aún.</p>
                <button
                  onClick={abrirCrear}
                  className="mt-4 text-sm text-gray-700 underline underline-offset-2 hover:text-gray-900"
                >
                  Registrar el primero
                </button>
              </div>
            )}

            {/* Historial de registros */}
            {registros.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                  Historial de registros
                </h2>
                <div className="space-y-3">
                  {registros.map((registro, indice) => (
                    <FilaRegistro
                      key={registro.id}
                      registro={registro}
                      esUltimo={indice === 0}
                      onEditar={() => abrirEditar(registro)}
                      onEliminar={() => confirmarEliminar(registro.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {mostrarFormulario && (
        <FormularioAsistencia
          registro={registroEditando}
          aforoEvento={evento?.aforo_estimado}
          onGuardar={guardar}
          onCerrar={cerrarFormulario}
        />
      )}
    </Layout>
  )
}

// Tarjeta de estadística en el resumen
function TarjetaStat({ valor, etiqueta, color }) {
  const colores = {
    gray:    'text-gray-900',
    emerald: 'text-emerald-700',
    amber:   'text-amber-700',
    red:     'text-red-600',
  }
  const fondos = {
    gray:    'bg-white border-gray-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    amber:   'bg-amber-50 border-amber-100',
    red:     'bg-red-50 border-red-100',
  }
  return (
    <div className={`rounded-2xl border p-4 ${fondos[color]}`}>
      <p className={`text-xl font-semibold ${colores[color]}`}>{valor}</p>
      <p className="text-xs text-gray-400 mt-0.5">{etiqueta}</p>
    </div>
  )
}

// Tarjeta de un registro en el historial
function FilaRegistro({ registro, esUltimo, onEditar, onEliminar }) {
  const porcentaje = Math.round((registro.asistencia_real / registro.aforo_estimado) * 100)
  const diferencia = registro.asistencia_real - registro.aforo_estimado

  // Fecha y hora formateadas
  const fechaHora = new Date(registro.registrado_en).toLocaleString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // Color de la barra de ocupación
  const colorBarra =
    porcentaje >= 90 ? 'bg-emerald-400'
    : porcentaje >= 60 ? 'bg-amber-400'
    : 'bg-red-400'

  return (
    <div className={`bg-white border rounded-2xl p-5 transition-shadow hover:shadow-sm ${esUltimo ? 'border-gray-200' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">

        {/* Información principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-gray-400">{fechaHora}</p>
            {esUltimo && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                Último
              </span>
            )}
          </div>

          {/* Cifras principales */}
          <div className="flex items-baseline gap-3 flex-wrap mb-3">
            <div>
              <span className="text-2xl font-semibold text-gray-900">
                {registro.asistencia_real.toLocaleString('es-CO')}
              </span>
              <span className="text-sm text-gray-400 ml-1">
                / {registro.aforo_estimado.toLocaleString('es-CO')} estimados
              </span>
            </div>
            <span className={`text-sm font-medium ${diferencia >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {diferencia >= 0 ? '+' : ''}{diferencia.toLocaleString('es-CO')} personas
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${colorBarra}`}
                style={{ width: `${Math.min(porcentaje, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 shrink-0">{porcentaje}%</span>
          </div>

          {/* Observaciones */}
          {registro.observaciones && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">{registro.observaciones}</p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEditar}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
          <button
            onClick={onEliminar}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
