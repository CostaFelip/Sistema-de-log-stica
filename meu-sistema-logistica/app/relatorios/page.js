'use client'

import { useState } from 'react'

const movimentacoes = [
  { id: 1, tipo: 'Entrada', produto: 'Parafuso M8', quantidade: 200, unidade: 'un', valor: 0.50, setor: 'Manutenção', empresa: 'Empresa A', data: '14/03/2026' },
  { id: 2, tipo: 'Saída', produto: 'Óleo Lubrificante', quantidade: 10, unidade: 'lt', valor: 25.00, setor: 'Produção', empresa: 'Empresa A', data: '13/03/2026' },
  { id: 3, tipo: 'Transferência', produto: 'Cabo Elétrico', quantidade: 50, unidade: 'm', valor: 8.00, setor: 'Elétrica', empresa: 'Empresa B', data: '13/03/2026' },
  { id: 4, tipo: 'Entrada', produto: 'Luva de Segurança', quantidade: 40, unidade: 'par', valor: 12.00, setor: 'RH', empresa: 'Empresa B', data: '12/03/2026' },
  { id: 5, tipo: 'Saída', produto: 'Parafuso M8', quantidade: 100, unidade: 'un', valor: 0.50, setor: 'Produção', empresa: 'Empresa A', data: '12/03/2026' },
  { id: 6, tipo: 'Entrada', produto: 'Cabo Elétrico', quantidade: 100, unidade: 'm', valor: 8.00, setor: 'Elétrica', empresa: 'Empresa B', data: '11/03/2026' },
]

const tipoCores = {
  Entrada: 'bg-green-50 text-green-600',
  Saída: 'bg-red-50 text-red-500',
  Transferência: 'bg-blue-50 text-blue-600',
}

export default function Relatorios() {
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [filtroEmpresa, setFiltroEmpresa] = useState('Todas')

  const empresas = ['Todas', ...new Set(movimentacoes.map(m => m.empresa))]

  const filtradas = movimentacoes.filter(m => {
    const porTipo = filtroTipo === 'Todos' || m.tipo === filtroTipo
    const porEmpresa = filtroEmpresa === 'Todas' || m.empresa === filtroEmpresa
    return porTipo && porEmpresa
  })

  const totalEntradas = filtradas.filter(m => m.tipo === 'Entrada').reduce((acc, m) => acc + m.quantidade * m.valor, 0)
  const totalSaidas = filtradas.filter(m => m.tipo === 'Saída').reduce((acc, m) => acc + m.quantidade * m.valor, 0)
  const totalTransferencias = filtradas.filter(m => m.tipo === 'Transferência').length

  const porSetor = movimentacoes.reduce((acc, m) => {
    acc[m.setor] = (acc[m.setor] || 0) + m.quantidade * m.valor
    return acc
  }, {})

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Menu lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Dashboard</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Relatórios</a>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Relatórios</h2>

        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total Entradas</p>
            <p className="text-2xl font-semibold text-green-600">R$ {totalEntradas.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total Saídas</p>
            <p className="text-2xl font-semibold text-red-500">R$ {totalSaidas.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Transferências</p>
            <p className="text-2xl font-semibold text-blue-600">{totalTransferencias}</p>
          </div>
        </div>

        {/* Resumo por setor */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Valor Movimentado por Setor</h3>
          <div className="flex flex-col gap-3">
            {Object.entries(porSetor).map(([setor, valor]) => {
              const max = Math.max(...Object.values(porSetor))
              const pct = (valor / max) * 100
              return (
                <div key={setor}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{setor}</span>
                    <span className="text-gray-800 font-medium">R$ {valor.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gray-800 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-4">
          <div className="flex gap-2">
            {['Todos', 'Entrada', 'Saída', 'Transferência'].map(f => (
              <button
                key={f}
                onClick={() => setFiltroTipo(f)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${filtroTipo === f ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={filtroEmpresa}
            onChange={(e) => setFiltroEmpresa(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 outline-none"
          >
            {empresas.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>

        {/* Tabela de movimentações */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Quantidade</th>
                <th className="px-6 py-4 font-medium">Valor Unit.</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Setor</th>
                <th className="px-6 py-4 font-medium">Empresa</th>
                <th className="px-6 py-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filtradas.map(m => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs ${tipoCores[m.tipo]}`}>{m.tipo}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{m.produto}</td>
                  <td className="px-6 py-4">{m.quantidade} {m.unidade}</td>
                  <td className="px-6 py-4">R$ {m.valor.toFixed(2)}</td>
                  <td className="px-6 py-4">R$ {(m.quantidade * m.valor).toFixed(2)}</td>
                  <td className="px-6 py-4">{m.setor}</td>
                  <td className="px-6 py-4">{m.empresa}</td>
                  <td className="px-6 py-4">{m.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

    </div>
  )
}