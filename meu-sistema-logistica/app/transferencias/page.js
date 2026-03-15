'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const statusCores = {
  Pendente: 'bg-amber-50 text-amber-600',
  'Em Trânsito': 'bg-blue-50 text-blue-600',
  Concluída: 'bg-green-50 text-green-600',
}

export default function Transferencias() {
  const [transferencias, setTransferencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [filtro, setFiltro] = useState('Todos')
  const [nova, setNova] = useState({ produto: '', quantidade: '', unidade: '', origem: '', destino: '' })

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    setLoading(true)
    const { data } = await supabase.from('transferencias').select('*').order('created_at', { ascending: false })
    if (data) setTransferencias(data)
    setLoading(false)
  }

  async function adicionarTransferencia() {
    if (!nova.produto || !nova.quantidade || !nova.origem || !nova.destino) return
    const { error } = await supabase.from('transferencias').insert([{
      ...nova,
      quantidade: Number(nova.quantidade),
    }])
    if (!error) {
      setNova({ produto: '', quantidade: '', unidade: '', origem: '', destino: '' })
      setModal(false)
      carregarDados()
    }
  }

  async function alterarStatus(id, novoStatus) {
    await supabase.from('transferencias').update({ status: novoStatus }).eq('id', id)
    carregarDados()
  }

  const filtradas = filtro === 'Todos' ? transferencias : transferencias.filter(t => t.status === filtro)

  return (
    <div className="flex min-h-screen bg-gray-50">
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

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Transferências</h2>
          <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            + Nova Transferência
          </button>
        </div>

        {/* Cards */}
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

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['Todos', 'Pendente', 'Em Trânsito', 'Concluída'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${filtro === f ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400 text-sm">Carregando...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Quantidade</th>
                  <th className="px-6 py-4 font-medium">Origem</th>
                  <th className="px-6 py-4 font-medium">Destino</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {filtradas.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Nenhuma transferência cadastrada</td></tr>
                ) : filtradas.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{t.produto}</td>
                    <td className="px-6 py-4">{t.quantidade} {t.unidade}</td>
                    <td className="px-6 py-4">{t.origem}</td>
                    <td className="px-6 py-4">{t.destino}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${statusCores[t.status]}`}>{t.status}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {t.status === 'Pendente' && (
                          <button onClick={() => alterarStatus(t.id, 'Em Trânsito')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100">Iniciar</button>
                        )}
                        {t.status === 'Em Trânsito' && (
                          <button onClick={() => alterarStatus(t.id, 'Concluída')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Concluir</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

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
                  <input type={campo.type} value={nova[campo.key]} onChange={(e) => setNova({ ...nova, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarTransferencia} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Criar Transferência</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}