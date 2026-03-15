'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const niveisGerentes = ['Administrador', 'Suporte', 'Gerente Geral', 'Gerente de Estoque', 'Gerente Financeiro', 'Gerente de Setor']

export default function Dashboard() {
  const { usuario, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [dados, setDados] = useState({
    totalProdutos: 0,
    valorEstoque: 0,
    estoquesBaixos: 0,
    ordensPendentes: 0,
    transferenciasAndamento: 0,
    ticketsAbertos: 0,
    pedidosPendentes: 0,
    duplicatasPendentes: 0,
    valorDuplicatas: 0,
  })
  const [movimentacoes, setMovimentacoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !usuario) router.push('/')
    if (!authLoading && usuario) carregarDados()
  }, [usuario, authLoading])

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  async function carregarDados() {
    setLoading(true)
    const isGerente = niveisGerentes.includes(usuario?.nivel)

    let prodQuery = supabase.from('produtos').select('quantidade, valor, setor_id')
    let ordQuery = supabase.from('ordens').select('id, produto, produto_codigo, solicitante, status, created_at, setores(nome)').eq('status', 'Pendente').order('created_at', { ascending: false }).limit(5)
    let transQuery = supabase.from('transferencias').select('id').or('status.eq.Pendente,status.eq.Em Trânsito')
    let tickQuery = supabase.from('tickets').select('id').eq('status', 'Aberto')
    let pedQuery = supabase.from('pedidos_clientes').select('id').eq('status', 'Pendente')
    let dupQuery = supabase.from('duplicatas').select('valor_total').eq('status', 'Pendente')

    if (!isGerente && usuario?.setor_id) {
      prodQuery = prodQuery.eq('setor_id', usuario.setor_id)
      ordQuery = ordQuery.eq('setor_id', usuario.setor_id)
    }

    const [
      { data: prods },
      { data: ords },
      { data: trans },
      { data: tick },
      { data: peds },
      { data: dups },
    ] = await Promise.all([prodQuery, ordQuery, transQuery, tickQuery, pedQuery, dupQuery])

    const totalProdutos = prods?.length || 0
    const valorEstoque = prods?.reduce((acc, p) => acc + (p.quantidade * p.valor), 0) || 0
    const estoquesBaixos = prods?.filter(p => p.quantidade <= 10).length || 0
    const valorDuplicatas = dups?.reduce((acc, d) => acc + Number(d.valor_total), 0) || 0

    setDados({
      totalProdutos,
      valorEstoque,
      estoquesBaixos,
      ordensPendentes: ords?.length || 0,
      transferenciasAndamento: trans?.length || 0,
      ticketsAbertos: tick?.length || 0,
      pedidosPendentes: peds?.length || 0,
      duplicatasPendentes: dups?.length || 0,
      valorDuplicatas,
    })
    setMovimentacoes(ords || [])
    setLoading(false)
  }

  const isGerente = niveisGerentes.includes(usuario?.nivel)

  if (authLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">Carregando...</p></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Dashboard</a>
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
          {!isGerente && <p className="text-xs text-blue-600 mb-3">Visualizando seu setor</p>}
          <button onClick={handleLogout} className="w-full text-left text-sm text-red-500 hover:text-red-600">Sair</button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">Bem-vindo, {usuario?.nome}!</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Carregando dados...</p></div>
        ) : (
          <>
            {/* Cards principais */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <a href="/estoque" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <p className="text-sm text-gray-500 mb-1">Total de Produtos</p>
                <p className="text-2xl font-semibold text-gray-800">{dados.totalProdutos}</p>
                <p className="text-xs text-gray-400 mt-1">no estoque</p>
              </a>
              <a href="/estoque" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <p className="text-sm text-gray-500 mb-1">Valor em Estoque</p>
                <p className="text-2xl font-semibold text-gray-800">R$ {dados.valorEstoque.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">valor total</p>
              </a>
              <a href="/estoque" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <p className="text-sm text-gray-500 mb-1">Estoque Baixo</p>
                <p className="text-2xl font-semibold text-red-500">{dados.estoquesBaixos}</p>
                <p className="text-xs text-gray-400 mt-1">produtos abaixo de 10</p>
              </a>
              <a href="/ordens" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <p className="text-sm text-gray-500 mb-1">Ordens Pendentes</p>
                <p className="text-2xl font-semibold text-amber-600">{dados.ordensPendentes}</p>
                <p className="text-xs text-gray-400 mt-1">aguardando aprovação</p>
              </a>
            </div>

            {/* Cards secundários */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <a href="/transferencias" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <p className="text-sm text-gray-500 mb-1">Transferências</p>
                <p className="text-2xl font-semibold text-blue-600">{dados.transferenciasAndamento}</p>
                <p className="text-xs text-gray-400 mt-1">em andamento</p>
              </a>
              <a href="/pedidos" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <p className="text-sm text-gray-500 mb-1">Pedidos Pendentes</p>
                <p className="text-2xl font-semibold text-purple-600">{dados.pedidosPendentes}</p>
                <p className="text-xs text-gray-400 mt-1">de clientes</p>
              </a>
              <a href="/financeiro" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <p className="text-sm text-gray-500 mb-1">Duplicatas</p>
                <p className="text-2xl font-semibold text-amber-600">{dados.duplicatasPendentes}</p>
                <p className="text-xs text-gray-400 mt-1">R$ {dados.valorDuplicatas.toFixed(2)}</p>
              </a>
              <a href="/suporte" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <p className="text-sm text-gray-500 mb-1">Tickets Abertos</p>
                <p className="text-2xl font-semibold text-red-500">{dados.ticketsAbertos}</p>
                <p className="text-xs text-gray-400 mt-1">no suporte</p>
              </a>
            </div>

            {/* Últimas ordens pendentes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-800">Últimas Ordens Pendentes</h3>
                <a href="/ordens" className="text-sm text-gray-500 hover:text-gray-700 underline">Ver todas</a>
              </div>
              {movimentacoes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhuma ordem pendente</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="pb-3 font-medium">Produto</th>
                      <th className="pb-3 font-medium">Código</th>
                      <th className="pb-3 font-medium">Setor</th>
                      <th className="pb-3 font-medium">Solicitante</th>
                      <th className="pb-3 font-medium">Data</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {movimentacoes.map(o => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{o.produto}</td>
                        <td className="py-3 font-mono text-xs text-gray-400">{o.produto_codigo || '—'}</td>
                        <td className="py-3">{o.setores?.nome || '—'}</td>
                        <td className="py-3">{o.solicitante || '—'}</td>
                        <td className="py-3">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3"><span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-xs">Pendente</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}