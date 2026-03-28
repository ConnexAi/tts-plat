// Modal para registrar o editar asistencia de un evento
import { useEffect, useState } from 'react'

export default function FormularioAsistencia({ registro, aforoEvento, onGuardar, onCerrar }) {
  const [campos, setCampos] = useState({
    aforo_estimado: '',
    asistencia_real: '',
    observaciones: '',
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Prellenar al editar; al crear, sugerir el aforo del evento
  useEffect(() => {
    if (registro) {
      setCampos({
        aforo_estimado: String(registro.aforo_estimado),
        asistencia_real: String(registro.asistencia_real),
        observaciones: registro.observaciones ?? '',
      })
    } else if (aforoEvento) {
      setCampos((prev) => ({ ...prev, aforo_estimado: String(aforoEvento) }))
    }
  }, [registro, aforoEvento])

  function actualizar(campo, valor) {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
  }

  // Calcular diferencia en tiempo real para mostrar preview
  const aforoNum = parseInt(campos.aforo_estimado, 10)
  const realNum = parseInt(campos.asistencia_real, 10)
  const hayPreview = !isNaN(aforoNum) && !isNaN(realNum) && aforoNum > 0 && realNum >= 0
  const porcentajePreview = hayPreview ? Math.round((realNum / aforoNum) * 100) : null
  const diferenciaPreview = hayPreview ? realNum - aforoNum : null

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')

    const aforo = parseInt(campos.aforo_estimado, 10)
    const real = parseInt(campos.asistencia_real, 10)

    if (!aforo || aforo <= 0) {
      setError('El aforo estimado debe ser mayor a 0.')
      return
    }
    if (isNaN(real) || real < 0) {
      setError('La asistencia real debe ser 0 o más.')
      return
    }

    setGuardando(true)
    const resultado = await onGuardar({
      aforo_estimado: aforo,
      asistencia_real: real,
      observaciones: campos.observaciones.trim() || null,
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
            {registro ? 'Editar registro' : 'Registrar asistencia'}
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

          {/* Cantidades */}
          <div className="grid grid-cols-2 gap-3">
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
            <Campo label="Asistencia real *">
              <input
                type="number"
                value={campos.asistencia_real}
                onChange={(e) => actualizar('asistencia_real', e.target.value)}
                placeholder="0"
                min="0"
                className={estiloInput}
                disabled={guardando}
                autoFocus
              />
            </Campo>
          </div>

          {/* Preview de estadísticas en tiempo real */}
          {hayPreview && (
            <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3">
              <Stat
                valor={`${porcentajePreview}%`}
                etiqueta="Ocupación"
                color={porcentajePreview >= 90 ? 'emerald' : porcentajePreview >= 60 ? 'amber' : 'gray'}
              />
              <Stat
                valor={Math.abs(diferenciaPreview).toLocaleString('es-CO')}
                etiqueta={diferenciaPreview >= 0 ? 'Por encima' : 'Por debajo'}
                color={diferenciaPreview >= 0 ? 'emerald' : 'red'}
              />
              <Stat
                valor={realNum.toLocaleString('es-CO')}
                etiqueta="Asistentes"
                color="gray"
              />
            </div>
          )}

          {/* Observaciones */}
          <Campo label="Observaciones">
            <textarea
              value={campos.observaciones}
              onChange={(e) => actualizar('observaciones', e.target.value)}
              placeholder="Notas sobre la asistencia registrada…"
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
                registro ? 'Guardar cambios' : 'Registrar'
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

// Mini estadística dentro del preview
function Stat({ valor, etiqueta, color }) {
  const colores = {
    emerald: 'text-emerald-700',
    amber:   'text-amber-700',
    red:     'text-red-600',
    gray:    'text-gray-700',
  }
  return (
    <div className="text-center">
      <p className={`text-base font-semibold ${colores[color]}`}>{valor}</p>
      <p className="text-xs text-gray-400 mt-0.5">{etiqueta}</p>
    </div>
  )
}

const estiloInput =
  'w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-300 disabled:opacity-60'
