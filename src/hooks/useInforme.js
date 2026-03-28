// Hook para cargar todos los datos de un evento necesarios para el informe PDF
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useInforme(eventoId) {
  const [evento, setEvento] = useState(null)
  const [inventario, setInventario] = useState([])
  const [asistencia, setAsistencia] = useState([])
  const [evidencias, setEvidencias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarDatos = useCallback(async () => {
    if (!eventoId) return
    setCargando(true)
    setError(null)

    // Todas las consultas en paralelo
    const [resEvento, resInventario, resAsistencia, resEvidencias] = await Promise.all([
      supabase.from('eventos').select('*').eq('id', eventoId).single(),
      supabase.from('inventario').select('*').eq('evento_id', eventoId).order('created_at', { ascending: true }),
      supabase.from('asistencia').select('*').eq('evento_id', eventoId).order('registrado_en', { ascending: false }),
      supabase.from('evidencias').select('id, fecha_foto').eq('evento_id', eventoId),
    ])

    if (resEvento.error) { setError('No se encontró el evento.'); setCargando(false); return }

    setEvento(resEvento.data)
    setInventario(resInventario.data ?? [])
    setAsistencia(resAsistencia.data ?? [])
    setEvidencias(resEvidencias.data ?? [])
    setCargando(false)
  }, [eventoId])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // Estadísticas derivadas de inventario
  const statsInventario = {
    total:      inventario.length,
    completos:  inventario.filter((i) => i.estado === 'completo').length,
    parciales:  inventario.filter((i) => i.estado === 'parcial').length,
    pendientes: inventario.filter((i) => i.estado === 'pendiente').length,
  }

  // Estadísticas del registro de asistencia más reciente
  const ultimaAsistencia = asistencia[0] ?? null
  const statsAsistencia = ultimaAsistencia
    ? {
        porcentaje: Math.round((ultimaAsistencia.asistencia_real / ultimaAsistencia.aforo_estimado) * 100),
        diferencia: ultimaAsistencia.asistencia_real - ultimaAsistencia.aforo_estimado,
      }
    : null

  // Fechas únicas con evidencias
  const fechasEvidencias = [...new Set(evidencias.map((e) => e.fecha_foto))].sort((a, b) => b.localeCompare(a))

  return {
    evento,
    inventario,
    asistencia,
    evidencias,
    statsInventario,
    ultimaAsistencia,
    statsAsistencia,
    fechasEvidencias,
    cargando,
    error,
  }
}
