'use client'

import { useState } from 'react'

const ticketsIniciais = [
  { id: 1, titulo: 'Erro ao lançar nota fiscal', descricao: 'Ao tentar lançar uma nota fiscal o sistema retorna erro.', empresa: 'Empresa A', usuario: 'João Silva', modulo: 'Financeiro', prioridade: 'Alta', status: 'Aberto', data: '14/03/2026' },
  { id: 2, titulo: 'Usuário sem acesso ao estoque', descricao: 'Operador não consegue visualizar o módulo de estoque.', empresa: 'Empresa B', usuario: 'Maria Souza', modulo: 'Estoque', prioridade: 'Média', status: 'Em Atendimento', data: '13/03/2026' },
  { id: 3, titulo: 'Relatório não carrega', descricao: 'A página de relatórios fica carregando e não exibe dados.', empresa: 'Empresa A', usuario: 'Carlos Lima', modulo: 'Relatórios', prioridade: 'Baixa', status: 'Resolvido', data: '12/03/2026' },
]

const prioridadeCores = {
  Alta: 'bg-red-50 text-red-500',
  Média: 'bg-amber-50 text-amber-600',
  Baixa: 'bg-green-50 text-green-600',
}

const statusCores = {
  Aberto: 'bg-red-50 text-red-500',
  'Em Atendimento': 'bg-blue-50 text-blue-600',
  Resolvido: 'bg-green-50 text-green-600',
}

export default function Suporte() {
  const [tickets, setTickets] = useState(ticketsIniciais)
  const [modal, setModal] = useState(false)
  const [detalhe, setDetalhe] = useState(null)
  const [filtro, setFiltro] = useState('Todos')
  const [novo, setNovo] = useState({ titulo: '', descricao: '', empresa: '', usuario: '', modulo: '', prioridade: 'Média' })

  const filtrados = filtro === 'Todos' ? tickets : tickets.filter(t => t.status === filtro)

  function adicionarTicket() {
    if (!novo.titulo || !novo.descricao) return
    setTickets([...tickets, {
      ...novo,
      id: tickets.length + 1,
      status: 'Aberto',
      data: new Date().toLocaleDateString('pt-BR'),
    }])
    setNovo({ titulo: '', descricao: '', empresa: '', usuario: '', modulo: '', prioridade: 'Média' })
    setModal(false)
  }

  function alterarStatus(id, novoStatus) {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: novoStatus } : t))
    setDetalhe(tickets.find(t => t.id === id) ? { ...tickets.find(t => t.id === id), status: novoStatus } : null)
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
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="/recebimento" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
          <a href="/usuarios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Usuários e Permissões</a>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Suporte</h2>
          <button
            onClick={() => setModal(true)}
            className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Novo Ticket
          </button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Abertos</p>
            <p className="text-2xl font-semibold text-red-500">{tickets.filter(t => t.status === 'Aberto').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Em Atendimento</p>
            <p className="text-2xl font-semibold text-blue-600">{tickets.filter(t => t.status === 'Em Atendimento').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Resolvidos</p>
            <p className="text-2xl font-semibold text-green-600">{tickets.filter(t => t.status === 'Resolvido').length}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['Todos', 'Aberto', 'Em Atendimento', 'Resolvido'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${filtro === f ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lista de tickets */}
        <div className="flex flex-col gap-3">
          {filtrados.map(t => (
            <div
              key={t.id}
              onClick={() => setDetalhe(t)}
              className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-md text-xs ${prioridadeCores[t.prioridade]}`}>{t.prioridade}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs ${statusCores[t.status]}`}>{t.status}</span>
                    <span className="text-xs text-gray-400">{t.modulo}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{t.titulo}</p>
                  <p className="text-xs text-gray-400 mt-1">{t.empresa} · {t.usuario} · {t.data}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal detalhe do ticket */}
      {detalhe && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 rounded-md text-xs ${prioridadeCores[detalhe.prioridade]}`}>{detalhe.prioridade}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs ${statusCores[detalhe.status]}`}>{detalhe.status}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{detalhe.titulo}</h3>
            <p className="text-sm text-gray-500 mb-4">{detalhe.descricao}</p>
            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div><p className="text-gray-400">Empresa</p><p className="text-gray-700">{detalhe.empresa}</p></div>
              <div><p className="text-gray-400">Usuário</p><p className="text-gray-700">{detalhe.usuario}</p></div>
              <div><p className="text-gray-400">Módulo</p><p className="text-gray-700">{detalhe.modulo}</p></div>
              <div><p className="text-gray-400">Data</p><p className="text-gray-700">{detalhe.data}</p></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDetalhe(null)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Fechar</button>
              {detalhe.status === 'Aberto' && (
                <button onClick={() => alterarStatus(detalhe.id, 'Em Atendimento')} className="flex-1 bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700">Iniciar Atendimento</button>
              )}
              {detalhe.status === 'Em Atendimento' && (
                <button onClick={() => alterarStatus(detalhe.id, 'Resolvido')} className="flex-1 bg-green-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-green-700">Marcar Resolvido</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal novo ticket */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Novo Ticket</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Título', key: 'titulo', type: 'text' },
                { label: 'Empresa', key: 'empresa', type: 'text' },
                { label: 'Usuário', key: 'usuario', type: 'text' },
                { label: 'Módulo', key: 'modulo', type: 'text' },
              ].map(campo => (
                <div key={campo.key}>
                  <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                  <input
                    type={campo.type}
                    value={novo[campo.key]}
                    onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Prioridade</label>
                <select
                  value={novo.prioridade}
                  onChange={(e) => setNovo({ ...novo, prioridade: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none"
                >
                  <option>Alta</option>
                  <option>Média</option>
                  <option>Baixa</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Descrição</label>
                <textarea
                  value={novo.descricao}
                  onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarTicket} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Abrir Ticket</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}