'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function PrimeiroAcesso() {
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/')
    })
  }, [])

  async function handleDefinirSenha() {
    if (!senha || !confirmar) return
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }

    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.updateUser({ password: senha })

    if (error) {
      setErro('Erro ao definir senha: ' + error.message)
      setLoading(false)
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('usuarios').update({ primeiro_acesso: false }).eq('auth_id', session.user.id)
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-2xl p-10 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Bem-vindo ao LogiSystem!</h1>
          <p className="text-sm text-gray-400">Este é seu primeiro acesso. Por segurança, defina uma nova senha para continuar.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Nova senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDefinirSenha()}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
            />
          </div>

          {erro && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{erro}</p>}

          <button
            onClick={handleDefinirSenha}
            disabled={loading}
            className="w-full bg-gray-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Definir senha e entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}