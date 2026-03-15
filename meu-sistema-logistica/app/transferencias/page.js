'use client'

import { useState } from 'react'

const transferenciasIniciais = [
  { id: 1, produto: 'Cabo Elétrico', quantidade: 50, unidade: 'm', origem: 'Elétrica - Empresa A', destino: 'Manutenção - Empresa B', status: 'Concluída', data: '13/03/2026' },
  { id: 2, produto: 'Luva de Segurança', quantidade: 20, unidade: 'par', origem: 'RH - Empresa B', destino: 'Produção - Empresa A', status: 'Em Trânsito', data: '14/03/2026' },
  { id: 3, produto: 'Parafuso M8', quantidade: 100, unidade: 'un', origem: 'Manutenção - Empresa A', destino: 'Produção - Empresa A', status: 'Pendente', data: '14/03/2026' },
]

const statusCores = {
  Pendente: 'bg-amber-50 text-amber-600',
  'Em Trânsito': 'bg-blue-50 text-blue-600',
  Concluída: 'bg-green-50 text-green-600',
}

export default function Transferencias() {
  const [transferencias, setTransferencias] = useState(transferenciasIniciais)
  const [modal, setModal] = useState(false)
  const [filtro, setFiltro] = useState('Todos')
  const [nova, setNova] = useState({ produto: '', quantidade: '', unidade: '', origem: '', destino: '' })

  const filtradas = filtro === 'Todos' ? transferencias : transferencias.filter(t => t.status === filtro)

  function adicionarTransferencia() {
    if (!nova.produto || !nova.quantidade || !nova.origem || !nova.destino) return
    const novaTransferencia = {
      ...nova,
      id: transferencias.length + 1,
      quantidade: Number(nova.quantidade),
      status: 'Pendente',
      data: new Date().toLocaleDateString('pt-BR'),
    }
    setTransferencias([...transferencias, novaTransferencia])
    setNova({ produto: '', quantidade: '', unidade: '', origem: '', destino: '' })
    setModal(false)
  }

  function alterarStatus(id, novoStatus) {
    setTransferencias(transferencias.map(t => t.id === id ? { ...t, status: novoStatus } : t))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Menu lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Dashboard</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Transferências</a>
          <a href="/recebimento" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
          <a href="/usuarios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Usuários e Permissões</a>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Transferências</h2>
          <button
            onClick={() => setModal(true)}
            className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Nova Transferência
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['Todos', 'Pendente', 'Em Trânsito', 'Concluída'].map(f => (
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
            <p className="text-2xl font-semibold text-amber-600">{transferencias.filter(t => t.status === 'Pendente').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Em Trânsito</p>
            <p className="text-2xl font-semibold text-blue-600">{transferencias.filter(t => t.status === 'Em Trânsito').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Concluídas</p>
            <p className="text-2xl font-semibold text-green-600">{transferencias.filter(t => t.status === 'Concluída').length}</p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Quantidade</th>
                <th className="px-6 py-4 font-medium">Origem</th>
                <th className="px-6 py-4 font-medium">Destino</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filtradas.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{t.produto}</td>
                  <td className="px-6 py-4">{t.quantidade} {t.unidade}</td>
                  <td className="px-6 py-4">{t.origem}</td>
                  <td className="px-6 py-4">{t.destino}</td>
                  <td className="px-6 py-4">{t.data}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs ${statusCores[t.status]}`}>{t.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {t.status === 'Pendente' && (
                        <button
                          onClick={() => alterarStatus(t.id, 'Em Trânsito')}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100"
                        >
                          Iniciar
                        </button>
                      )}
                      {t.status === 'Em Trânsito' && (
                        <button
                          onClick={() => alterarStatus(t.id, 'Concluída')}
                          className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal nova transferência */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Nova Transferência</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Produto', key: 'produto', type: 'text' },
                { label: 'Quantidade', key: 'quantidade', type: 'number' },
                { label: 'Unidade (un, lt, m...)', key: 'unidade', type: 'text' },
                { label: 'Origem (Setor - Empresa)', key: 'origem', type: 'text' },
                { label: 'Destino (Setor - Empresa)', key: 'destino', type: 'text' },
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
                onClick={adicionarTransferencia}
                className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700"
              >
                Criar Transferência
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}