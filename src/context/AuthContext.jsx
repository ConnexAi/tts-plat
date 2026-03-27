// Contexto global de autenticación con Supabase Auth
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Hook para consumir el contexto desde cualquier componente
export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial al montar el proveedor
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      setCargando(false)
    })

    // Escuchar cambios de sesión (login, logout, expiración)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      setSesion(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Iniciar sesión con correo y contraseña
  async function iniciarSesion(correo, contrasena) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    })
    return { data, error }
  }

  // Cerrar sesión
  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const valor = {
    sesion,
    usuario: sesion?.user ?? null,
    cargando,
    iniciarSesion,
    cerrarSesion,
  }

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}
