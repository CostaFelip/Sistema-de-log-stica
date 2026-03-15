'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const niveisGerentes = ['Administrador', 'Suporte', 'Gerente Geral', 'Gerente de Estoque', 'Gerente Financeiro', 'Gerente de Setor']

export default function Relatorios() {
  const { usuario, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [aba, setAba] = useState('estoque')
  const [produtos, setProdutos] = useState([])
  const [ordens, setOrdens] = useState([])
  const [transferencias, setTransferencias] = useState([])
  const [recebimentos, setRecebimentos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

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

    let prodQuery = supabase.from('produtos').select('*, empresas(nome), setores(nome)').order('nome')
    let ordQuery = supabase.from('ordens').select('*, empresas(nome), setores(nome)').order('created_at', { ascending: false })
    let transQuery = supabase.from('transferencias').select('*').order('created_at', { ascending: false })
    let recQuery = supabase.from('recebimentos').select('*, empresas(nome), setores(nome)').order('created_at', { ascending: false })
    let pedQuery = supabase.from('pedidos_clientes').select('*, clientes(razao_social)').order('created_at', { ascending: false })

    if (!isGerente && usuario?.setor_id) {
      prodQuery = prodQuery.eq('setor_id', usuario.setor_id)
      ordQuery = ordQuery.eq('setor_id', usuario.setor_id)
      recQuery = recQuery.eq('setor_id', usuario.setor_id)
    }

    const [{ data: prods }, { data: ords }, { data: trans }, { data: recs }, { data: peds }] = await Promise.all([
      prodQuery, ordQuery, transQuery, recQuery, pedQuery
    ])

    if (prods) setProdutos(prods)
    if (ords) setOrdens(ords)
    if (trans) setTransferencias(trans)
    if (recs) setRecebimentos(recs)
    if (peds) setPedidos(peds)
    setLoading(false)
  }

  const filtrarPorPeriodo = (lista) => {
    return lista.filter(item => {
      const d = new Date(item.created_at)
      const inicio = dataInicio ? new Date(dataInicio) : null
      const fim = dataFim ? new Date(dataFim + 'T23:59:59') : null
      if (inicio && d < inicio) return false
      if (fim && d > fim) return false
      return true
    })
  }

  const ordensMes = filtrarPorPeriodo(ordens)
  const recebimentosMes = filtrarPorPeriodo(recebimentos)
  const pedidosMes = filtrarPorPeriodo(pedidos)
  const transferenciasMes = filtrarPorPeriodo(transferencias)

  const valorComprasMes = ordensMes.filter(o => o.status === 'Autorizado').reduce((acc, o) => acc + (o.quantidade * o.valor), 0)
  const valorRecebimentosMes = recebimentosMes.reduce((acc, r) => acc + Number(r.valor_total || 0), 0)
  const valorPedidosMes = pedidosMes.reduce((acc, p) => acc + Number(p.valor_total || 0), 0)

  const estoquesPorSetor = produtos.reduce((acc, p) => {
    const setor = p.setores?.nome || 'Sem setor'
    if (!acc[setor]) acc[setor] = { quantidade: 0, valor: 0 }
    acc[setor].quantidade += p.quantidade
    acc[setor].valor += p.quantidade * p.valor
    return acc
  }, {})

  const maxValorSetor = Math.max(...Object.values(estoquesPorSetor).map(s => s.valor), 1)
  const isGerente = niveisGerentes.includes(usuario?.nivel)

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
          <a href="/relatorios" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Relatórios</a>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Relatórios</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">De</label>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">até</label>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-gray-400" />
            </div>
            {(dataInicio || dataFim) && (
              <button onClick={() => { setDataInicio(''); setDataFim('') }} className="text-sm text-gray-400 hover:text-gray-600 underline">Limpar</button>
            )}
          </div>
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Compras no Período</p>
            <p className="text-2xl font-semibold text-gray-800">{ordensMes.length}</p>
            <p className="text-xs text-gray-400 mt-1">R$ {valorComprasMes.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Recebimentos</p>
            <p className="text-2xl font-semibold text-green-600">{recebimentosMes.length}</p>
            <p className="text-xs text-gray-400 mt-1">R$ {valorRecebimentosMes.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Transferências</p>
            <p className="text-2xl font-semibold text-blue-600">{transferenciasMes.length}</p>
            <p className="text-xs text-gray-400 mt-1">no período</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Pedidos Clientes</p>
            <p className="text-2xl font-semibold text-purple-600">{pedidosMes.length}</p>
            <p className="text-xs text-gray-400 mt-1">R$ {valorPedidosMes.toFixed(2)}</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'estoque', label: 'Estoque' },
            { key: 'ordens', label: 'Ordens' },
            { key: 'recebimentos', label: 'Recebimentos' },
            { key: 'pedidos', label: 'Pedidos' },
            { key: 'transferencias', label: 'Transferências' },
          ].map(a => (
            <button key={a.key} onClick={() => setAba(a.key)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${aba === a.key ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{a.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Carregando...</p></div>
        ) : (
          <>
            {aba === 'estoque' && (
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Valor em Estoque por Setor</h3>
                  <div className="flex flex-col gap-3">
                    {Object.entries(estoquesPorSetor).map(([setor, dados]) => (
                      <div key={setor}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{setor}</span>
                          <span className="text-gray-800 font-medium">R$ {dados.valor.toFixed(2)} · {dados.quantidade} itens</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${(dados.valor / maxValorSetor) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-100">
                        <th className="px-6 py-4 font-medium">Código</th>
                        <th className="px-6 py-4 font-medium">Produto</th>
                        <th className="px-6 py-4 font-medium">Setor</th>
                        <th className="px-6 py-4 font-medium">Empresa</th>
                        <th className="px-6 py-4 font-medium">Quantidade</th>
                        <th className="px-6 py-4 font-medium">Valor Unit.</th>
                        <th className="px-6 py-4 font-medium">Total</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      {produtos.map(p => (
                        <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-xs text-gray-400">{p.codigo}</td>
                          <td className="px-6 py-4 font-medium text-gray-800">{p.nome}</td>
                          <td className="px-6 py-4">{p.setores?.nome || '—'}</td>
                          <td className="px-6 py-4">{p.empresas?.nome || '—'}</td>
                          <td className="px-6 py-4">{p.quantidade} {p.unidade}</td>
                          <td className="px-6 py-4">R$ {Number(p.valor).toFixed(2)}</td>
                          <td className="px-6 py-4">R$ {(p.quantidade * p.valor).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            {p.quantidade === 0
                              ? <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs">Zerado</span>
                              : p.quantidade <= 10
                                ? <span className="bg-red-50 text-red-500 px-2 py-1 rounded-md text-xs">Baixo</span>
                                : <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md text-xs">Normal</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {aba === 'ordens' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">Número</th>
                      <th className="px-6 py-4 font-medium">Produto</th>
                      <th className="px-6 py-4 font-medium">Quantidade</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Solicitante</th>
                      <th className="px-6 py-4 font-medium">Autorizado por</th>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {ordensMes.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Nenhuma ordem no período</td></tr>
                    ) : ordensMes.map(o => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs text-gray-800">{o.numero || '—'}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{o.produto}</td>
                        <td className="px-6 py-4">{o.quantidade} {o.unidade}</td>
                        <td className="px-6 py-4">R$ {(o.quantidade * o.valor).toFixed(2)}</td>
                        <td className="px-6 py-4">{o.solicitante || '—'}</td>
                        <td className="px-6 py-4">{o.autorizado_por || '—'}</td>
                        <td className="px-6 py-4">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${o.status === 'Autorizado' ? 'bg-green-50 text-green-600' : o.status === 'Recusado' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {aba === 'recebimentos' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">Nota</th>
                      <th className="px-6 py-4 font-medium">Produto</th>
                      <th className="px-6 py-4 font-medium">Fornecedor</th>
                      <th className="px-6 py-4 font-medium">Valor Total</th>
                      <th className="px-6 py-4 font-medium">Lançado por</th>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {recebimentosMes.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Nenhum recebimento no período</td></tr>
                    ) : recebimentosMes.map(r => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{r.nota}</td>
                        <td className="px-6 py-4">{r.produto}</td>
                        <td className="px-6 py-4">{r.razao_social || r.fornecedor || '—'}</td>
                        <td className="px-6 py-4">R$ {Number(r.valor_total).toFixed(2)}</td>
                        <td className="px-6 py-4">{r.lancado_por || '—'}</td>
                        <td className="px-6 py-4">{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${r.status === 'Cancelada' ? 'bg-red-50 text-red-500' : r.status === 'Enviado ao Financeiro' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {aba === 'pedidos' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">Número</th>
                      <th className="px-6 py-4 font-medium">Cliente</th>
                      <th className="px-6 py-4 font-medium">Produto</th>
                      <th className="px-6 py-4 font-medium">Código</th>
                      <th className="px-6 py-4 font-medium">Qtd</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {pedidosMes.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Nenhum pedido no período</td></tr>
                    ) : pedidosMes.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs text-gray-800">{p.numero}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{p.cliente_nome}</td>
                        <td className="px-6 py-4">{p.produto}</td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-400">{p.produto_codigo || '—'}</td>
                        <td className="px-6 py-4">{p.quantidade} {p.unidade}</td>
                        <td className="px-6 py-4">R$ {Number(p.valor_total).toFixed(2)}</td>
                        <td className="px-6 py-4">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${p.status === 'Entregue' ? 'bg-green-50 text-green-600' : p.status === 'Cancelado' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {aba === 'transferencias' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">Produto</th>
                      <th className="px-6 py-4 font-medium">Quantidade</th>
                      <th className="px-6 py-4 font-medium">Origem</th>
                      <th className="px-6 py-4 font-medium">Destino</th>
                      <th className="px-6 py-4 font-medium">Solicitante</th>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {transferenciasMes.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Nenhuma transferência no período</td></tr>
                    ) : transferenciasMes.map(t => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{t.produto}</td>
                        <td className="px-6 py-4">{t.quantidade} {t.unidade}</td>
                        <td className="px-6 py-4">{t.origem}</td>
                        <td className="px-6 py-4">{t.destino}</td>
                        <td className="px-6 py-4">{t.solicitante || '—'}</td>
                        <td className="px-6 py-4">{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${t.status === 'Concluída' ? 'bg-green-50 text-green-600' : t.status === 'Em Trânsito' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}