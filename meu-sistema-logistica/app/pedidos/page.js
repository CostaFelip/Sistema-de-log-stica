'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const statusCores = {
  Pendente: 'bg-amber-50 text-amber-600',
  Confirmado: 'bg-blue-50 text-blue-600',
  'Em Separação': 'bg-purple-50 text-purple-600',
  Despachado: 'bg-teal-50 text-teal-600',
  Entregue: 'bg-green-50 text-green-600',
  Cancelado: 'bg-red-50 text-red-500',
}

export default function Pedidos() {
  const { usuario, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [aba, setAba] = useState('pedidos')
  const [pedidos, setPedidos] = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [setores, setSetores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [modalCliente, setModalCliente] = useState(false)
  const [detalhe, setDetalhe] = useState(null)
  const [filtro, setFiltro] = useState('Todos')
  const [codigoBusca, setCodigoBusca] = useState('')
  const [produtoEncontrado, setProdutoEncontrado] = useState(null)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [novo, setNovo] = useState({
    cliente_id: '', quantidade: '', valor_unit: '',
    prazo_entrega: '', endereco_entrega: '',
    forma_pagamento: '', parcelas: '1',
    data_vencimento: '', observacoes: '',
    empresa_id: '', setor_id: ''
  })
  const [novoCliente, setNovoCliente] = useState({
    razao_social: '', nome_fantasia: '', cnpj: '',
    email: '', telefone: '', contato: '',
    endereco: '', cidade: '', estado: '', cep: '', observacoes: ''
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
    const [{ data: peds }, { data: clts }, { data: prods }, { data: emps }, { data: sets }] = await Promise.all([
      supabase.from('pedidos_clientes').select('*, clientes(razao_social, email), empresas(nome), setores(nome)').order('created_at', { ascending: false }),
      supabase.from('clientes').select('*').eq('status', 'Ativo').order('razao_social'),
      supabase.from('produtos').select('*, empresas(nome), setores(nome)'),
      supabase.from('empresas').select('*'),
      supabase.from('setores').select('*'),
    ])
    if (peds) setPedidos(peds)
    if (clts) setClientes(clts)
    if (prods) setProdutos(prods)
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
      setNovo(prev => ({
        ...prev,
        valor_unit: data.valor,
        empresa_id: data.empresa_id,
        setor_id: data.setor_id,
      }))
    } else {
      setProdutoEncontrado(null)
      alert('Produto não encontrado.')
    }
    setBuscando(false)
  }

  async function gerarNumeroPedido() {
    const { count } = await supabase.from('pedidos_clientes').select('*', { count: 'exact', head: true })
    return `PED-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`
  }

  async function gerarCodigoCliente() {
    const { count } = await supabase.from('clientes').select('*', { count: 'exact', head: true })
    return `CLI-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`
  }

  async function criarPedido() {
    if (!novo.cliente_id || !produtoEncontrado || !novo.quantidade) return
    const numero = await gerarNumeroPedido()
    const cliente = clientes.find(c => c.id === novo.cliente_id)
    const qtd = Number(novo.quantidade)
    const valorUnit = Number(novo.valor_unit)
    const valorTotal = qtd * valorUnit
    const valorParcela = valorTotal / Number(novo.parcelas || 1)

    const { error } = await supabase.from('pedidos_clientes').insert([{
      numero,
      cliente_id: novo.cliente_id,
      cliente_nome: cliente?.razao_social,
      produto: produtoEncontrado.nome,
      produto_codigo: produtoEncontrado.codigo,
      quantidade: qtd,
      unidade: produtoEncontrado.unidade,
      valor_unit: valorUnit,
      valor_total: valorTotal,
      prazo_entrega: novo.prazo_entrega || null,
      endereco_entrega: novo.endereco_entrega,
      forma_pagamento: novo.forma_pagamento,
      parcelas: Number(novo.parcelas || 1),
      valor_parcela: valorParcela,
      data_vencimento: novo.data_vencimento || null,
      observacoes: novo.observacoes,
      criado_por: usuario.nome,
      empresa_id: novo.empresa_id || null,
      setor_id: novo.setor_id || null,
    }])

    if (!error) {
      setNovo({ cliente_id: '', quantidade: '', valor_unit: '', prazo_entrega: '', endereco_entrega: '', forma_pagamento: '', parcelas: '1', data_vencimento: '', observacoes: '', empresa_id: '', setor_id: '' })
      setProdutoEncontrado(null)
      setClienteSelecionado(null)
      setCodigoBusca('')
      setModal(false)
      carregarDados()
    }
  }

  async function adicionarCliente() {
    if (!novoCliente.razao_social) return
    const codigo = await gerarCodigoCliente()
    const { error } = await supabase.from('clientes').insert([{ ...novoCliente, codigo }])
    if (!error) {
      setNovoCliente({ razao_social: '', nome_fantasia: '', cnpj: '', email: '', telefone: '', contato: '', endereco: '', cidade: '', estado: '', cep: '', observacoes: '' })
      setModalCliente(false)
      carregarDados()
    }
  }

  async function alterarStatus(id, novoStatus) {
    await supabase.from('pedidos_clientes').update({ status: novoStatus }).eq('id', id)
    setDetalhe(null)
    carregarDados()
  }

  const filtrados = filtro === 'Todos' ? pedidos : pedidos.filter(p => p.status === filtro)

  const totalPendente = pedidos.filter(p => p.status === 'Pendente').length
  const totalConfirmado = pedidos.filter(p => p.status === 'Confirmado').length
  const totalDespachado = pedidos.filter(p => p.status === 'Despachado').length
  const totalEntregue = pedidos.filter(p => p.status === 'Entregue').length
  const valorTotalMes = pedidos.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).reduce((acc, p) => acc + Number(p.valor_total), 0)

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
          <a href="/pedidos" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Pedidos</a>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Pedidos</h2>
          {aba === 'pedidos' && (
            <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              + Novo Pedido
            </button>
          )}
          {aba === 'clientes' && (
            <button onClick={() => setModalCliente(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              + Novo Cliente
            </button>
          )}
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'pedidos', label: 'Pedidos de Clientes' },
            { key: 'clientes', label: 'Clientes' },
          ].map(a => (
            <button key={a.key} onClick={() => setAba(a.key)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${aba === a.key ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{a.label}</button>
          ))}
        </div>

        {/* Aba Pedidos */}
        {aba === 'pedidos' && (
          <div>
            {/* Cards */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Pendentes</p>
                <p className="text-2xl font-semibold text-amber-600">{totalPendente}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Confirmados</p>
                <p className="text-2xl font-semibold text-blue-600">{totalConfirmado}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Despachados</p>
                <p className="text-2xl font-semibold text-teal-600">{totalDespachado}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Entregues</p>
                <p className="text-2xl font-semibold text-green-600">{totalEntregue}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Faturado no Mês</p>
                <p className="text-2xl font-semibold text-gray-800">R$ {valorTotalMes.toFixed(2)}</p>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {['Todos', 'Pendente', 'Confirmado', 'Em Separação', 'Despachado', 'Entregue', 'Cancelado'].map(f => (
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
                      <th className="px-6 py-4 font-medium">Cliente</th>
                      <th className="px-6 py-4 font-medium">Produto</th>
                      <th className="px-6 py-4 font-medium">Código</th>
                      <th className="px-6 py-4 font-medium">Qtd</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Prazo</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {filtrados.length === 0 ? (
                      <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-400">Nenhum pedido cadastrado</td></tr>
                    ) : filtrados.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setDetalhe(p)}>
                        <td className="px-6 py-4 font-mono text-xs text-gray-800">{p.numero}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{p.cliente_nome}</td>
                        <td className="px-6 py-4">{p.produto}</td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-400">{p.produto_codigo}</td>
                        <td className="px-6 py-4">{p.quantidade} {p.unidade}</td>
                        <td className="px-6 py-4">R$ {Number(p.valor_total).toFixed(2)}</td>
                        <td className="px-6 py-4">{p.prazo_entrega || '—'}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${statusCores[p.status]}`}>{p.status}</span></td>
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            {p.status === 'Pendente' && <button onClick={() => alterarStatus(p.id, 'Confirmado')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100">Confirmar</button>}
                            {p.status === 'Confirmado' && <button onClick={() => alterarStatus(p.id, 'Em Separação')} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-md hover:bg-purple-100">Separar</button>}
                            {p.status === 'Em Separação' && <button onClick={() => alterarStatus(p.id, 'Despachado')} className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded-md hover:bg-teal-100">Despachar</button>}
                            {p.status === 'Despachado' && <button onClick={() => alterarStatus(p.id, 'Entregue')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Entregar</button>}
                            {!['Entregue', 'Cancelado'].includes(p.status) && <button onClick={() => alterarStatus(p.id, 'Cancelado')} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100">Cancelar</button>}
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

        {/* Aba Clientes */}
        {aba === 'clientes' && (
          <div className="flex flex-col gap-3">
            {clientes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">Nenhum cliente cadastrado</p>
                <button onClick={() => setModalCliente(true)} className="mt-4 text-sm text-gray-800 underline">Cadastrar primeiro cliente</button>
              </div>
            ) : clientes.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-gray-400 mb-1">{c.codigo}</p>
                    <p className="font-medium text-gray-800">{c.razao_social}</p>
                    {c.nome_fantasia && <p className="text-sm text-gray-400">{c.nome_fantasia}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{c.cnpj || '—'}</p>
                    <p className="text-xs text-gray-400">{c.email || '—'}</p>
                    <p className="text-xs text-gray-400">{c.cidade}{c.estado ? ` - ${c.estado}` : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal detalhe pedido */}
      {detalhe && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono text-xs text-gray-400 mb-1">{detalhe.numero}</p>
                <h3 className="text-lg font-semibold text-gray-800">{detalhe.cliente_nome}</h3>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs ${statusCores[detalhe.status]}`}>{detalhe.status}</span>
            </div>

            {/* Andamento */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-3">Andamento</p>
              <div className="flex items-center gap-1 flex-wrap">
                {['Pendente', 'Confirmado', 'Em Separação', 'Despachado', 'Entregue'].map((etapa, i) => {
                  const etapas = ['Pendente', 'Confirmado', 'Em Separação', 'Despachado', 'Entregue']
                  const idx = etapas.indexOf(detalhe.status)
                  const ativo = i <= idx
                  return (
                    <div key={etapa} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${ativo ? 'bg-gray-800' : 'bg-gray-200'}`} />
                      <span className={`text-xs ${ativo ? 'text-gray-700' : 'text-gray-300'}`}>{etapa}</span>
                      {i < 4 && <div className={`w-4 h-px ${i < idx ? 'bg-gray-400' : 'bg-gray-200'}`} />}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><p className="text-gray-400">Produto</p><p className="text-gray-700">{detalhe.produto}</p></div>
              <div><p className="text-gray-400">Código SKU</p><p className="font-mono text-gray-700">{detalhe.produto_codigo || '—'}</p></div>
              <div><p className="text-gray-400">Quantidade</p><p className="text-gray-700">{detalhe.quantidade} {detalhe.unidade}</p></div>
              <div><p className="text-gray-400">Valor Unit.</p><p className="text-gray-700">R$ {Number(detalhe.valor_unit).toFixed(2)}</p></div>
              <div><p className="text-gray-400">Valor Total</p><p className="text-gray-700 font-medium">R$ {Number(detalhe.valor_total).toFixed(2)}</p></div>
              <div><p className="text-gray-400">Forma Pagamento</p><p className="text-gray-700">{detalhe.forma_pagamento || '—'}</p></div>
              <div><p className="text-gray-400">Parcelas</p><p className="text-gray-700">{detalhe.parcelas}x de R$ {Number(detalhe.valor_parcela || 0).toFixed(2)}</p></div>
              <div><p className="text-gray-400">Prazo de Entrega</p><p className="text-gray-700">{detalhe.prazo_entrega || '—'}</p></div>
              <div className="col-span-2"><p className="text-gray-400">Endereço de Entrega</p><p className="text-gray-700">{detalhe.endereco_entrega || '—'}</p></div>
              <div><p className="text-gray-400">Criado por</p><p className="text-gray-700">{detalhe.criado_por || '—'}</p></div>
              <div><p className="text-gray-400">Data</p><p className="text-gray-700">{new Date(detalhe.created_at).toLocaleDateString('pt-BR')}</p></div>
              {detalhe.observacoes && <div className="col-span-2"><p className="text-gray-400">Observações</p><p className="text-gray-700">{detalhe.observacoes}</p></div>}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setDetalhe(null)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Fechar</button>
              {detalhe.status === 'Pendente' && <button onClick={() => alterarStatus(detalhe.id, 'Confirmado')} className="flex-1 bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700">Confirmar</button>}
              {detalhe.status === 'Confirmado' && <button onClick={() => alterarStatus(detalhe.id, 'Em Separação')} className="flex-1 bg-purple-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-purple-700">Separar</button>}
              {detalhe.status === 'Em Separação' && <button onClick={() => alterarStatus(detalhe.id, 'Despachado')} className="flex-1 bg-teal-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-teal-700">Despachar</button>}
              {detalhe.status === 'Despachado' && <button onClick={() => alterarStatus(detalhe.id, 'Entregue')} className="flex-1 bg-green-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-green-700">Entregar</button>}
            </div>
          </div>
        </div>
      )}

      {/* Modal novo pedido */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Novo Pedido</h3>
            <p className="text-sm text-gray-400 mb-6">Criado por: {usuario?.nome}</p>

            {/* Busca produto */}
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Produto</p>
              <div className="flex gap-2 mb-3">
                <input type="text" placeholder="Código SKU ou código de barras" value={codigoBusca} onChange={(e) => setCodigoBusca(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscarProduto()} className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                <button onClick={buscarProduto} className="bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">{buscando ? '...' : 'Buscar'}</button>
              </div>
              {produtoEncontrado && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">Produto encontrado</p>
                  <p className="text-sm font-medium text-gray-800">{produtoEncontrado.nome}</p>
                  <p className="text-xs text-gray-500">{produtoEncontrado.codigo} · Estoque: {produtoEncontrado.quantidade} {produtoEncontrado.unidade}</p>
                </div>
              )}
            </div>

            {produtoEncontrado && (
              <div className="flex flex-col gap-6">

                {/* Cliente */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Cliente</p>
                  <select value={novo.cliente_id} onChange={(e) => {
                    const c = clientes.find(c => c.id === e.target.value)
                    setClienteSelecionado(c)
                    setNovo({ ...novo, cliente_id: e.target.value, endereco_entrega: c?.endereco || '' })
                  }} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                    <option value="">Selecione o cliente</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.razao_social} {c.cnpj ? `· ${c.cnpj}` : ''}</option>)}
                  </select>
                </div>

                {/* Quantidade e valor */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Valores</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Quantidade</label>
                      <input type="number" value={novo.quantidade} onChange={(e) => setNovo({ ...novo, quantidade: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Valor Unit. (R$)</label>
                      <input type="number" value={novo.valor_unit} onChange={(e) => setNovo({ ...novo, valor_unit: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                    <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Valor Total</p>
                      <p className="text-lg font-semibold text-gray-800">R$ {((Number(novo.quantidade) || 0) * (Number(novo.valor_unit) || 0)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Entrega */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Entrega</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Prazo de Entrega</label>
                      <input type="date" value={novo.prazo_entrega} onChange={(e) => setNovo({ ...novo, prazo_entrega: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-500 mb-1 block">Endereço de Entrega</label>
                      <input type="text" value={novo.endereco_entrega} onChange={(e) => setNovo({ ...novo, endereco_entrega: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Pagamento */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Condições de Pagamento</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Forma de Pagamento</label>
                      <select value={novo.forma_pagamento} onChange={(e) => setNovo({ ...novo, forma_pagamento: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                        <option value="">Selecione</option>
                        <option>Boleto</option>
                        <option>PIX</option>
                        <option>Cartão de Crédito</option>
                        <option>Transferência</option>
                        <option>Dinheiro</option>
                        <option>A prazo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Parcelas</label>
                      <input type="number" value={novo.parcelas} onChange={(e) => setNovo({ ...novo, parcelas: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Data de Vencimento</label>
                      <input type="date" value={novo.data_vencimento} onChange={(e) => setNovo({ ...novo, data_vencimento: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Observações</p>
                  <textarea value={novo.observacoes} onChange={(e) => setNovo({ ...novo, observacoes: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 resize-none" />
                </div>

              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModal(false); setProdutoEncontrado(null); setCodigoBusca('') }} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              {produtoEncontrado && novo.cliente_id && (
                <button onClick={criarPedido} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Criar Pedido</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal novo cliente */}
      {modalCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Novo Cliente</h3>
            <p className="text-sm text-gray-400 mb-6">Código gerado automaticamente</p>
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Identificação</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Razão Social', key: 'razao_social' },
                    { label: 'Nome Fantasia', key: 'nome_fantasia' },
                    { label: 'CNPJ', key: 'cnpj', placeholder: '00.000.000/0000-00' },
                    { label: 'Email', key: 'email' },
                    { label: 'Telefone', key: 'telefone' },
                    { label: 'Contato', key: 'contato' },
                  ].map(campo => (
                    <div key={campo.key}>
                      <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                      <input type="text" placeholder={campo.placeholder || ''} value={novoCliente[campo.key]} onChange={(e) => setNovoCliente({ ...novoCliente, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Endereço</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'CEP', key: 'cep' },
                    { label: 'Cidade', key: 'cidade' },
                    { label: 'Estado', key: 'estado', placeholder: 'Ex: SP' },
                  ].map(campo => (
                    <div key={campo.key}>
                      <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                      <input type="text" placeholder={campo.placeholder || ''} value={novoCliente[campo.key]} onChange={(e) => setNovoCliente({ ...novoCliente, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500 mb-1 block">Endereço completo</label>
                    <input type="text" value={novoCliente.endereco} onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Observações</p>
                <textarea value={novoCliente.observacoes} onChange={(e) => setNovoCliente({ ...novoCliente, observacoes: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalCliente(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarCliente} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Cadastrar Cliente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}