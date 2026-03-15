'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const statusCores = {
  Pendente: 'bg-amber-50 text-amber-600',
  Autorizado: 'bg-green-50 text-green-600',
  Recusado: 'bg-red-50 text-red-500',
}

export default function Compras() {
  const { usuario, loading: authLoading } = useAuth()
  const router = useRouter()
  const [aba, setAba] = useState('dashboard')
  const [ordens, setOrdens] = useState([])
  const [produtos, setProdutos] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [setores, setSetores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [filtro, setFiltro] = useState('Todos')
  const [codigoBusca, setCodigoBusca] = useState('')
  const [produtoEncontrado, setProdutoEncontrado] = useState(null)
  const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [nova, setNova] = useState({
    produto: '', quantidade: '', unidade: '', valor: '',
    empresa_id: '', setor_id: '', fornecedor_id: '',
    fornecedor_email: '', observacoes: ''
  })

  useEffect(() => {
    if (!authLoading && !usuario) router.push('/')
    if (!authLoading && usuario) carregarDados()
  }, [usuario, authLoading])

  async function carregarDados() {
    setLoading(true)
    const [{ data: ords }, { data: prods }, { data: fors }, { data: emps }, { data: sets }] = await Promise.all([
      supabase.from('ordens').select('*, empresas(nome), setores(nome)').order('created_at', { ascending: false }),
      supabase.from('produtos').select('*, empresas(nome), setores(nome)'),
      supabase.from('fornecedores').select('*').eq('status', 'Ativo'),
      supabase.from('empresas').select('*'),
      supabase.from('setores').select('*'),
    ])
    if (ords) setOrdens(ords)
    if (prods) setProdutos(prods)
    if (fors) setFornecedores(fors)
    if (emps) setEmpresas(emps)
    if (sets) setSetores(sets)
    setLoading(false)
  }

  async function buscarProduto() {
    if (!codigoBusca) return
    setBuscando(true)
    const { data } = await supabase
      .from('produtos')
      .select('*, empresas(nome), setores(nome)')
      .or(`codigo.eq.${codigoBusca},codigo_barras.eq.${codigoBusca}`)
      .single()
    if (data) {
      setProdutoEncontrado(data)
      setNova(prev => ({
        ...prev,
        produto: data.nome,
        unidade: data.unidade,
        valor: data.valor,
        empresa_id: data.empresa_id,
        setor_id: data.setor_id,
      }))
      const fors = fornecedores.filter(f =>
        (f.categorias_produtos || []).some(cat =>
          cat.toLowerCase().includes(data.categoria?.toLowerCase() || '')
        )
      )
      setFornecedoresFiltrados(fors.length > 0 ? fors : fornecedores)
    } else {
      setProdutoEncontrado(null)
      alert('Produto não encontrado.')
    }
    setBuscando(false)
  }

  async function gerarNumeroOrdem() {
    const { count } = await supabase.from('ordens').select('*', { count: 'exact', head: true })
    return `OC-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`
  }

  async function criarOrdem() {
    if (!nova.produto || !nova.quantidade || !nova.fornecedor_id) return
    const numero = await gerarNumeroOrdem()
    const fornecedor = fornecedores.find(f => f.id === nova.fornecedor_id)
    const { data: session } = await supabase.auth.getSession()
    const { error } = await supabase.from('ordens').insert([{
      numero,
      produto: nova.produto,
      produto_codigo: produtoEncontrado?.codigo,
      quantidade: Number(nova.quantidade),
      unidade: nova.unidade,
      valor: Number(nova.valor),
      empresa_id: nova.empresa_id || null,
      setor_id: nova.setor_id || null,
      fornecedor_id: nova.fornecedor_id,
      fornecedor_email: fornecedor?.email || '',
      observacoes: nova.observacoes,
      solicitante: usuario.nome,
      solicitante_id: session.session.user.id,
    }])
    if (!error) {
      setNova({ produto: '', quantidade: '', unidade: '', valor: '', empresa_id: '', setor_id: '', fornecedor_id: '', fornecedor_email: '', observacoes: '' })
      setProdutoEncontrado(null)
      setCodigoBusca('')
      setFornecedoresFiltrados([])
      setModal(false)
      carregarDados()
    }
  }

async function alterarStatus(id, novoStatus) {
  const { data: session } = await supabase.auth.getSession()
  await supabase.from('ordens').update({
    status: novoStatus,
    autorizado_por: usuario.nome,
    autorizado_por_id: session.session.user.id,
    data_autorizacao: new Date().toISOString(),
    email_enviado: novoStatus === 'Autorizado',
  }).eq('id', id)

  if (novoStatus === 'Autorizado') {
    const ordem = ordens.find(o => o.id === id)
    if (ordem?.fornecedor_email) {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordem: { ...ordem, solicitante: ordem.solicitante || usuario.nome } })
      })
    }
  }

  carregarDados()
}

  // Dados para o dashboard
  const estoquesBaixos = produtos.filter(p => p.quantidade <= 10)
  const ordensNesteMes = ordens.filter(o => new Date(o.created_at).getMonth() === new Date().getMonth())
  const valorComprasMes = ordensNesteMes.filter(o => o.status === 'Autorizado').reduce((acc, o) => acc + (o.quantidade * o.valor), 0)

  const saidaMensal = produtos.map(p => {
    const saidas = ordens.filter(o => o.produto === p.nome && o.status === 'Autorizado' && new Date(o.created_at).getMonth() === new Date().getMonth())
    const total = saidas.reduce((acc, o) => acc + o.quantidade, 0)
    return { ...p, saida_mensal: total }
  }).filter(p => p.saida_mensal > 0).sort((a, b) => b.saida_mensal - a.saida_mensal)

  const filtradas = filtro === 'Todos' ? ordens : ordens.filter(o => o.status === filtro)

  if (authLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">Carregando...</p></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Dashboard</a>
          <a href="/compras" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Compras</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="/recebimento" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
          <a href="/fornecedores" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Fornecedores</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
          <a href="/usuarios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Usuários e Permissões</a>
        </nav>
        <div className="mt-auto border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-800">{usuario?.nome}</p>
          <p className="text-xs text-gray-400">{usuario?.nivel}</p>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Compras</h2>
          {aba === 'ordens' && (
            <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              + Nova Ordem de Compra
            </button>
          )}
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'ordens', label: 'Ordens de Compra' },
          ].map(a => (
            <button key={a.key} onClick={() => setAba(a.key)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${aba === a.key ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{a.label}</button>
          ))}
        </div>

        {/* Aba Dashboard */}
        {aba === 'dashboard' && (
          <div>
            {/* Cards resumo */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Estoque Baixo</p>
                <p className="text-2xl font-semibold text-red-500">{estoquesBaixos.length}</p>
                <p className="text-xs text-gray-400 mt-1">produtos abaixo de 10 un</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Ordens Pendentes</p>
                <p className="text-2xl font-semibold text-amber-600">{ordens.filter(o => o.status === 'Pendente').length}</p>
                <p className="text-xs text-gray-400 mt-1">aguardando aprovação</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Compras no Mês</p>
                <p className="text-2xl font-semibold text-gray-800">{ordensNesteMes.length}</p>
                <p className="text-xs text-gray-400 mt-1">ordens criadas</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Valor Autorizado</p>
                <p className="text-2xl font-semibold text-green-600">R$ {valorComprasMes.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">no mês atual</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Estoque Baixo */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">Alertas de Estoque Baixo</h3>
                  <span className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md">{estoquesBaixos.length} alertas</span>
                </div>
                {estoquesBaixos.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum alerta de estoque baixo</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {estoquesBaixos.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{p.nome}</p>
                          <p className="text-xs text-gray-500">{p.setores?.nome} · {p.empresas?.nome}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-500">{p.quantidade} {p.unidade}</p>
                          <button onClick={() => { setAba('ordens'); setModal(true) }} className="text-xs text-gray-500 hover:text-gray-700 underline">Pedir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Saída mensal */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Saída Mensal por Produto</h3>
                {saidaMensal.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhuma saída registrada este mês</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {saidaMensal.slice(0, 6).map(p => {
                      const max = saidaMensal[0].saida_mensal
                      const pct = (p.saida_mensal / max) * 100
                      return (
                        <div key={p.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{p.nome}</span>
                            <span className="text-gray-800 font-medium">{p.saida_mensal} {p.unidade}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Aba Ordens */}
        {aba === 'ordens' && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Pendentes</p>
                <p className="text-2xl font-semibold text-amber-600">{ordens.filter(o => o.status === 'Pendente').length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Autorizadas</p>
                <p className="text-2xl font-semibold text-green-600">{ordens.filter(o => o.status === 'Autorizado').length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Recusadas</p>
                <p className="text-2xl font-semibold text-red-500">{ordens.filter(o => o.status === 'Recusado').length}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              {['Todos', 'Pendente', 'Autorizado', 'Recusado'].map(f => (
                <button key={f} onClick={() => setFiltro(f)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${filtro === f ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{f}</button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Carregando...</p></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">Número</th>
                      <th className="px-6 py-4 font-medium">Produto</th>
                      <th className="px-6 py-4 font-medium">Fornecedor</th>
                      <th className="px-6 py-4 font-medium">Quantidade</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Solicitante</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {filtradas.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Nenhuma ordem cadastrada</td></tr>
                    ) : filtradas.map(o => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs text-gray-800">{o.numero || '—'}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{o.produto}</p>
                          <p className="font-mono text-xs text-gray-400">{o.produto_codigo}</p>
                        </td>
                        <td className="px-6 py-4">{o.fornecedor_id ? fornecedores.find(f => f.id === o.fornecedor_id)?.razao_social || '—' : '—'}</td>
                        <td className="px-6 py-4">{o.quantidade} {o.unidade}</td>
                        <td className="px-6 py-4">R$ {(o.quantidade * o.valor).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <p>{o.solicitante || '—'}</p>
                          <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('pt-BR')}</p>
                        </td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${statusCores[o.status]}`}>{o.status}</span></td>
                        <td className="px-6 py-4">
                          {o.status === 'Pendente' && (
                            <div className="flex gap-2">
                              <button onClick={() => alterarStatus(o.id, 'Autorizado')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Autorizar</button>
                              <button onClick={() => alterarStatus(o.id, 'Recusado')} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100">Recusar</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal nova ordem */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Nova Ordem de Compra</h3>
            <p className="text-sm text-gray-400 mb-6">Solicitante: {usuario?.nome}</p>

            {/* Busca produto */}
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Código SKU ou código de barras" value={codigoBusca} onChange={(e) => setCodigoBusca(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscarProduto()} className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
              <button onClick={buscarProduto} className="bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">{buscando ? '...' : 'Buscar'}</button>
            </div>

            {produtoEncontrado && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                <p className="text-xs text-green-600 font-medium mb-1">Produto encontrado</p>
                <p className="text-sm font-medium text-gray-800">{produtoEncontrado.nome}</p>
                <p className="text-xs text-gray-500">{produtoEncontrado.codigo} · Estoque: {produtoEncontrado.quantidade} {produtoEncontrado.unidade}</p>
              </div>
            )}

            {produtoEncontrado && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Quantidade</label>
                    <input type="number" value={nova.quantidade} onChange={(e) => setNova({ ...nova, quantidade: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Valor Unit. (R$)</label>
                    <input type="number" value={nova.valor} onChange={(e) => setNova({ ...nova, valor: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                  </div>
                </div>

                {/* Fornecedor */}
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Fornecedor</label>
                  {fornecedoresFiltrados.length > 0 && (
                    <p className="text-xs text-blue-600 mb-2">Sugeridos pela categoria do produto</p>
                  )}
                  <select value={nova.fornecedor_id} onChange={(e) => setNova({ ...nova, fornecedor_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                    <option value="">Selecione o fornecedor</option>
                    {(fornecedoresFiltrados.length > 0 ? fornecedoresFiltrados : fornecedores).map(f => (
                      <option key={f.id} value={f.id}>{f.razao_social} {f.categorias_produtos?.length > 0 ? `· ${f.categorias_produtos.join(', ')}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Empresa</label>
                  <select value={nova.empresa_id} onChange={(e) => setNova({ ...nova, empresa_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                    <option value="">Selecione a empresa</option>
                    {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Setor</label>
                  <select value={nova.setor_id} onChange={(e) => setNova({ ...nova, setor_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                    <option value="">Selecione o setor</option>
                    {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Observações</label>
                  <textarea value={nova.observacoes} onChange={(e) => setNova({ ...nova, observacoes: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 resize-none" />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModal(false); setProdutoEncontrado(null); setCodigoBusca('') }} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              {produtoEncontrado && (
                <button onClick={criarOrdem} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Criar Ordem</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}