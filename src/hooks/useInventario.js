// Hook para gestionar ítems de inventario de un evento desde Supabase
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Calcula el estado según las cantidades
function calcularEstado(solicitada, entregada) {
  if (entregada === 0) return 'pendiente'
  if (entregada >= solicitada) return 'completo'
  return 'parcial'
}

export function useInventario(eventoId) {
  const [items, setItems] = useState([])
  const [evento, setEvento] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarDatos = useCallback(async () => {
    if (!eventoId) return
    setCargando(true)
    setError(null)

    // Cargar evento e ítems en paralelo
    const [resEvento, resItems] = await Promise.all([
      supabase.from('eventos').select('id, nombre, fecha, lugar').eq('id', eventoId).single(),
      supabase.from('inventario').select('*').eq('evento_id', eventoId).order('created_at', { ascending: true }),
    ])

    if (resEvento.error) {
      setError('No se encontró el evento.')
    } else {
      setEvento(resEvento.data)
    }

    if (resItems.error) {
      setError('No se pudo cargar el inventario.')
    } else {
      setItems(resItems.data)
    }

    setCargando(false)
  }, [eventoId])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Agregar un ítem — el estado se calcula automáticamente desde las cantidades
  async function crearItem(campos) {
    const estado = calcularEstado(campos.cantidad_solicitada, campos.cantidad_entregada)
    const { data, error: err } = await supabase
      .from('inventario')
      .insert([{ ...campos, evento_id: eventoId, estado }])
      .select()
      .single()

    if (err) return { error: 'No se pudo agregar el ítem.' }
    setItems((prev) => [...prev, data])
    return { data }
  }

  // Actualizar un ítem existente — recalcula el estado
  async function actualizarItem(id, campos) {
    const estado = calcularEstado(campos.cantidad_solicitada, campos.cantidad_entregada)
    const { data, error: err } = await supabase
      .from('inventario')
      .update({ ...campos, estado })
      .eq('id', id)
      .select()
      .single()

    if (err) return { error: 'No se pudo actualizar el ítem.' }
    setItems((prev) => prev.map((i) => (i.id === id ? data : i)))
    return { data }
  }

  // Eliminar un ítem
  async function eliminarItem(id) {
    const { error: err } = await supabase.from('inventario').delete().eq('id', id)
    if (err) return { error: 'No se pudo eliminar el ítem.' }
    setItems((prev) => prev.filter((i) => i.id !== id))
    return {}
  }

  // Resumen de cantidades para el encabezado
  const resumen = {
    total: items.length,
    pendientes: items.filter((i) => i.estado === 'pendiente').length,
    parciales: items.filter((i) => i.estado === 'parcial').length,
    completos: items.filter((i) => i.estado === 'completo').length,
  }

  return { items, evento, cargando, error, resumen, crearItem, actualizarItem, eliminarItem }
}
