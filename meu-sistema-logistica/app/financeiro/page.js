'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const statusCores = {
  Pendente: 'bg-amber-50 text-amber-600',
  Pago: 'bg-green-50 text-green-600',
  Recebido: 'bg-green-50 text-green-600',
  Cancelado: 'bg-red-50 text-red-500',
  Aprovado: 'bg-green-50 text-green-600',
}

const tipoCores = {
  Pagar: 'bg-red-50 text-red-500',
  Receber: 'bg-green-50 text-green-600',
}

export default function Financeiro() {
  const { usuario, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [aba, setAba] = useState('fluxo')
  const [contas, setContas] = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [duplicatas, setDuplicatas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [modalOrc, setModalOrc] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [nova, setNova] = useState({ tipo: 'Pagar', descricao: '', fornecedor: '', valor: '', vencimento: '', categoria: '' })
  const [novoOrc, setNovoOrc] = useState({ descricao: '', valor: '', categoria: '' })

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
    const [{ data: conts }, { data: orcs }, { data: dups }] = await Promise.all([
      supabase.from('financeiro').select('*').order('created_at', { ascending: false }),
      supabase.from('orcamentos').select('*').order('created_at', { ascending: false }),
      supabase.from('duplicatas').select('*').order('created_at', { ascending: false }),
    ])
    if (conts) setContas(conts)
    if (orcs) setOrcamentos(orcs)
    if (dups) setDuplicatas(dups)
    setLoading(false)
  }

  async function adicionarConta() {
    if (!nova.descricao || !nova.valor) return
    const { error } = await supabase.from('financeiro').insert([{
      ...nova,
      valor: Number(nova.valor),
    }])
    if (!error) {
      setNova({ tipo: 'Pagar', descricao: '', fornecedor: '', valor: '', vencimento: '', categoria: '' })
      setModal(false)
      carregarDados()
    }
  }

  async function adicionarOrcamento() {
    if (!novoOrc.descricao || !novoOrc.valor) return
    const { error } = await supabase.from('orcamentos').insert([{
      ...novoOrc,
      valor: Number(novoOrc.valor),
    }])
    if (!error) {
      setNovoOrc({ descricao: '', valor: '', categoria: '' })
      setModalOrc(false)
      carregarDados()
    }
  }

  async function alterarStatusConta(id, novoStatus) {
    await supabase.from('financeiro').update({ status: novoStatus }).eq('id', id)
    carregarDados()
  }

  async function alterarStatusOrc(id, novoStatus) {
    await supabase.from('orcamentos').update({ status: novoStatus }).eq('id', id)
    carregarDados()
  }

  async function deletarConta(id) {
    await supabase.from('financeiro').delete().eq('id', id)
    carregarDados()
  }

  async function alterarStatusDuplicata(id, novoStatus) {
    await supabase.from('duplicatas').update({ status: novoStatus }).eq('id', id)
    carregarDados()
  }

  const totalPagar = contas.filter(c => c.tipo === 'Pagar' && c.status === 'Pendente').reduce((acc, c) => acc + Number(c.valor), 0)
  const totalReceber = contas.filter(c => c.tipo === 'Receber' && c.status === 'Pendente').reduce((acc, c) => acc + Number(c.valor), 0)
  const totalPago = contas.filter(c => c.status === 'Pago').reduce((acc, c) => acc + Number(c.valor), 0)
  const totalRecebido = contas.filter(c => c.status === 'Recebido').reduce((acc, c) => acc + Number(c.valor), 0)
  const totalDuplicatas = duplicatas.filter(d => d.status === 'Pendente').reduce((acc, d) => acc + Number(d.valor_total), 0)
  const saldo = totalRecebido - totalPago
  const contasFiltradas = filtroTipo === 'Todos' ? contas : contas.filter(c => c.tipo === filtroTipo)

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
          <a href="/financeiro" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Financeiro</a>
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

      <main className="flex-1 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Financeiro</h2>

        {/* Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">A Pagar</p>
            <p className="text-2xl font-semibold text-red-500">R$ {totalPagar.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">A Receber</p>
            <p className="text-2xl font-semibold text-green-600">R$ {totalReceber.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Saldo do Mês</p>
            <p className={`text-2xl font-semibold ${saldo >= 0 ? 'text-green-600' : 'text-red-500'}`}>R$ {saldo.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Duplicatas Pendentes</p>
            <p className="text-2xl font-semibold text-amber-600">R$ {totalDuplicatas.toFixed(2)}</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'fluxo', label: 'Fluxo de Caixa' },
            { key: 'contas', label: 'Contas' },
            { key: 'duplicatas', label: 'Duplicatas' },
            { key: 'orcamentos', label: 'Orçamentos' },
          ].map(a => (
            <button key={a.key} onClick={() => setAba(a.key)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${aba === a.key ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{a.label}</button>
          ))}
        </div>

        {/* Aba Fluxo */}
        {aba === 'fluxo' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Fluxo de Caixa</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Total Recebido', valor: totalRecebido, cor: 'text-green-600' },
                { label: 'Total Pago', valor: totalPago, cor: 'text-red-500' },
                { label: 'Duplicatas a Pagar', valor: totalDuplicatas, cor: 'text-amber-600' },
                { label: 'Saldo', valor: saldo, cor: saldo >= 0 ? 'text-green-600' : 'text-red-500' },
              ].map(item => {
                const max = Math.max(totalRecebido, totalPago, totalDuplicatas, 1)
                const pct = Math.min((Math.abs(item.valor) / max) * 100, 100)
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className={`font-medium ${item.cor}`}>R$ {item.valor.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Aba Contas */}
        {aba === 'contas' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {['Todos', 'Pagar', 'Receber'].map(f => (
                  <button key={f} onClick={() => setFiltroTipo(f)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${filtroTipo === f ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{f}</button>
                ))}
              </div>
              <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">+ Nova Conta</button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Carregando...</p></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">Tipo</th>
                      <th className="px-6 py-4 font-medium">Descrição</th>
                      <th className="px-6 py-4 font-medium">Fornecedor</th>
                      <th className="px-6 py-4 font-medium">Valor</th>
                      <th className="px-6 py-4 font-medium">Vencimento</th>
                      <th className="px-6 py-4 font-medium">Categoria</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {contasFiltradas.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Nenhuma conta cadastrada</td></tr>
                    ) : contasFiltradas.map(c => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${tipoCores[c.tipo]}`}>{c.tipo}</span></td>
                        <td className="px-6 py-4 font-medium text-gray-800">{c.descricao}</td>
                        <td className="px-6 py-4">{c.fornecedor}</td>
                        <td className="px-6 py-4">R$ {Number(c.valor).toFixed(2)}</td>
                        <td className="px-6 py-4">{c.vencimento || '—'}</td>
                        <td className="px-6 py-4">{c.categoria}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${statusCores[c.status]}`}>{c.status}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {c.status === 'Pendente' && c.tipo === 'Pagar' && <button onClick={() => alterarStatusConta(c.id, 'Pago')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Pagar</button>}
                            {c.status === 'Pendente' && c.tipo === 'Receber' && <button onClick={() => alterarStatusConta(c.id, 'Recebido')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Receber</button>}
                            {c.status === 'Pendente' && <button onClick={() => alterarStatusConta(c.id, 'Cancelado')} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100">Cancelar</button>}
                            <button onClick={() => deletarConta(c.id)} className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-md hover:bg-gray-100">Excluir</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Aba Duplicatas */}
        {aba === 'duplicatas' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Número</th>
                  <th className="px-6 py-4 font-medium">Fornecedor</th>
                  <th className="px-6 py-4 font-medium">Valor Total</th>
                  <th className="px-6 py-4 font-medium">Parcelas</th>
                  <th className="px-6 py-4 font-medium">Vencimento</th>
                  <th className="px-6 py-4 font-medium">Forma Pagamento</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {duplicatas.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Nenhuma duplicata cadastrada</td></tr>
                ) : duplicatas.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-800">{d.numero}</td>
                    <td className="px-6 py-4">{d.fornecedor}</td>
                    <td className="px-6 py-4">R$ {Number(d.valor_total).toFixed(2)}</td>
                    <td className="px-6 py-4">{d.parcelas}x de R$ {Number(d.valor_parcela || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">{d.data_vencimento || '—'}</td>
                    <td className="px-6 py-4">{d.forma_pagamento || '—'}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${statusCores[d.status]}`}>{d.status}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {d.status === 'Pendente' && <button onClick={() => alterarStatusDuplicata(d.id, 'Pago')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Pagar</button>}
                        {d.status === 'Pendente' && <button onClick={() => alterarStatusDuplicata(d.id, 'Cancelada')} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100">Cancelar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Aba Orçamentos */}
        {aba === 'orcamentos' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setModalOrc(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">+ Novo Orçamento</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-4 font-medium">Descrição</th>
                    <th className="px-6 py-4 font-medium">Valor</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {orcamentos.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Nenhum orçamento cadastrado</td></tr>
                  ) : orcamentos.map(o => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{o.descricao}</td>
                      <td className="px-6 py-4">R$ {Number(o.valor).toFixed(2)}</td>
                      <td className="px-6 py-4">{o.categoria}</td>
                      <td className="px-6 py-4">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${statusCores[o.status]}`}>{o.status}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {o.status === 'Pendente' && <>
                            <button onClick={() => alterarStatusOrc(o.id, 'Aprovado')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Aprovar</button>
                            <button onClick={() => alterarStatusOrc(o.id, 'Cancelado')} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100">Cancelar</button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal nova conta */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Nova Conta</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Tipo</label>
                <select value={nova.tipo} onChange={(e) => setNova({ ...nova, tipo: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                  <option>Pagar</option>
                  <option>Receber</option>
                </select>
              </div>
              {[
                { label: 'Descrição', key: 'descricao', type: 'text' },
                { label: 'Fornecedor / Cliente', key: 'fornecedor', type: 'text' },
                { label: 'Valor (R$)', key: 'valor', type: 'number' },
                { label: 'Vencimento', key: 'vencimento', type: 'date' },
                { label: 'Categoria', key: 'categoria', type: 'text' },
              ].map(campo => (
                <div key={campo.key}>
                  <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                  <input type={campo.type} value={nova[campo.key]} onChange={(e) => setNova({ ...nova, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarConta} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo orçamento */}
      {modalOrc && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Novo Orçamento</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Descrição', key: 'descricao', type: 'text' },
                { label: 'Valor (R$)', key: 'valor', type: 'number' },
                { label: 'Categoria', key: 'categoria', type: 'text' },
              ].map(campo => (
                <div key={campo.key}>
                  <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                  <input type={campo.type} value={novoOrc[campo.key]} onChange={(e) => setNovoOrc({ ...novoOrc, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOrc(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarOrcamento} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}