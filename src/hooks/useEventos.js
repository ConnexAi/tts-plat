// Hook para gestionar eventos desde Supabase
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEventos() {
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Cargar todos los eventos ordenados por fecha descendente
  const cargarEventos = useCallback(async () => {
    setCargando(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: false })

    if (err) {
      setError('No se pudieron cargar los eventos.')
    } else {
      setEventos(data)
    }
    setCargando(false)
  }, [])

  useEffect(() => {
    cargarEventos()
  }, [cargarEventos])

  // Crear un evento nuevo — valida campos requeridos antes de guardar
  async function crearEvento(campos) {
    const { data, error: err } = await supabase
      .from('eventos')
      .insert([campos])
      .select()
      .single()

    if (err) return { error: 'No se pudo crear el evento.' }
    setEventos((prev) => [data, ...prev])
    return { data }
  }

  // Actualizar datos de un evento existente
  async function actualizarEvento(id, campos) {
    const { data, error: err } = await supabase
      .from('eventos')
      .update(campos)
      .eq('id', id)
      .select()
      .single()

    if (err) return { error: 'No se pudo actualizar el evento.' }
    setEventos((prev) => prev.map((e) => (e.id === id ? data : e)))
    return { data }
  }

  // Alternar estado entre 'activo' y 'cerrado'
  async function cambiarEstado(id, estadoActual) {
    const nuevoEstado = estadoActual === 'activo' ? 'cerrado' : 'activo'
    return actualizarEvento(id, { estado: nuevoEstado })
  }

  // Eliminar un evento por id
  async function eliminarEvento(id) {
    const { error: err } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id)

    if (err) return { error: 'No se pudo eliminar el evento.' }
    setEventos((prev) => prev.filter((e) => e.id !== id))
    return {}
  }

  return {
    eventos,
    cargando,
    error,
    cargarEventos,
    crearEvento,
    actualizarEvento,
    cambiarEstado,
    eliminarEvento,
  }
}
