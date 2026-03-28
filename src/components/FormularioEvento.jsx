// Modal para crear o editar un evento
import { useEffect, useState } from 'react'

// Tipos de evento generales
const TIPOS_EVENTO = ['corporativo', 'institucional', 'comunitario', 'masivo']

const CAMPOS_VACIOS = {
  nombre: '',
  fecha: '',
  lugar: '',
  tipo_evento: '',
  descripcion: '',
  aforo_estimado: '',
  estado: 'activo',
}

export default function FormularioEvento({ evento, onGuardar, onCerrar }) {
  const [campos, setCampos] = useState(CAMPOS_VACIOS)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Prellenar el formulario al editar
  useEffect(() => {
    if (evento) {
      setCampos({
        nombre: evento.nombre,
        fecha: evento.fecha,
        lugar: evento.lugar,
        tipo_evento: evento.tipo_evento,
        descripcion: evento.descripcion ?? '',
        aforo_estimado: String(evento.aforo_estimado),
        estado: evento.estado,
      })
    }
  }, [evento])

  function actualizar(campo, valor) {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
  }

  // Validar y enviar al padre
  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')

    const { nombre, fecha, lugar, tipo_evento, aforo_estimado } = campos

    if (!nombre.trim() || !fecha || !lugar.trim() || !tipo_evento) {
      setError('Completa todos los campos obligatorios.')
      return
    }

    const aforo = parseInt(aforo_estimado, 10)
    if (!aforo || aforo <= 0) {
      setError('El aforo estimado debe ser un número mayor a 0.')
      return
    }

    setGuardando(true)
    const resultado = await onGuardar({
      nombre: nombre.trim(),
      fecha,
      lugar: lugar.trim(),
      tipo_evento,
      descripcion: campos.descripcion.trim() || null,
      aforo_estimado: aforo,
      estado: campos.estado,
    })
    setGuardando(false)

    if (resultado?.error) {
      setError(resultado.error)
    }
  }

  return (
    // Fondo oscuro del modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-7 relative max-h-[90vh] overflow-y-auto">

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-900">
            {evento ? 'Editar evento' : 'Nuevo evento'}
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-300 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={manejarEnvio} noValidate className="space-y-4">

          {/* Nombre */}
          <Campo label="Nombre del evento *">
            <input
              type="text"
              value={campos.nombre}
              onChange={(e) => actualizar('nombre', e.target.value)}
              placeholder="Ej. Feria empresarial norte"
              className={estiloInput}
              disabled={guardando}
            />
          </Campo>

          {/* Fecha y aforo — fila */}
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Fecha *">
              <input
                type="date"
                value={campos.fecha}
                onChange={(e) => actualizar('fecha', e.target.value)}
                className={estiloInput}
                disabled={guardando}
              />
            </Campo>
            <Campo label="Aforo estimado *">
              <input
                type="number"
                value={campos.aforo_estimado}
                onChange={(e) => actualizar('aforo_estimado', e.target.value)}
                placeholder="500"
                min="1"
                className={estiloInput}
                disabled={guardando}
              />
            </Campo>
          </div>

          {/* Lugar */}
          <Campo label="Lugar *">
            <input
              type="text"
              value={campos.lugar}
              onChange={(e) => actualizar('lugar', e.target.value)}
              placeholder="Ej. Centro de Convenciones, Cali"
              className={estiloInput}
              disabled={guardando}
            />
          </Campo>

          {/* Tipo de evento */}
          <Campo label="Tipo de evento *">
            <select
              value={campos.tipo_evento}
              onChange={(e) => actualizar('tipo_evento', e.target.value)}
              className={estiloInput}
              disabled={guardando}
            >
              <option value="">Selecciona un tipo…</option>
              {TIPOS_EVENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </option>
              ))}
            </select>
          </Campo>

          {/* Descripción */}
          <Campo label="Descripción">
            <textarea
              value={campos.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
              placeholder="Detalles adicionales sobre el evento…"
              rows={3}
              className={`${estiloInput} resize-none`}
              disabled={guardando}
            />
          </Campo>

          {/* Estado — solo visible al editar */}
          {evento && (
            <Campo label="Estado">
              <select
                value={campos.estado}
                onChange={(e) => actualizar('estado', e.target.value)}
                className={estiloInput}
                disabled={guardando}
              >
                <option value="activo">Activo</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </Campo>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="flex-1 py-2.5 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando…
                </>
              ) : (
                evento ? 'Guardar cambios' : 'Crear evento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Sub-componente de campo con etiqueta
function Campo({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const estiloInput =
  'w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-300 disabled:opacity-60'
