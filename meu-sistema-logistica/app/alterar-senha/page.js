'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

export default function AlterarSenha() {
  const { usuario, loading: authLoading, logout } = useAuth()
  async function handleLogout() {
    await logout()
    router.push('/')
  }
  const router = useRouter()
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !usuario) router.push('/')
  }, [usuario, authLoading])

  async function handleAlterarSenha() {
    if (!novaSenha || !confirmar) return
    if (novaSenha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem.'); return }

    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      setErro('Erro ao alterar senha: ' + error.message)
      setLoading(false)
      return
    }

    setSucesso(true)
    setLoading(false)
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmar('')

    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (authLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">Carregando...</p></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Dashboard</a>
          <a href="/compras" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Compras</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="/recebimento" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
          <a href="/pedidos" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Pedidos</a>
          <a href="/fornecedores" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Fornecedores</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
          <a href="/usuarios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Usuários e Permissões</a>
        </nav>
        <div className="mt-auto border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-800">{usuario?.nome}</p>
          <p className="text-xs text-gray-400 mb-1">{usuario?.nivel}</p>
          <a href="/alterar-senha" className="text-xs text-blue-600 hover:text-blue-700 block mb-3">Alterar senha</a>
          <button onClick={handleLogout} className="w-full text-left text-sm text-red-500 hover:text-red-600">Sair</button>
        </div>
      </aside>

      <main className="flex-1 p-8 flex items-start justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 w-full max-w-md mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Alterar Senha</h2>
          <p className="text-sm text-gray-400 mb-8">Defina uma nova senha para sua conta</p>

          {sucesso ? (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Senha alterada com sucesso!</p>
              <p className="text-xs text-green-500 mt-1">Redirecionando para o dashboard...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Nova senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
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
                  onKeyDown={(e) => e.key === 'Enter' && handleAlterarSenha()}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                />
              </div>

              {erro && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{erro}</p>}

              <button
                onClick={handleAlterarSenha}
                disabled={loading}
                className="w-full bg-gray-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Alterar senha'}
              </button>

              <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600 text-center">
                Cancelar
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}