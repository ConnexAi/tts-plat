// Hook para gestionar evidencias fotográficas de un evento
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = 'evidencias'

export function useEvidencias(eventoId) {
  const [evidencias, setEvidencias] = useState([])
  const [evento, setEvento] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarDatos = useCallback(async () => {
    if (!eventoId) return
    setCargando(true)
    setError(null)

    const [resEvento, resEvidencias] = await Promise.all([
      supabase
        .from('eventos')
        .select('id, nombre, fecha, lugar')
        .eq('id', eventoId)
        .single(),
      supabase
        .from('evidencias')
        .select('*')
        .eq('evento_id', eventoId)
        .order('fecha_foto', { ascending: false })
        .order('created_at', { ascending: false }),
    ])

    if (resEvento.error) {
      setError('No se encontró el evento.')
    } else {
      setEvento(resEvento.data)
    }

    if (resEvidencias.error) {
      setError('No se pudieron cargar las evidencias.')
    } else {
      setEvidencias(resEvidencias.data)
    }

    setCargando(false)
  }, [eventoId])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Subir múltiples fotos — devuelve progreso vía callback
  async function subirFotos(archivos, fechaFoto, descripcion, onProgreso) {
    const errores = []
    const nuevas = []

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i]

      // Ruta única por evento para evitar mezcla entre eventos
      const extension = archivo.name.split('.').pop().toLowerCase()
      const rutaStorage = `${eventoId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

      // Subir al bucket
      const { error: errSubida } = await supabase.storage
        .from(BUCKET)
        .upload(rutaStorage, archivo, { contentType: archivo.type })

      if (errSubida) {
        errores.push(archivo.name)
        onProgreso?.(i + 1, archivos.length)
        continue
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(rutaStorage)

      // Registrar metadatos en la tabla
      const { data, error: errDB } = await supabase
        .from('evidencias')
        .insert([{
          evento_id: eventoId,
          url: urlData.publicUrl,
          nombre_archivo: rutaStorage,
          fecha_foto: fechaFoto,
          descripcion: descripcion?.trim() || null,
        }])
        .select()
        .single()

      if (errDB) {
        errores.push(archivo.name)
      } else {
        nuevas.push(data)
      }

      onProgreso?.(i + 1, archivos.length)
    }

    // Agregar las fotos nuevas al inicio del estado (más recientes primero)
    if (nuevas.length > 0) {
      setEvidencias((prev) => [...nuevas, ...prev])
    }

    return { subidas: nuevas.length, errores }
  }

  // Eliminar una foto del storage y de la tabla
  async function eliminarEvidencia(id, nombreArchivo) {
    const { error: errStorage } = await supabase.storage
      .from(BUCKET)
      .remove([nombreArchivo])

    if (errStorage) return { error: 'No se pudo eliminar el archivo del storage.' }

    const { error: errDB } = await supabase.from('evidencias').delete().eq('id', id)
    if (errDB) return { error: 'Archivo eliminado del storage pero no de la base de datos.' }

    setEvidencias((prev) => prev.filter((e) => e.id !== id))
    return {}
  }

  // Agrupar evidencias por fecha_foto para la galería
  const porFecha = evidencias.reduce((acc, foto) => {
    if (!acc[foto.fecha_foto]) acc[foto.fecha_foto] = []
    acc[foto.fecha_foto].push(foto)
    return acc
  }, {})

  const grupos = Object.entries(porFecha).sort(([a], [b]) => b.localeCompare(a))

  return {
    evidencias,
    grupos,
    evento,
    cargando,
    error,
    subirFotos,
    eliminarEvidencia,
  }
}
