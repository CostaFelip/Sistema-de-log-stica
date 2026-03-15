'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

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

const statusIcone = {
  Aberto: '○',
  'Em Atendimento': '◎',
  Resolvido: '●',
}

const modulos = [
  'Dashboard', 'Compras', 'Estoque', 'Ordens de Compra',
  'Transferências', 'Recebimento', 'Financeiro', 'Pedidos',
  'Fornecedores', 'Empresas e Setores', 'Relatórios',
  'Usuários e Permissões', 'Outro'
]

export default function MeuSuporte() {
  const { usuario, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detalhe, setDetalhe] = useState(null)
  const [novo, setNovo] = useState({
    titulo: '', descricao: '', empresa_id: '',
    modulo: '', prioridade: 'Média'
  })

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
    const [{ data: tick }, { data: emps }] = await Promise.all([
      supabase
        .from('tickets')
        .select('*, empresas(nome)')
        .eq('criado_por', usuario.nome)
        .order('created_at', { ascending: false }),
      supabase.from('empresas').select('*'),
    ])
    if (tick) setTickets(tick)
    if (emps) setEmpresas(emps)
    setLoading(false)
  }

  async function abrirTicket() {
    if (!novo.titulo || !novo.descricao) return
    const { error } = await supabase.from('tickets').insert([{
      titulo: novo.titulo,
      descricao: novo.descricao,
      empresa_id: novo.empresa_id || null,
      empresa: empresas.find(e => e.id === novo.empresa_id)?.nome || '',
      usuario: usuario.nome,
      modulo: novo.modulo,
      prioridade: novo.prioridade,
      status: 'Aberto',
      criado_por: usuario.nome,
    }])
    if (!error) {
      setNovo({ titulo: '', descricao: '', empresa_id: '', modulo: '', prioridade: 'Média' })
      setModal(false)
      carregarDados()
    } else {
      alert('Erro: ' + error.message)
    }
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
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Meus Tickets</a>
          <a href="/usuarios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Usuários e Permissões</a>
        </nav>
          <div className="mt-auto border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-800">{usuario?.nome}</p>
            <p className="text-xs text-gray-400 mb-1">{usuario?.nivel}</p>
            <a href="/alterar-senha" className="text-xs text-blue-600 hover:text-blue-700 block mb-3">Alterar senha</a>
            <button onClick={handleLogout} className="w-full text-left text-sm text-red-500 hover:text-red-600">Sair</button>
          </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Meus Tickets</h2>
            <p className="text-sm text-gray-400 mt-1">Acompanhe seus chamados</p>
          </div>
          <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            + Abrir Ticket
          </button>
        </div>

        {/* Cards */}
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

        {loading ? (
          <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Carregando...</p></div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">Você não tem nenhum ticket</p>
            <button onClick={() => setModal(true)} className="mt-4 text-sm text-gray-800 underline">Abrir meu primeiro ticket</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map(t => (
              <div key={t.id} onClick={() => setDetalhe(t)} className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-xs ${prioridadeCores[t.prioridade]}`}>{t.prioridade}</span>
                      <span className={`px-2 py-0.5 rounded-md text-xs ${statusCores[t.status]}`}>{statusIcone[t.status]} {t.status}</span>
                      {t.modulo && <span className="text-xs text-gray-400">{t.modulo}</span>}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{t.titulo}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {t.resposta && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md">Nova resposta</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal detalhe */}
      {detalhe && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 rounded-md text-xs ${prioridadeCores[detalhe.prioridade]}`}>{detalhe.prioridade}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs ${statusCores[detalhe.status]}`}>{statusIcone[detalhe.status]} {detalhe.status}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{detalhe.titulo}</h3>
            <p className="text-sm text-gray-500 mb-4">{detalhe.descricao}</p>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><p className="text-gray-400">Módulo</p><p className="text-gray-700">{detalhe.modulo || '—'}</p></div>
              <div><p className="text-gray-400">Aberto em</p><p className="text-gray-700">{new Date(detalhe.created_at).toLocaleDateString('pt-BR')}</p></div>
            </div>

            {/* Andamento */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-sm text-gray-500 mb-3">Andamento</p>
              <div className="flex items-center gap-2">
                {['Aberto', 'Em Atendimento', 'Resolvido'].map((etapa, i) => (
                  <div key={etapa} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      detalhe.status === 'Aberto' && i === 0 ? 'bg-red-500' :
                      detalhe.status === 'Em Atendimento' && i <= 1 ? 'bg-blue-600' :
                      detalhe.status === 'Resolvido' ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                    <span className={`text-xs ${
                      (detalhe.status === 'Aberto' && i === 0) ||
                      (detalhe.status === 'Em Atendimento' && i <= 1) ||
                      detalhe.status === 'Resolvido' ? 'text-gray-700' : 'text-gray-300'
                    }`}>{etapa}</span>
                    {i < 2 && <div className={`w-8 h-px ${
                      (detalhe.status === 'Em Atendimento' && i === 0) ||
                      detalhe.status === 'Resolvido' ? 'bg-gray-400' : 'bg-gray-200'
                    }`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Resposta do suporte */}
            {detalhe.resposta ? (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-blue-600 font-medium mb-1">Resposta do Suporte</p>
                <p className="text-sm text-blue-800">{detalhe.resposta}</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400">Aguardando resposta do suporte...</p>
              </div>
            )}

            <button onClick={() => setDetalhe(null)} className="w-full border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Fechar</button>
          </div>
        </div>
      )}

      {/* Modal novo ticket */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Abrir Ticket</h3>
            <p className="text-sm text-gray-400 mb-6">Aberto por: {usuario?.nome}</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Título do problema</label>
                <input type="text" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">Empresa</label>
                <select value={novo.empresa_id} onChange={(e) => setNovo({ ...novo, empresa_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                  <option value="">Selecione a empresa</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">Módulo relacionado</label>
                <select value={novo.modulo} onChange={(e) => setNovo({ ...novo, modulo: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                  <option value="">Selecione o módulo</option>
                  {modulos.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">Prioridade</label>
                <select value={novo.prioridade} onChange={(e) => setNovo({ ...novo, prioridade: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                  <option>Alta</option>
                  <option>Média</option>
                  <option>Baixa</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">Descrição detalhada</label>
                <textarea value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} rows={4} placeholder="Descreva o problema com o máximo de detalhes..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={abrirTicket} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Enviar Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}