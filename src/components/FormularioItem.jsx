// Modal para agregar o editar un ítem de inventario
import { useEffect, useState } from 'react'

const CAMPOS_VACIOS = {
  nombre_item: '',
  cantidad_solicitada: '',
  cantidad_entregada: '',
  notas: '',
}

export default function FormularioItem({ item, onGuardar, onCerrar }) {
  const [campos, setCampos] = useState(CAMPOS_VACIOS)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Prellenar al editar
  useEffect(() => {
    if (item) {
      setCampos({
        nombre_item: item.nombre_item,
        cantidad_solicitada: String(item.cantidad_solicitada),
        cantidad_entregada: String(item.cantidad_entregada),
        notas: item.notas ?? '',
      })
    }
  }, [item])

  function actualizar(campo, valor) {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')

    const { nombre_item, cantidad_solicitada, cantidad_entregada } = campos

    if (!nombre_item.trim()) {
      setError('El nombre del ítem es obligatorio.')
      return
    }

    const solicitada = parseInt(cantidad_solicitada, 10)
    if (!solicitada || solicitada <= 0) {
      setError('La cantidad solicitada debe ser mayor a 0.')
      return
    }

    const entregada = parseInt(cantidad_entregada, 10)
    if (isNaN(entregada) || entregada < 0) {
      setError('La cantidad entregada debe ser 0 o más.')
      return
    }

    if (entregada > solicitada) {
      setError('La cantidad entregada no puede superar la solicitada.')
      return
    }

    setGuardando(true)
    const resultado = await onGuardar({
      nombre_item: nombre_item.trim(),
      cantidad_solicitada: solicitada,
      cantidad_entregada: entregada,
      notas: campos.notas.trim() || null,
    })
    setGuardando(false)

    if (resultado?.error) {
      setError(resultado.error)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7 relative">

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-900">
            {item ? 'Editar ítem' : 'Nuevo ítem'}
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

          {/* Nombre del ítem */}
          <Campo label="Nombre del ítem *">
            <input
              type="text"
              value={campos.nombre_item}
              onChange={(e) => actualizar('nombre_item', e.target.value)}
              placeholder="Ej. Sillas plegables"
              className={estiloInput}
              disabled={guardando}
              autoFocus
            />
          </Campo>

          {/* Cantidades — fila */}
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Cantidad solicitada *">
              <input
                type="number"
                value={campos.cantidad_solicitada}
                onChange={(e) => actualizar('cantidad_solicitada', e.target.value)}
                placeholder="100"
                min="1"
                className={estiloInput}
                disabled={guardando}
              />
            </Campo>
            <Campo label="Cantidad entregada *">
              <input
                type="number"
                value={campos.cantidad_entregada}
                onChange={(e) => actualizar('cantidad_entregada', e.target.value)}
                placeholder="0"
                min="0"
                className={estiloInput}
                disabled={guardando}
              />
            </Campo>
          </div>

          {/* Notas */}
          <Campo label="Notas">
            <textarea
              value={campos.notas}
              onChange={(e) => actualizar('notas', e.target.value)}
              placeholder="Observaciones adicionales…"
              rows={2}
              className={`${estiloInput} resize-none`}
              disabled={guardando}
            />
          </Campo>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
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
                item ? 'Guardar cambios' : 'Agregar ítem'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

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
