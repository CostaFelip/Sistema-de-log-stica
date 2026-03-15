'use client'

import { useState } from 'react'

const ordensIniciais = [
  { id: 1, produto: 'Parafuso M8', quantidade: 1000, unidade: 'un', valor: 0.50, empresa: 'Empresa A', setor: 'Manutenção', status: 'Pendente', data: '14/03/2026' },
  { id: 2, produto: 'Óleo Lubrificante', quantidade: 50, unidade: 'lt', valor: 25.00, empresa: 'Empresa A', setor: 'Produção', status: 'Aprovado', data: '13/03/2026' },
  { id: 3, produto: 'Cabo Elétrico', quantidade: 200, unidade: 'm', valor: 8.00, empresa: 'Empresa B', setor: 'Elétrica', status: 'Recusado', data: '12/03/2026' },
]

const statusCores = {
  Pendente: 'bg-amber-50 text-amber-600',
  Aprovado: 'bg-green-50 text-green-600',
  Recusado: 'bg-red-50 text-red-500',
}

export default function Ordens() {
  const [ordens, setOrdens] = useState(ordensIniciais)
  const [modal, setModal] = useState(false)
  const [filtro, setFiltro] = useState('Todos')
  const [nova, setNova] = useState({ produto: '', quantidade: '', unidade: '', valor: '', empresa: '', setor: '' })

  const filtradas = filtro === 'Todos' ? ordens : ordens.filter(o => o.status === filtro)

  function adicionarOrdem() {
    if (!nova.produto || !nova.quantidade) return
    const novaOrdem = {
      ...nova,
      id: ordens.length + 1,
      quantidade: Number(nova.quantidade),
      valor: Number(nova.valor),
      status: 'Pendente',
      data: new Date().toLocaleDateString('pt-BR'),
    }
    setOrdens([...ordens, novaOrdem])
    setNova({ produto: '', quantidade: '', unidade: '', valor: '', empresa: '', setor: '' })
    setModal(false)
  }

  function alterarStatus(id, novoStatus) {
    setOrdens(ordens.map(o => o.id === id ? { ...o, status: novoStatus } : o))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Menu lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Dashboard</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Ordens de Compra</h2>
          <button
            onClick={() => setModal(true)}
            className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Nova Ordem
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['Todos', 'Pendente', 'Aprovado', 'Recusado'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${filtro === f ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Pendentes</p>
            <p className="text-2xl font-semibold text-amber-600">{ordens.filter(o => o.status === 'Pendente').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Aprovadas</p>
            <p className="text-2xl font-semibold text-green-600">{ordens.filter(o => o.status === 'Aprovado').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Recusadas</p>
            <p className="text-2xl font-semibold text-red-500">{ordens.filter(o => o.status === 'Recusado').length}</p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Quantidade</th>
                <th className="px-6 py-4 font-medium">Valor Unit.</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Empresa</th>
                <th className="px-6 py-4 font-medium">Setor</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filtradas.map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{o.produto}</td>
                  <td className="px-6 py-4">{o.quantidade} {o.unidade}</td>
                  <td className="px-6 py-4">R$ {o.valor.toFixed(2)}</td>
                  <td className="px-6 py-4">R$ {(o.quantidade * o.valor).toFixed(2)}</td>
                  <td className="px-6 py-4">{o.empresa}</td>
                  <td className="px-6 py-4">{o.setor}</td>
                  <td className="px-6 py-4">{o.data}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs ${statusCores[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {o.status === 'Pendente' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => alterarStatus(o.id, 'Aprovado')}
                          className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => alterarStatus(o.id, 'Recusado')}
                          className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100"
                        >
                          Recusar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal nova ordem */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Nova Ordem de Compra</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Produto', key: 'produto', type: 'text' },
                { label: 'Quantidade', key: 'quantidade', type: 'number' },
                { label: 'Unidade (un, lt, m...)', key: 'unidade', type: 'text' },
                { label: 'Valor Unitário (R$)', key: 'valor', type: 'number' },
                { label: 'Empresa', key: 'empresa', type: 'text' },
                { label: 'Setor', key: 'setor', type: 'text' },
              ].map(campo => (
                <div key={campo.key}>
                  <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                  <input
                    type={campo.type}
                    value={nova[campo.key]}
                    onChange={(e) => setNova({ ...nova, [campo.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarOrdem}
                className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700"
              >
                Criar Ordem
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}