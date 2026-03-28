// Módulo de inventario por evento — lista, agregar, editar, eliminar ítems
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import FormularioItem from '../components/FormularioItem'
import { useInventario } from '../hooks/useInventario'

// Configuración visual por estado del ítem
const CONFIG_ESTADO = {
  pendiente: { etiqueta: 'Pendiente', clase: 'bg-gray-100 text-gray-500' },
  parcial:   { etiqueta: 'Parcial',   clase: 'bg-amber-50 text-amber-700' },
  completo:  { etiqueta: 'Completo',  clase: 'bg-emerald-50 text-emerald-700' },
}

export default function Inventario() {
  const { eventoId } = useParams()
  const navegar = useNavigate()
  const { items, evento, cargando, error, resumen, crearItem, actualizarItem, eliminarItem } =
    useInventario(eventoId)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [itemEditando, setItemEditando] = useState(null)

  function abrirCrear() {
    setItemEditando(null)
    setMostrarFormulario(true)
  }

  function abrirEditar(item) {
    setItemEditando(item)
    setMostrarFormulario(true)
  }

  function cerrarFormulario() {
    setMostrarFormulario(false)
    setItemEditando(null)
  }

  async function guardar(campos) {
    let resultado
    if (itemEditando) {
      resultado = await actualizarItem(itemEditando.id, campos)
    } else {
      resultado = await crearItem(campos)
    }
    if (!resultado.error) cerrarFormulario()
    return resultado
  }

  async function confirmarEliminar(id) {
    if (window.confirm('¿Eliminar este ítem? Esta acción no se puede deshacer.')) {
      await eliminarItem(id)
    }
  }

  // Fecha del evento formateada
  const fechaEvento = evento
    ? new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-10">

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

        {/* Estado de carga */}
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
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Inventario del evento
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
                  Agregar ítem
                </button>
              </div>

              {/* Píldoras de resumen */}
              {items.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Pildora valor={resumen.total} etiqueta="ítems totales" color="gray" />
                  <Pildora valor={resumen.completos} etiqueta="completos" color="emerald" />
                  <Pildora valor={resumen.parciales} etiqueta="parciales" color="amber" />
                  <Pildora valor={resumen.pendientes} etiqueta="pendientes" color="slate" />
                </div>
              )}
            </div>

            {/* Lista vacía */}
            {items.length === 0 && (
              <div className="text-center py-20">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">No hay ítems en el inventario aún.</p>
                <button
                  onClick={abrirCrear}
                  className="mt-4 text-sm text-gray-700 underline underline-offset-2 hover:text-gray-900"
                >
                  Agregar el primero
                </button>
              </div>
            )}

            {/* Tabla de ítems */}
            {items.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-400 px-5 py-3.5">Ítem</th>
                      <th className="text-center text-xs font-medium text-gray-400 px-4 py-3.5 hidden sm:table-cell">Solicitado</th>
                      <th className="text-center text-xs font-medium text-gray-400 px-4 py-3.5 hidden sm:table-cell">Entregado</th>
                      <th className="text-center text-xs font-medium text-gray-400 px-4 py-3.5">Estado</th>
                      <th className="px-4 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item) => (
                      <FilaItem
                        key={item.id}
                        item={item}
                        onEditar={() => abrirEditar(item)}
                        onEliminar={() => confirmarEliminar(item.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <FormularioItem
          item={itemEditando}
          onGuardar={guardar}
          onCerrar={cerrarFormulario}
        />
      )}
    </Layout>
  )
}

// Fila individual de la tabla
function FilaItem({ item, onEditar, onEliminar }) {
  const cfg = CONFIG_ESTADO[item.estado]
  const porcentaje = item.cantidad_solicitada > 0
    ? Math.round((item.cantidad_entregada / item.cantidad_solicitada) * 100)
    : 0

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      {/* Nombre + notas */}
      <td className="px-5 py-4">
        <p className="font-medium text-gray-900">{item.nombre_item}</p>
        {item.notas && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.notas}</p>
        )}
        {/* Barra de progreso (visible solo en móvil ya que las columnas se ocultan) */}
        <div className="mt-2 sm:hidden">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{item.cantidad_entregada} / {item.cantidad_solicitada}</span>
            <span>{porcentaje}%</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                item.estado === 'completo' ? 'bg-emerald-400' :
                item.estado === 'parcial'  ? 'bg-amber-400'   : 'bg-gray-200'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </td>

      {/* Cantidad solicitada */}
      <td className="px-4 py-4 text-center text-gray-600 hidden sm:table-cell">
        {item.cantidad_solicitada.toLocaleString('es-CO')}
      </td>

      {/* Cantidad entregada + barra */}
      <td className="px-4 py-4 hidden sm:table-cell">
        <div className="flex flex-col items-center gap-1">
          <span className="text-gray-600">{item.cantidad_entregada.toLocaleString('es-CO')}</span>
          <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                item.estado === 'completo' ? 'bg-emerald-400' :
                item.estado === 'parcial'  ? 'bg-amber-400'   : 'bg-gray-200'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </td>

      {/* Badge de estado */}
      <td className="px-4 py-4 text-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.clase}`}>
          {cfg.etiqueta}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
      </td>
    </tr>
  )
}

// Píldora de resumen
function Pildora({ valor, etiqueta, color }) {
  const colores = {
    gray:    'bg-gray-100 text-gray-600',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50 text-amber-700',
    slate:   'bg-slate-100 text-slate-500',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colores[color]}`}>
      <span className="font-semibold">{valor}</span> {etiqueta}
    </span>
  )
}
