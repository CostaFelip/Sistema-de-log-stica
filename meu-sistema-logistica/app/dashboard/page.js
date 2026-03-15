'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/auth'

export default function Dashboard() {
  const { usuario, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !usuario) {
      router.push('/')
    }
  }, [usuario, loading])

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Menu lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Dashboard</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="/recebimento" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
          <a href="/usuarios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Usuários e Permissões</a>
        </nav>

        {/* Usuário logado */}
        <div className="mt-auto border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-800">{usuario?.nome}</p>
          <p className="text-xs text-gray-400 mb-3">{usuario?.nivel}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-500 hover:text-red-600"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-400 mt-1">Bem-vindo, {usuario?.nome}!</p>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total de Produtos</p>
            <p className="text-2xl font-semibold text-gray-800">—</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Valor em Estoque</p>
            <p className="text-2xl font-semibold text-gray-800">—</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Pedidos Pendentes</p>
            <p className="text-2xl font-semibold text-gray-800">—</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Estoque Baixo</p>
            <p className="text-2xl font-semibold text-red-500">—</p>
          </div>
        </div>

        {/* Nível de acesso */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Seu Acesso</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Nível</p>
              <p className="text-gray-800 font-medium">{usuario?.nivel}</p>
            </div>
            <div>
              <p className="text-gray-400">Status</p>
              <p className="text-green-600 font-medium">{usuario?.status}</p>
            </div>
            <div>
              <p className="text-gray-400">Módulos</p>
              <p className="text-gray-800 font-medium">
                {usuario?.modulos?.includes('todos') ? 'Acesso total' : `${usuario?.modulos?.length} módulo(s)`}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}