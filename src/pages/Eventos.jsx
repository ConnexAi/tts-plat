// Módulo de gestión de eventos — lista, crear, editar, cambiar estado
import { useState } from 'react'
import Layout from '../components/Layout'
import FormularioEvento from '../components/FormularioEvento'
import { useEventos } from '../hooks/useEventos'

export default function Eventos() {
  const { eventos, cargando, error, crearEvento, actualizarEvento, cambiarEstado, eliminarEvento } =
    useEventos()

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [eventoEditando, setEventoEditando] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(null) // id del evento en transición

  // Abrir formulario vacío para crear
  function abrirCrear() {
    setEventoEditando(null)
    setMostrarFormulario(true)
  }

  // Abrir formulario con datos del evento a editar
  function abrirEditar(evento) {
    setEventoEditando(evento)
    setMostrarFormulario(true)
  }

  function cerrarFormulario() {
    setMostrarFormulario(false)
    setEventoEditando(null)
  }

  // Guardar — distingue entre crear o editar según si hay eventoEditando
  async function guardar(campos) {
    let resultado
    if (eventoEditando) {
      resultado = await actualizarEvento(eventoEditando.id, campos)
    } else {
      resultado = await crearEvento(campos)
    }
    if (!resultado.error) cerrarFormulario()
    return resultado
  }

  // Alternar estado activo ↔ cerrado
  async function toggleEstado(evento) {
    setCambiandoEstado(evento.id)
    await cambiarEstado(evento.id, evento.estado)
    setCambiandoEstado(null)
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Encabezado de la sección */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Eventos</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {eventos.length} {eventos.length === 1 ? 'evento registrado' : 'eventos registrados'}
            </p>
          </div>
          <button
            onClick={abrirCrear}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo evento
          </button>
        </div>

        {/* Estado de carga */}
        {cargando && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
          </div>
        )}

        {/* Error de carga */}
        {error && !cargando && (
          <div className="text-center py-16">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Lista vacía */}
        {!cargando && !error && eventos.length === 0 && (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">No hay eventos registrados aún.</p>
            <button
              onClick={abrirCrear}
              className="mt-4 text-sm text-gray-700 underline underline-offset-2 hover:text-gray-900"
            >
              Crear el primero
            </button>
          </div>
        )}

        {/* Cuadrícula de tarjetas */}
        {!cargando && !error && eventos.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento) => (
              <TarjetaEvento
                key={evento.id}
                evento={evento}
                cambiandoEstado={cambiandoEstado === evento.id}
                onEditar={() => abrirEditar(evento)}
                onToggleEstado={() => toggleEstado(evento)}
                onEliminar={() => eliminarEvento(evento.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <FormularioEvento
          evento={eventoEditando}
          onGuardar={guardar}
          onCerrar={cerrarFormulario}
        />
      )}
    </Layout>
  )
}

// Tarjeta individual de evento
function TarjetaEvento({ evento, cambiandoEstado, onEditar, onToggleEstado, onEliminar }) {
  const esActivo = evento.estado === 'activo'

  // Formatear fecha en español
  const fechaFormateada = new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">

      {/* Cabecera de la tarjeta */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {evento.nombre}
        </h3>
        {/* Badge de estado */}
        <span
          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            esActivo
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {esActivo ? 'Activo' : 'Cerrado'}
        </span>
      </div>

      {/* Detalles del evento */}
      <div className="space-y-1.5">
        <Detalle icono="calendario" texto={fechaFormateada} />
        <Detalle icono="lugar" texto={evento.lugar} />
        <Detalle icono="tipo" texto={evento.tipo_evento.charAt(0).toUpperCase() + evento.tipo_evento.slice(1)} />
        <Detalle icono="personas" texto={`${evento.aforo_estimado.toLocaleString('es-CO')} personas estimadas`} />
        {evento.descripcion && (
          <Detalle icono="descripcion" texto={evento.descripcion} />
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-1 border-t border-gray-50">
        {/* Cambiar estado */}
        <button
          onClick={onToggleEstado}
          disabled={cambiandoEstado}
          className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          {cambiandoEstado
            ? '…'
            : esActivo
            ? 'Cerrar evento'
            : 'Reactivar'}
        </button>
        {/* Editar */}
        <button
          onClick={onEditar}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Editar
        </button>
        {/* Eliminar */}
        <button
          onClick={() => {
            if (window.confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) {
              onEliminar()
            }
          }}
          className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Fila de detalle con ícono
function Detalle({ icono, texto }) {
  const iconos = {
    calendario: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
    ),
    lugar: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    ),
    tipo: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z" />
    ),
    personas: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    ),
    descripcion: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    ),
  }

  return (
    <div className="flex items-start gap-2">
      <svg className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        {iconos[icono]}
      </svg>
      <span className="text-xs text-gray-500 leading-snug">{texto}</span>
    </div>
  )
}
