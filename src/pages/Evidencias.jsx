// Módulo de evidencias fotográficas — galería por evento organizada por fecha
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useEvidencias } from '../hooks/useEvidencias'

// Tipos de imagen aceptados
const TIPOS_ACEPTADOS = 'image/jpeg,image/png,image/webp,image/heic,image/heif'
const MAX_ARCHIVOS = 30

export default function Evidencias() {
  const { eventoId } = useParams()
  const navegar = useNavigate()
  const { evidencias, grupos, evento, cargando, error, subirFotos, eliminarEvidencia } =
    useEvidencias(eventoId)

  // Estado del panel de subida
  const [mostrarSubida, setMostrarSubida] = useState(false)
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([])
  const [fechaFoto, setFechaFoto] = useState(hoy())
  const [descripcion, setDescripcion] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [progreso, setProgreso] = useState({ completados: 0, total: 0 })
  const [mensajeSubida, setMensajeSubida] = useState(null)
  const inputRef = useRef(null)

  // Estado del lightbox
  const [lightbox, setLightbox] = useState({ abierto: false, indice: 0 })

  // Navegación con teclado en el lightbox
  useEffect(() => {
    if (!lightbox.abierto) return

    function manejarTecla(e) {
      if (e.key === 'ArrowRight') avanzarLightbox(1)
      if (e.key === 'ArrowLeft')  avanzarLightbox(-1)
      if (e.key === 'Escape')     cerrarLightbox()
    }

    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [lightbox])

  function abrirLightbox(indice) {
    setLightbox({ abierto: true, indice })
  }

  function cerrarLightbox() {
    setLightbox({ abierto: false, indice: 0 })
  }

  function avanzarLightbox(direccion) {
    setLightbox((prev) => ({
      ...prev,
      indice: (prev.indice + direccion + evidencias.length) % evidencias.length,
    }))
  }

  function manejarSeleccion(e) {
    const archivos = Array.from(e.target.files).slice(0, MAX_ARCHIVOS)
    setArchivosSeleccionados(archivos)
    setMensajeSubida(null)
  }

  function cancelarSubida() {
    setMostrarSubida(false)
    setArchivosSeleccionados([])
    setDescripcion('')
    setFechaFoto(hoy())
    setMensajeSubida(null)
  }

  async function confirmarSubida() {
    if (archivosSeleccionados.length === 0) return
    setSubiendo(true)
    setProgreso({ completados: 0, total: archivosSeleccionados.length })

    const { subidas, errores } = await subirFotos(
      archivosSeleccionados,
      fechaFoto,
      descripcion,
      (completados, total) => setProgreso({ completados, total }),
    )

    setSubiendo(false)

    if (errores.length === 0) {
      setMensajeSubida({ tipo: 'ok', texto: `${subidas} foto${subidas !== 1 ? 's' : ''} subida${subidas !== 1 ? 's' : ''} correctamente.` })
    } else {
      setMensajeSubida({ tipo: 'error', texto: `${subidas} subidas, ${errores.length} con error.` })
    }

    setArchivosSeleccionados([])
    if (inputRef.current) inputRef.current.value = ''
  }

  async function confirmarEliminar(id, nombreArchivo) {
    if (!window.confirm('¿Eliminar esta foto? Esta acción no se puede deshacer.')) return
    // Si el lightbox está abierto, cerrarlo antes
    if (lightbox.abierto) cerrarLightbox()
    await eliminarEvidencia(id, nombreArchivo)
  }

  const fechaEvento = evento
    ? new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const fotoActual = lightbox.abierto ? evidencias[lightbox.indice] : null

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10">

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
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Evidencias fotográficas
                </p>
                <h1 className="text-xl font-semibold text-gray-900">{evento.nombre}</h1>
                <p className="text-sm text-gray-400 mt-1">
                  {fechaEvento} · {evento.lugar}
                  {evidencias.length > 0 && (
                    <span className="ml-2 text-gray-300">· {evidencias.length} {evidencias.length === 1 ? 'foto' : 'fotos'}</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => { setMostrarSubida(true); setMensajeSubida(null) }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Subir fotos
              </button>
            </div>

            {/* Panel de subida */}
            {mostrarSubida && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Subir fotos</h2>

                <div className="space-y-4">
                  {/* Selector de archivos */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Fotos (máx. {MAX_ARCHIVOS})
                    </label>
                    <input
                      ref={inputRef}
                      type="file"
                      multiple
                      accept={TIPOS_ACEPTADOS}
                      onChange={manejarSeleccion}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors cursor-pointer"
                      disabled={subiendo}
                    />
                    {archivosSeleccionados.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        {archivosSeleccionados.length} {archivosSeleccionados.length === 1 ? 'archivo seleccionado' : 'archivos seleccionados'}
                      </p>
                    )}
                  </div>

                  {/* Fecha y descripción */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Fecha de las fotos *
                      </label>
                      <input
                        type="date"
                        value={fechaFoto}
                        onChange={(e) => setFechaFoto(e.target.value)}
                        className={estiloInput}
                        disabled={subiendo}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Descripción (opcional)
                      </label>
                      <input
                        type="text"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Ej. Montaje inicial, registro general…"
                        className={estiloInput}
                        disabled={subiendo}
                      />
                    </div>
                  </div>

                  {/* Barra de progreso durante la subida */}
                  {subiendo && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Subiendo… {progreso.completados} de {progreso.total}</span>
                        <span>{Math.round((progreso.completados / progreso.total) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-700 rounded-full transition-all duration-300"
                          style={{ width: `${(progreso.completados / progreso.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Mensaje resultado */}
                  {mensajeSubida && (
                    <p className={`text-sm rounded-lg px-3.5 py-2.5 ${
                      mensajeSubida.tipo === 'ok'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {mensajeSubida.texto}
                    </p>
                  )}

                  {/* Botones del panel */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={cancelarSubida}
                      disabled={subiendo}
                      className="flex-1 py-2.5 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmarSubida}
                      disabled={subiendo || archivosSeleccionados.length === 0}
                      className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {subiendo ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Subiendo…
                        </>
                      ) : (
                        `Subir ${archivosSeleccionados.length > 0 ? archivosSeleccionados.length : ''} foto${archivosSeleccionados.length !== 1 ? 's' : ''}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Galería vacía */}
            {evidencias.length === 0 && (
              <div className="text-center py-20">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">No hay evidencias registradas aún.</p>
                <button
                  onClick={() => setMostrarSubida(true)}
                  className="mt-4 text-sm text-gray-700 underline underline-offset-2 hover:text-gray-900"
                >
                  Subir las primeras fotos
                </button>
              </div>
            )}

            {/* Galería agrupada por fecha */}
            {grupos.map(([fecha, fotos]) => (
              <GrupoFecha
                key={fecha}
                fecha={fecha}
                fotos={fotos}
                indiceBase={evidencias.indexOf(fotos[0])}
                onVerFoto={abrirLightbox}
                onEliminar={confirmarEliminar}
              />
            ))}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox.abierto && fotoActual && (
        <Lightbox
          foto={fotoActual}
          indice={lightbox.indice}
          total={evidencias.length}
          onCerrar={cerrarLightbox}
          onAnterior={() => avanzarLightbox(-1)}
          onSiguiente={() => avanzarLightbox(1)}
          onEliminar={() => confirmarEliminar(fotoActual.id, fotoActual.nombre_archivo)}
        />
      )}
    </Layout>
  )
}

// Grupo de fotos por fecha
function GrupoFecha({ fecha, fotos, indiceBase, onVerFoto, onEliminar }) {
  const fechaFormateada = new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="mb-10">
      {/* Encabezado de fecha */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-sm font-medium text-gray-700 capitalize">{fechaFormateada}</h2>
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-300">{fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'}</span>
      </div>

      {/* Cuadrícula de fotos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {fotos.map((foto, i) => (
          <TarjetaFoto
            key={foto.id}
            foto={foto}
            onClick={() => onVerFoto(indiceBase + i)}
            onEliminar={() => onEliminar(foto.id, foto.nombre_archivo)}
          />
        ))}
      </div>
    </div>
  )
}

// Miniatura de foto con hover
function TarjetaFoto({ foto, onClick, onEliminar }) {
  return (
    <div className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
      {/* Imagen */}
      <img
        src={foto.url}
        alt={foto.descripcion ?? 'Evidencia fotográfica'}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
        onClick={onClick}
        loading="lazy"
      />

      {/* Overlay al hacer hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors pointer-events-none" />

      {/* Botón eliminar — visible en hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onEliminar() }}
        className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
        title="Eliminar foto"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>

      {/* Descripción en la parte inferior si existe */}
      {foto.descripcion && (
        <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p className="text-white text-xs line-clamp-2">{foto.descripcion}</p>
        </div>
      )}
    </div>
  )
}

// Lightbox con navegación y teclado
function Lightbox({ foto, indice, total, onCerrar, onAnterior, onSiguiente, onEliminar }) {
  const fechaFormateada = new Date(foto.fecha_foto + 'T00:00:00').toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={onCerrar}
    >
      {/* Barra superior */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-white text-sm font-medium">{fechaFormateada}</p>
          {foto.descripcion && (
            <p className="text-white/60 text-xs mt-0.5">{foto.descripcion}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Contador */}
          <span className="text-white/40 text-xs">{indice + 1} / {total}</span>
          {/* Botón eliminar */}
          <button
            onClick={onEliminar}
            className="p-2 text-white/50 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
            title="Eliminar foto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
          {/* Cerrar */}
          <button
            onClick={onCerrar}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Cerrar (Esc)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Imagen central */}
      <div
        className="flex-1 flex items-center justify-center px-16 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={foto.url}
          alt={foto.descripcion ?? 'Evidencia'}
          className="max-w-full max-h-full object-contain rounded-lg select-none"
          draggable={false}
        />
      </div>

      {/* Flechas de navegación */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onAnterior() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Anterior (←)"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSiguiente() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Siguiente (→)"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

// Retorna la fecha de hoy en formato YYYY-MM-DD
function hoy() {
  return new Date().toISOString().split('T')[0]
}

const estiloInput =
  'w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-300 disabled:opacity-60'
