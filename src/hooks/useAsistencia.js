// Hook para gestionar registros de asistencia de un evento desde Supabase
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAsistencia(eventoId) {
  const [registros, setRegistros] = useState([])
  const [evento, setEvento] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarDatos = useCallback(async () => {
    if (!eventoId) return
    setCargando(true)
    setError(null)

    // Cargar evento y registros en paralelo
    const [resEvento, resRegistros] = await Promise.all([
      supabase
        .from('eventos')
        .select('id, nombre, fecha, lugar, aforo_estimado')
        .eq('id', eventoId)
        .single(),
      supabase
        .from('asistencia')
        .select('*')
        .eq('evento_id', eventoId)
        .order('registrado_en', { ascending: false }),
    ])

    if (resEvento.error) {
      setError('No se encontró el evento.')
    } else {
      setEvento(resEvento.data)
    }

    if (resRegistros.error) {
      setError('No se pudieron cargar los registros.')
    } else {
      setRegistros(resRegistros.data)
    }

    setCargando(false)
  }, [eventoId])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Agregar un nuevo registro de asistencia
  async function crearRegistro(campos) {
    const { data, error: err } = await supabase
      .from('asistencia')
      .insert([{ ...campos, evento_id: eventoId }])
      .select()
      .single()

    if (err) return { error: 'No se pudo guardar el registro.' }
    // Insertar al inicio ya que están ordenados por fecha desc
    setRegistros((prev) => [data, ...prev])
    return { data }
  }

  // Actualizar un registro existente
  async function actualizarRegistro(id, campos) {
    const { data, error: err } = await supabase
      .from('asistencia')
      .update(campos)
      .eq('id', id)
      .select()
      .single()

    if (err) return { error: 'No se pudo actualizar el registro.' }
    setRegistros((prev) => prev.map((r) => (r.id === id ? data : r)))
    return { data }
  }

  // Eliminar un registro
  async function eliminarRegistro(id) {
    const { error: err } = await supabase.from('asistencia').delete().eq('id', id)
    if (err) return { error: 'No se pudo eliminar el registro.' }
    setRegistros((prev) => prev.filter((r) => r.id !== id))
    return {}
  }

  // Estadísticas del registro más reciente
  const ultimoRegistro = registros[0] ?? null
  const estadisticas = ultimoRegistro
    ? {
        porcentaje: Math.round((ultimoRegistro.asistencia_real / ultimoRegistro.aforo_estimado) * 100),
        diferencia: ultimoRegistro.asistencia_real - ultimoRegistro.aforo_estimado,
      }
    : null

  return {
    registros,
    evento,
    cargando,
    error,
    ultimoRegistro,
    estadisticas,
    crearRegistro,
    actualizarRegistro,
    eliminarRegistro,
  }
}
