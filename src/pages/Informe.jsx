// Módulo de informe consolidado PDF por evento
import { useParams, useNavigate } from 'react-router-dom'
import { useInforme } from '../hooks/useInforme'

// Etiquetas legibles para estado de ítems
const ESTADO_ITEM = { pendiente: 'Pendiente', parcial: 'Parcial', completo: 'Completo' }
const TIPO_EVENTO  = { corporativo: 'Corporativo', institucional: 'Institucional', comunitario: 'Comunitario', masivo: 'Masivo' }

export default function Informe() {
  const { eventoId } = useParams()
  const navegar = useNavigate()
  const {
    evento, inventario, asistencia,
    statsInventario, ultimaAsistencia, statsAsistencia, fechasEvidencias, evidencias,
    cargando, error,
  } = useInforme(eventoId)

  const fechaGeneracion = new Date().toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // Fecha simple o rango si hay fecha_fin
  const fechaEvento = evento
    ? evento.fecha_fin
      ? formatearRango(evento.fecha, evento.fecha_fin)
      : new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
    : ''

  function descargarPDF() {
    // El navegador usa document.title como nombre por defecto al guardar el PDF
    const nombreOriginal = document.title
    document.title = evento?.nombre ?? 'Informe'
    const restaurar = () => {
      document.title = nombreOriginal
      window.removeEventListener('afterprint', restaurar)
    }
    window.addEventListener('afterprint', restaurar)
    window.print()
  }

  return (
    <>
      {/* CSS de impresión — inyectado una sola vez */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 18mm 20mm; }
          body  { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .solo-print { display: block !important; }
          .informe-seccion { break-inside: avoid; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #e5e7eb; padding: 6px 10px; font-size: 11px; }
          th { background-color: #f9fafb !important; font-weight: 600; }
        }
        @media screen {
          .solo-print { display: none; }
        }
      `}</style>

      {/* ── BARRA DE CONTROLES (solo pantalla) ── */}
      <div className="no-print bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => navegar('/eventos')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver a eventos
          </button>

          {!cargando && !error && evento && (
            <button
              onClick={descargarPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Descargar PDF
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENEDOR DEL INFORME ── */}
      <div className="bg-gray-50 min-h-screen py-10 px-6 no-print-bg">
        <div className="max-w-4xl mx-auto">

          {/* Cargando */}
          {cargando && (
            <div className="flex items-center justify-center py-32">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && !cargando && (
            <p className="text-center text-sm text-red-500 py-20">{error}</p>
          )}

          {/* ── DOCUMENTO IMPRIMIBLE ── */}
          {!cargando && !error && evento && (
            <div
              id="informe"
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-10 space-y-8 text-gray-900"
            >

              {/* ── 1. ENCABEZADO ── */}
              <div className="informe-seccion flex items-start justify-between gap-4 flex-wrap border-b border-gray-100 pb-7">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Informe consolidado de evento
                  </p>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {evento.nombre}
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">{fechaEvento} · {evento.lugar}</p>
                </div>
                <div className="text-right shrink-0 ml-6">
                  <p className="text-sm font-semibold text-gray-900">TTS Group S.A.S.</p>
                  <p className="text-xs text-gray-400 mt-0.5">Cali, Colombia</p>
                  <p className="text-xs text-gray-300 mt-3">Generado el {fechaGeneracion}</p>
                </div>
              </div>

              {/* ── 2. DATOS GENERALES ── */}
              <div className="informe-seccion">
                <TituloSeccion numero="1" titulo="Datos generales del evento" />
                <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4 mt-4">
                  <Dato etiqueta="Nombre" valor={evento.nombre} />
                  <Dato etiqueta={evento.fecha_fin ? 'Fechas' : 'Fecha'} valor={fechaEvento} />
                  <Dato etiqueta="Lugar" valor={evento.lugar} />
                  <Dato etiqueta="Tipo" valor={TIPO_EVENTO[evento.tipo_evento] ?? evento.tipo_evento} />
                  <Dato etiqueta="Aforo estimado" valor={`${evento.aforo_estimado.toLocaleString('es-CO')} personas`} />
                  <Dato etiqueta="Estado" valor={evento.estado === 'activo' ? 'Activo' : 'Cerrado'} />
                  {evento.descripcion && (
                    <div className="sm:col-span-2">
                      <Dato etiqueta="Descripción" valor={evento.descripcion} />
                    </div>
                  )}
                </div>
              </div>

              {/* ── 3. INVENTARIO ── */}
              <div className="informe-seccion">
                <TituloSeccion numero="2" titulo="Inventario de recursos" />

                {inventario.length === 0 ? (
                  <p className="text-sm text-gray-400 mt-3">Sin ítems de inventario registrados.</p>
                ) : (
                  <>
                    {/* Resumen rápido */}
                    <div className="flex flex-wrap gap-3 mt-4 mb-5">
                      <Pildora valor={statsInventario.total}      etiqueta="ítems" />
                      <Pildora valor={statsInventario.completos}  etiqueta="completos"  color="emerald" />
                      <Pildora valor={statsInventario.parciales}  etiqueta="parciales"  color="amber" />
                      <Pildora valor={statsInventario.pendientes} etiqueta="pendientes" color="gray" />
                    </div>

                    {/* Tabla de ítems */}
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Ítem</th>
                            <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Solicitado</th>
                            <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Entregado</th>
                            <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {inventario.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{item.nombre_item}</p>
                                {item.notas && <p className="text-xs text-gray-400 mt-0.5">{item.notas}</p>}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600">
                                {item.cantidad_solicitada.toLocaleString('es-CO')}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-600">
                                {item.cantidad_entregada.toLocaleString('es-CO')}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <EstadoBadge estado={item.estado} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* ── 4. ASISTENCIA ── */}
              <div className="informe-seccion">
                <TituloSeccion numero="3" titulo="Control de asistencia" />

                {asistencia.length === 0 ? (
                  <p className="text-sm text-gray-400 mt-3">Sin registros de asistencia.</p>
                ) : (
                  <>
                    {/* Último registro destacado */}
                    {ultimaAsistencia && statsAsistencia && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <TarjetaStat valor={ultimaAsistencia.aforo_estimado.toLocaleString('es-CO')}  etiqueta="Aforo estimado" />
                        <TarjetaStat valor={ultimaAsistencia.asistencia_real.toLocaleString('es-CO')}  etiqueta="Asistencia real" />
                        <TarjetaStat
                          valor={`${statsAsistencia.porcentaje}%`}
                          etiqueta="Ocupación"
                          color={statsAsistencia.porcentaje >= 90 ? 'emerald' : statsAsistencia.porcentaje >= 60 ? 'amber' : 'red'}
                        />
                        <TarjetaStat
                          valor={(statsAsistencia.diferencia >= 0 ? '+' : '') + statsAsistencia.diferencia.toLocaleString('es-CO')}
                          etiqueta={statsAsistencia.diferencia >= 0 ? 'Por encima' : 'Por debajo'}
                          color={statsAsistencia.diferencia >= 0 ? 'emerald' : 'red'}
                        />
                      </div>
                    )}

                    {/* Historial completo si hay más de 1 registro */}
                    {asistencia.length > 1 && (
                      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Fecha de registro</th>
                              <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Estimado</th>
                              <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Real</th>
                              <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Ocupación</th>
                              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Observaciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {asistencia.map((reg, i) => {
                              const pct = Math.round((reg.asistencia_real / reg.aforo_estimado) * 100)
                              const fecha = new Date(reg.registrado_en).toLocaleString('es-CO', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })
                              return (
                                <tr key={reg.id}>
                                  <td className="px-4 py-3 text-gray-600">
                                    {fecha}
                                    {i === 0 && <span className="ml-2 text-xs text-gray-300">(último)</span>}
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-600">{reg.aforo_estimado.toLocaleString('es-CO')}</td>
                                  <td className="px-4 py-3 text-center text-gray-600">{reg.asistencia_real.toLocaleString('es-CO')}</td>
                                  <td className="px-4 py-3 text-center font-medium text-gray-700">{pct}%</td>
                                  <td className="px-4 py-3 text-gray-400 text-xs">{reg.observaciones ?? '—'}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── 5. EVIDENCIAS ── */}
              <div className="informe-seccion">
                <TituloSeccion numero="4" titulo="Evidencias fotográficas" />
                <div className="mt-4 flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-gray-900">{evidencias.length}</span>
                  <span className="text-sm text-gray-400">
                    {evidencias.length === 1 ? 'fotografía registrada' : 'fotografías registradas'}
                  </span>
                </div>
                {fechasEvidencias.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fechasEvidencias.map((fecha) => {
                      const count = evidencias.filter((e) => e.fecha_foto === fecha).length
                      const label = new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })
                      return (
                        <span key={fecha} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600">
                          {label}
                          <span className="font-semibold text-gray-400">· {count}</span>
                        </span>
                      )
                    })}
                  </div>
                )}
                {evidencias.length === 0 && (
                  <p className="text-sm text-gray-400 mt-1">Sin evidencias fotográficas registradas.</p>
                )}
              </div>

              {/* Pie del informe */}
              <div className="border-t border-gray-100 pt-6 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-gray-300">TTS Group S.A.S. — Cali, Colombia</p>
                <p className="text-xs text-gray-300">Generado el {fechaGeneracion}</p>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Helpers ──

// "27 mar – 29 mar 2026"
function formatearRango(inicio, fin) {
  const abrev = (d, conAno) =>
    new Date(d + 'T00:00:00')
      .toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        ...(conAno ? { year: 'numeric' } : {}),
      })
      .replace('.', '')
  return `${abrev(inicio, false)} – ${abrev(fin, true)}`
}

// ── Sub-componentes ──

function TituloSeccion({ numero, titulo }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-500 shrink-0">
        {numero}
      </span>
      <h2 className="text-sm font-semibold text-gray-900">{titulo}</h2>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{etiqueta}</p>
      <p className="text-sm font-medium text-gray-900">{valor}</p>
    </div>
  )
}

function Pildora({ valor, etiqueta, color = 'slate' }) {
  const colores = {
    slate:   'bg-gray-100 text-gray-600',
    gray:    'bg-gray-100 text-gray-500',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50 text-amber-700',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colores[color]}`}>
      <span className="font-bold">{valor}</span> {etiqueta}
    </span>
  )
}

function EstadoBadge({ estado }) {
  const cfg = {
    pendiente: 'bg-gray-100 text-gray-500',
    parcial:   'bg-amber-50 text-amber-700',
    completo:  'bg-emerald-50 text-emerald-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg[estado]}`}>
      {ESTADO_ITEM[estado]}
    </span>
  )
}

function TarjetaStat({ valor, etiqueta, color = 'gray' }) {
  const colores = {
    gray:    'text-gray-900 bg-white border-gray-100',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    amber:   'text-amber-700 bg-amber-50 border-amber-100',
    red:     'text-red-600 bg-red-50 border-red-100',
  }
  return (
    <div className={`rounded-xl border p-4 ${colores[color]}`}>
      <p className="text-xl font-bold">{valor}</p>
      <p className="text-xs text-gray-400 mt-0.5">{etiqueta}</p>
    </div>
  )
}
