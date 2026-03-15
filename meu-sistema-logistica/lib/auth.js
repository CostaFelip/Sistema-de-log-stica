import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useAuth() {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        carregarUsuario(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        carregarUsuario(session.user.id)
      } else {
        setUsuario(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function carregarUsuario(authId) {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', authId)
      .single()
    setUsuario(data)
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return { usuario, loading, logout }
}