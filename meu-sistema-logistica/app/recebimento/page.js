'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const statusCores = {
  Pendente: 'bg-amber-50 text-amber-600',
  Conferido: 'bg-blue-50 text-blue-600',
  'Enviado ao Financeiro': 'bg-green-50 text-green-600',
  Cancelada: 'bg-red-50 text-red-500',
}

const niveisPermitidosCancelar = ['Administrador', 'Gerente Geral', 'Gerente Financeiro', 'Gerente de Estoque']

export default function Recebimento() {
  const { usuario, loading: authLoading, logout } = useAuth()
    async function handleLogout() {
      await logout()
      router.push('/')
    }
  const router = useRouter()
  const [aba, setAba] = useState('notas')
  const [recebimentos, setRecebimentos] = useState([])
  const [produtos, setProdutos] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [setores, setSetores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [modalProduto, setModalProduto] = useState(false)
  const [modalFornecedor, setModalFornecedor] = useState(false)
  const [modalDuplicata, setModalDuplicata] = useState(null)
  const [modalCancelamento, setModalCancelamento] = useState(null)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [detalhe, setDetalhe] = useState(null)
  const [filtro, setFiltro] = useState('Todos')
  const [codigoBusca, setCodigoBusca] = useState('')
  const [codigoFornecedor, setCodigoFornecedor] = useState('')
  const [produtoEncontrado, setProdutoEncontrado] = useState(null)
  const [fornecedorEncontrado, setFornecedorEncontrado] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [buscandoFornecedor, setBuscandoFornecedor] = useState(false)
  const [usarValorTotal, setUsarValorTotal] = useState(false)
  const [novo, setNovo] = useState({
    nota: '', serie_nota: '', chave_acesso: '',
    data_competencia: '', natureza_operacao: '',
    fornecedor: '', razao_social: '', cnpj_fornecedor: '',
    quantidade: '', valorUnit: '', valor_total_direto: '',
    valor_frete: '', valor_seguro: '', desconto: '',
    forma_pagamento: '', parcelas: '1', data_vencimento: '',
    centro_custo: '', plano_contas: '',
    setor_id: '', empresa_id: ''
  })
  const [novoProduto, setNovoProduto] = useState({
    nome: '', categoria: '', quantidade: '', unidade: '', valor: '', codigo_barras: '', setor_id: '', empresa_id: ''
  })
  const [novoFornecedor, setNovoFornecedor] = useState({
    razao_social: '', nome_fantasia: '', cnpj: '',
    email: '', telefone: '', contato: '',
    endereco: '', cidade: '', estado: '', cep: '',
    categoria: '', observacoes: ''
  })

  useEffect(() => {
    if (!authLoading && !usuario) router.push('/')
    if (!authLoading && usuario) carregarDados()
  }, [usuario, authLoading])

  async function carregarDados() {
    setLoading(true)
    const [{ data: recs }, { data: prods }, { data: fors }, { data: emps }, { data: sets }] = await Promise.all([
      supabase.from('recebimentos').select('*, empresas(nome), setores(nome)').order('created_at', { ascending: false }),
      supabase.from('produtos').select('*, empresas(nome), setores(nome)').order('created_at', { ascending: false }),
      supabase.from('fornecedores').select('*').order('created_at', { ascending: false }),
      supabase.from('empresas').select('*'),
      supabase.from('setores').select('*'),
    ])
    if (recs) setRecebimentos(recs)
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
      setNovo(prev => ({ ...prev, setor_id: data.setor_id, empresa_id: data.empresa_id, valorUnit: data.valor }))
    } else {
      setProdutoEncontrado(null)
      alert('Produto não encontrado.')
    }
    setBuscando(false)
  }

  async function buscarFornecedor() {
    if (!codigoFornecedor) return
    setBuscandoFornecedor(true)
    const { data } = await supabase
      .from('fornecedores')
      .select('*')
      .or(`cnpj.eq.${codigoFornecedor},codigo.eq.${codigoFornecedor}`)
      .single()
    if (data) {
      setFornecedorEncontrado(data)
      setNovo(prev => ({
        ...prev,
        fornecedor: data.nome_fantasia || data.razao_social,
        razao_social: data.razao_social,
        cnpj_fornecedor: data.cnpj,
      }))
    } else {
      setFornecedorEncontrado(null)
      alert('Fornecedor não encontrado.')
    }
    setBuscandoFornecedor(false)
  }

  function calcularValorTotal() {
    if (usarValorTotal) return Number(novo.valor_total_direto || 0)
    const qtd = Number(novo.quantidade || 0)
    const valorUnit = Number(novo.valorUnit || 0)
    const frete = Number(novo.valor_frete || 0)
    const seguro = Number(novo.valor_seguro || 0)
    const desconto = Number(novo.desconto || 0)
    return (qtd * valorUnit) + frete + seguro - desconto
  }

  async function lancarNota() {
    if (!novo.nota || !produtoEncontrado) return
    const valorTotal = calcularValorTotal()
    const valorParcela = valorTotal / Number(novo.parcelas || 1)
    const { data: notaInserida, error } = await supabase.from('recebimentos').insert([{
      nota: novo.nota,
      serie_nota: novo.serie_nota,
      chave_acesso: novo.chave_acesso,
      data_competencia: novo.data_competencia || null,
      natureza_operacao: novo.natureza_operacao,
      fornecedor: novo.fornecedor,
      razao_social: novo.razao_social,
      cnpj_fornecedor: novo.cnpj_fornecedor,
      produto: produtoEncontrado.nome,
      produto_codigo: produtoEncontrado.codigo,
      quantidade: usarValorTotal ? null : Number(novo.quantidade),
      unidade: produtoEncontrado.unidade,
      valor_unit: usarValorTotal ? null : Number(novo.valorUnit),
      valor_total: valorTotal,
      valor_frete: Number(novo.valor_frete || 0),
      valor_seguro: Number(novo.valor_seguro || 0),
      desconto: Number(novo.desconto || 0),
      forma_pagamento: novo.forma_pagamento,
      parcelas: Number(novo.parcelas || 1),
      valor_parcela: valorParcela,
      data_vencimento: novo.data_vencimento || null,
      centro_custo: novo.centro_custo,
      plano_contas: novo.plano_contas,
      setor_id: novo.setor_id || null,
      empresa_id: novo.empresa_id || null,
      lancado_por: usuario.nome,
    }]).select().single()

    if (!error && notaInserida) {
      setModal(false)
      setModalDuplicata(notaInserida)
      resetNovo()
      carregarDados()
    }
  }

  function resetNovo() {
    setNovo({
      nota: '', serie_nota: '', chave_acesso: '',
      data_competencia: '', natureza_operacao: '',
      fornecedor: '', razao_social: '', cnpj_fornecedor: '',
      quantidade: '', valorUnit: '', valor_total_direto: '',
      valor_frete: '', valor_seguro: '', desconto: '',
      forma_pagamento: '', parcelas: '1', data_vencimento: '',
      centro_custo: '', plano_contas: '',
      setor_id: '', empresa_id: ''
    })
    setProdutoEncontrado(null)
    setFornecedorEncontrado(null)
    setCodigoBusca('')
    setCodigoFornecedor('')
    setUsarValorTotal(false)
  }

  async function gerarDuplicata(nota) {
    const numero = `DUP-${nota.nota}-${Date.now().toString().slice(-4)}`
    await supabase.from('duplicatas').insert([{
      numero,
      nota_id: nota.id,
      fornecedor: nota.razao_social || nota.fornecedor,
      cnpj_fornecedor: nota.cnpj_fornecedor,
      valor_total: nota.valor_total,
      valor_parcela: nota.valor_parcela,
      parcelas: nota.parcelas,
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: nota.data_vencimento,
      forma_pagamento: nota.forma_pagamento,
      empresa_id: nota.empresa_id,
      criado_por: usuario.nome,
    }])
    setModalDuplicata(null)
  }

  async function cancelarNota(id) {
    if (!motivoCancelamento) return
    await supabase.from('recebimentos').update({
      status: 'Cancelada',
      cancelado_por: usuario.nome,
      motivo_cancelamento: motivoCancelamento,
      data_cancelamento: new Date().toISOString(),
    }).eq('id', id)
    await supabase.from('duplicatas').update({
      status: 'Cancelada',
      cancelado_por: usuario.nome,
      motivo_cancelamento: motivoCancelamento,
      data_cancelamento: new Date().toISOString(),
    }).eq('nota_id', id)
    setModalCancelamento(null)
    setMotivoCancelamento('')
    setDetalhe(null)
    carregarDados()
  }

  async function alterarStatus(id, novoStatus) {
    await supabase.from('recebimentos').update({ status: novoStatus }).eq('id', id)
    setDetalhe(null)
    carregarDados()
  }

  async function gerarCodigoProduto() {
    const ano = new Date().getFullYear()
    const { count } = await supabase.from('produtos').select('*', { count: 'exact', head: true })
    return `PRD-${ano}-${String((count || 0) + 1).padStart(4, '0')}`
  }

  async function adicionarProduto() {
    if (!novoProduto.nome || !novoProduto.quantidade) return
    const codigo = await gerarCodigoProduto()
    const { error } = await supabase.from('produtos').insert([{
      ...novoProduto,
      codigo,
      quantidade: Number(novoProduto.quantidade),
      valor: Number(novoProduto.valor),
    }])
    if (!error) {
      setNovoProduto({ nome: '', categoria: '', quantidade: '', unidade: '', valor: '', codigo_barras: '', setor_id: '', empresa_id: '' })
      setModalProduto(false)
      carregarDados()
    }
  }

  async function gerarCodigoFornecedor() {
    const { count } = await supabase.from('fornecedores').select('*', { count: 'exact', head: true })
    return `FOR-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`
  }

  async function adicionarFornecedor() {
    if (!novoFornecedor.razao_social || !novoFornecedor.cnpj) return
    const codigo = await gerarCodigoFornecedor()
    const { error } = await supabase.from('fornecedores').insert([{ ...novoFornecedor, codigo }])
    if (!error) {
      setNovoFornecedor({ razao_social: '', nome_fantasia: '', cnpj: '', email: '', telefone: '', contato: '', endereco: '', cidade: '', estado: '', cep: '', categoria: '', observacoes: '' })
      setModalFornecedor(false)
      carregarDados()
    }
  }

  const filtrados = filtro === 'Todos' ? recebimentos : recebimentos.filter(r => r.status === filtro)
  const podeCancelar = niveisPermitidosCancelar.includes(usuario?.nivel)

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
          <a href="/recebimento" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
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
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recebimento</h2>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'notas', label: 'Notas Fiscais' },
            { key: 'produtos', label: 'Produtos' },
            { key: 'fornecedores', label: 'Fornecedores' },
          ].map(a => (
            <button key={a.key} onClick={() => setAba(a.key)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${aba === a.key ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{a.label}</button>
          ))}
        </div>

        {/* Aba Notas Fiscais */}
        {aba === 'notas' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">Gerencie as notas fiscais de entrada</p>
              <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">+ Lançar Nota Fiscal</button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Pendentes</p>
                <p className="text-2xl font-semibold text-amber-600">{recebimentos.filter(r => r.status === 'Pendente').length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Conferidos</p>
                <p className="text-2xl font-semibold text-blue-600">{recebimentos.filter(r => r.status === 'Conferido').length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">No Financeiro</p>
                <p className="text-2xl font-semibold text-green-600">{recebimentos.filter(r => r.status === 'Enviado ao Financeiro').length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Canceladas</p>
                <p className="text-2xl font-semibold text-red-500">{recebimentos.filter(r => r.status === 'Cancelada').length}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              {['Todos', 'Pendente', 'Conferido', 'Enviado ao Financeiro', 'Cancelada'].map(f => (
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
                      <th className="px-6 py-4 font-medium">Nota Fiscal</th>
                      <th className="px-6 py-4 font-medium">Fornecedor</th>
                      <th className="px-6 py-4 font-medium">Produto</th>
                      <th className="px-6 py-4 font-medium">Valor Total</th>
                      <th className="px-6 py-4 font-medium">Lançado por</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {filtrados.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Nenhuma nota lançada</td></tr>
                    ) : filtrados.map(r => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setDetalhe(r)}>
                        <td className="px-6 py-4 font-medium text-gray-800">{r.nota}</td>
                        <td className="px-6 py-4">{r.razao_social || r.fornecedor}</td>
                        <td className="px-6 py-4">
                          <p>{r.produto}</p>
                          <p className="font-mono text-xs text-gray-400">{r.produto_codigo}</p>
                        </td>
                        <td className="px-6 py-4">R$ {Number(r.valor_total).toFixed(2)}</td>
                        <td className="px-6 py-4">{r.lancado_por || '—'}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${statusCores[r.status]}`}>{r.status}</span></td>
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-2">
                            {r.status === 'Pendente' && <button onClick={() => alterarStatus(r.id, 'Conferido')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100">Conferir</button>}
                            {r.status === 'Conferido' && <button onClick={() => alterarStatus(r.id, 'Enviado ao Financeiro')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Enviar ao Financeiro</button>}
                            {r.status !== 'Cancelada' && podeCancelar && (
                              <button onClick={() => setModalCancelamento(r)} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100">Cancelar</button>
                            )}
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

        {/* Aba Produtos */}
        {aba === 'produtos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">Cadastre e gerencie produtos</p>
              <button onClick={() => setModalProduto(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">+ Novo Produto</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-4 font-medium">Código</th>
                    <th className="px-6 py-4 font-medium">Produto</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium">Quantidade</th>
                    <th className="px-6 py-4 font-medium">Valor Unit.</th>
                    <th className="px-6 py-4 font-medium">Setor</th>
                    <th className="px-6 py-4 font-medium">Empresa</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {produtos.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Nenhum produto cadastrado</td></tr>
                  ) : produtos.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4"><p className="font-mono text-xs font-medium text-gray-800">{p.codigo}</p>{p.codigo_barras && <p className="font-mono text-xs text-gray-400">{p.codigo_barras}</p>}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{p.nome}</td>
                      <td className="px-6 py-4">{p.categoria}</td>
                      <td className="px-6 py-4">{p.quantidade} {p.unidade}</td>
                      <td className="px-6 py-4">R$ {Number(p.valor).toFixed(2)}</td>
                      <td className="px-6 py-4">{p.setores?.nome}</td>
                      <td className="px-6 py-4">{p.empresas?.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aba Fornecedores */}
        {aba === 'fornecedores' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">Cadastre e gerencie fornecedores</p>
              <button onClick={() => setModalFornecedor(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">+ Novo Fornecedor</button>
            </div>
            <div className="flex flex-col gap-3">
              {fornecedores.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-400 text-sm">Nenhum fornecedor cadastrado</p>
                </div>
              ) : fornecedores.map(f => (
                <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs text-gray-400 mb-1">{f.codigo}</p>
                      <p className="font-medium text-gray-800">{f.razao_social}</p>
                      {f.nome_fantasia && <p className="text-sm text-gray-400">{f.nome_fantasia}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{f.cnpj}</p>
                      <p className="text-xs text-gray-400">{f.cidade}{f.estado ? ` - ${f.estado}` : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal detalhe nota */}
      {detalhe && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">NF {detalhe.nota}</h3>
              <span className={`px-2 py-1 rounded-md text-xs ${statusCores[detalhe.status]}`}>{detalhe.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><p className="text-gray-400">Razão Social</p><p className="text-gray-700">{detalhe.razao_social || '—'}</p></div>
              <div><p className="text-gray-400">CNPJ</p><p className="text-gray-700">{detalhe.cnpj_fornecedor || '—'}</p></div>
              <div><p className="text-gray-400">Produto</p><p className="text-gray-700">{detalhe.produto}</p></div>
              <div><p className="text-gray-400">Código SKU</p><p className="font-mono text-gray-700">{detalhe.produto_codigo || '—'}</p></div>
              <div><p className="text-gray-400">Quantidade</p><p className="text-gray-700">{detalhe.quantidade ? `${detalhe.quantidade} ${detalhe.unidade}` : '—'}</p></div>
              <div><p className="text-gray-400">Valor Total</p><p className="text-gray-700 font-medium">R$ {Number(detalhe.valor_total).toFixed(2)}</p></div>
              <div><p className="text-gray-400">Forma de Pagamento</p><p className="text-gray-700">{detalhe.forma_pagamento || '—'}</p></div>
              <div><p className="text-gray-400">Parcelas</p><p className="text-gray-700">{detalhe.parcelas}x de R$ {Number(detalhe.valor_parcela || 0).toFixed(2)}</p></div>
              <div><p className="text-gray-400">Vencimento</p><p className="text-gray-700">{detalhe.data_vencimento || '—'}</p></div>
              <div><p className="text-gray-400">Lançado por</p><p className="text-gray-700">{detalhe.lancado_por || '—'}</p></div>
              {detalhe.status === 'Cancelada' && <>
                <div><p className="text-gray-400">Cancelado por</p><p className="text-red-500">{detalhe.cancelado_por}</p></div>
                <div className="col-span-2"><p className="text-gray-400">Motivo</p><p className="text-red-500">{detalhe.motivo_cancelamento}</p></div>
              </>}
            </div>
            {detalhe.chave_acesso && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">Chave de Acesso SEFAZ</p>
                <p className="font-mono text-xs text-gray-700 break-all">{detalhe.chave_acesso}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setDetalhe(null)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Fechar</button>
              {detalhe.status === 'Pendente' && <button onClick={() => alterarStatus(detalhe.id, 'Conferido')} className="flex-1 bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700">Conferir</button>}
              {detalhe.status === 'Conferido' && <button onClick={() => alterarStatus(detalhe.id, 'Enviado ao Financeiro')} className="flex-1 bg-green-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-green-700">Enviar ao Financeiro</button>}
              {detalhe.status !== 'Cancelada' && podeCancelar && <button onClick={() => { setModalCancelamento(detalhe); setDetalhe(null) }} className="flex-1 bg-red-50 text-red-500 text-sm px-4 py-2.5 rounded-lg hover:bg-red-100">Cancelar Nota</button>}
            </div>
          </div>
        </div>
      )}

      {/* Modal cancelamento */}
      {modalCancelamento && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Cancelar Nota Fiscal</h3>
            <p className="text-sm text-gray-400 mb-6">NF {modalCancelamento.nota} · R$ {Number(modalCancelamento.valor_total).toFixed(2)}</p>
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-600">Esta ação também cancelará a duplicata no financeiro se houver.</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Motivo do cancelamento</label>
              <textarea
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                rows={3}
                placeholder="Descreva o motivo do cancelamento..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 resize-none"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModalCancelamento(null); setMotivoCancelamento('') }} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Voltar</button>
              <button onClick={() => cancelarNota(modalCancelamento.id)} className="flex-1 bg-red-500 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-red-600">Confirmar Cancelamento</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal duplicata */}
      {modalDuplicata && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Nota lançada com sucesso!</h3>
            <p className="text-sm text-gray-400 mb-6">Deseja gerar uma duplicata no módulo financeiro?</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <div className="flex justify-between mb-2"><span className="text-gray-500">Fornecedor</span><span className="text-gray-800">{modalDuplicata.razao_social || modalDuplicata.fornecedor}</span></div>
              <div className="flex justify-between mb-2"><span className="text-gray-500">Valor Total</span><span className="text-gray-800 font-medium">R$ {Number(modalDuplicata.valor_total).toFixed(2)}</span></div>
              <div className="flex justify-between mb-2"><span className="text-gray-500">Parcelas</span><span className="text-gray-800">{modalDuplicata.parcelas}x de R$ {Number(modalDuplicata.valor_parcela || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Vencimento</span><span className="text-gray-800">{modalDuplicata.data_vencimento || '—'}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalDuplicata(null)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Não, obrigado</button>
              <button onClick={() => gerarDuplicata(modalDuplicata)} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Gerar Duplicata</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal lançar nota */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Lançar Nota Fiscal de Entrada</h3>
            <p className="text-sm text-gray-400 mb-6">Lançado por: {usuario?.nome}</p>

            {/* Busca fornecedor */}
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Fornecedor</p>
              <div className="flex gap-2 mb-3">
                <input type="text" placeholder="CNPJ ou código FOR-" value={codigoFornecedor} onChange={(e) => setCodigoFornecedor(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscarFornecedor()} className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                <button onClick={buscarFornecedor} className="bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">{buscandoFornecedor ? '...' : 'Buscar'}</button>
              </div>
              {fornecedorEncontrado && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">Fornecedor encontrado</p>
                  <p className="text-sm font-medium text-gray-800">{fornecedorEncontrado.razao_social}</p>
                  <p className="text-xs text-gray-500">{fornecedorEncontrado.cnpj} · {fornecedorEncontrado.cidade} - {fornecedorEncontrado.estado}</p>
                </div>
              )}
              {!fornecedorEncontrado && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {[
                    { label: 'Razão Social', key: 'razao_social' },
                    { label: 'CNPJ', key: 'cnpj_fornecedor' },
                    { label: 'Nome / Apelido', key: 'fornecedor' },
                  ].map(campo => (
                    <div key={campo.key}>
                      <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                      <input type="text" value={novo[campo.key]} onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                  <p className="text-xs text-gray-500">{produtoEncontrado.codigo} · {produtoEncontrado.setores?.nome} · {produtoEncontrado.empresas?.nome}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">

              {/* Documentação Fiscal */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Documentação Fiscal</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Número da NF-e', key: 'nota' },
                    { label: 'Série da Nota', key: 'serie_nota' },
                    { label: 'Data de Competência', key: 'data_competencia', type: 'date' },
                    { label: 'Natureza da Operação', key: 'natureza_operacao', placeholder: 'Ex: Compra de Matéria-prima' },
                  ].map(campo => (
                    <div key={campo.key}>
                      <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                      <input type={campo.type || 'text'} placeholder={campo.placeholder || ''} value={novo[campo.key]} onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500 mb-1 block">Chave de Acesso SEFAZ</label>
                    <input type="text" placeholder="44 dígitos" value={novo.chave_acesso} onChange={(e) => setNovo({ ...novo, chave_acesso: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                  </div>
                </div>
              </div>

              {/* Valores */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Valores</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={usarValorTotal} onChange={(e) => setUsarValorTotal(e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm text-gray-500">Digitar apenas valor total</span>
                  </label>
                </div>
                {usarValorTotal ? (
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Valor Total (R$)</label>
                    <input type="number" value={novo.valor_total_direto} onChange={(e) => setNovo({ ...novo, valor_total_direto: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Quantidade', key: 'quantidade', type: 'number' },
                      { label: 'Valor Unitário (R$)', key: 'valorUnit', type: 'number' },
                      { label: 'Frete (R$)', key: 'valor_frete', type: 'number' },
                      { label: 'Seguro (R$)', key: 'valor_seguro', type: 'number' },
                      { label: 'Desconto (R$)', key: 'desconto', type: 'number' },
                    ].map(campo => (
                      <div key={campo.key}>
                        <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                        <input type={campo.type} value={novo[campo.key]} onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                      </div>
                    ))}
                    <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-center">
                      <p className="text-xs text-gray-400">Valor Total</p>
                      <p className="text-lg font-semibold text-gray-800">R$ {calcularValorTotal().toFixed(2)}</p>
                    </div>
                  </div>
                )}
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
                  {[
                    { label: 'Parcelas', key: 'parcelas', type: 'number' },
                    { label: 'Data de Vencimento', key: 'data_vencimento', type: 'date' },
                  ].map(campo => (
                    <div key={campo.key}>
                      <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                      <input type={campo.type} value={novo[campo.key]} onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Classificação */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Classificação</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Centro de Custo</label>
                    <select value={novo.setor_id} onChange={(e) => setNovo({ ...novo, setor_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                      <option value="">Selecione o setor</option>
                      {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Empresa</label>
                    <select value={novo.empresa_id} onChange={(e) => setNovo({ ...novo, empresa_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                      <option value="">Selecione a empresa</option>
                      {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500 mb-1 block">Plano de Contas</label>
                    <input type="text" placeholder="Ex: 1.01 - Compra de Matéria-prima" value={novo.plano_contas} onChange={(e) => setNovo({ ...novo, plano_contas: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModal(false); resetNovo() }} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={lancarNota} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Lançar Nota</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo produto */}
      {modalProduto && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Novo Produto</h3>
            <p className="text-sm text-gray-400 mb-6">Código SKU gerado automaticamente</p>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Nome do Produto', key: 'nome', type: 'text' },
                { label: 'Categoria', key: 'categoria', type: 'text' },
                { label: 'Quantidade', key: 'quantidade', type: 'number' },
                { label: 'Unidade (un, lt, m...)', key: 'unidade', type: 'text' },
                { label: 'Valor Unitário (R$)', key: 'valor', type: 'number' },
                { label: 'Código de Barras EAN (opcional)', key: 'codigo_barras', type: 'text' },
              ].map(campo => (
                <div key={campo.key}>
                  <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                  <input type={campo.type} value={novoProduto[campo.key]} onChange={(e) => setNovoProduto({ ...novoProduto, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Empresa</label>
                <select value={novoProduto.empresa_id} onChange={(e) => setNovoProduto({ ...novoProduto, empresa_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                  <option value="">Selecione a empresa</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Setor</label>
                <select value={novoProduto.setor_id} onChange={(e) => setNovoProduto({ ...novoProduto, setor_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                  <option value="">Selecione o setor</option>
                  {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalProduto(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarProduto} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo fornecedor */}
      {modalFornecedor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Novo Fornecedor</h3>
            <p className="text-sm text-gray-400 mb-6">Código gerado automaticamente</p>
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Identificação</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Razão Social', key: 'razao_social' },
                    { label: 'Nome Fantasia', key: 'nome_fantasia' },
                    { label: 'CNPJ', key: 'cnpj', placeholder: '00.000.000/0000-00' },
                    { label: 'Categoria', key: 'categoria', placeholder: 'Ex: Matéria-prima, EPI...' },
                  ].map(campo => (
                    <div key={campo.key}>
                      <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                      <input type="text" placeholder={campo.placeholder || ''} value={novoFornecedor[campo.key]} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Contato</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Email', key: 'email' },
                    { label: 'Telefone', key: 'telefone' },
                    { label: 'Nome do Contato', key: 'contato' },
                  ].map(campo => (
                    <div key={campo.key}>
                      <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                      <input type="text" value={novoFornecedor[campo.key]} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
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
                      <input type="text" placeholder={campo.placeholder || ''} value={novoFornecedor[campo.key]} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500 mb-1 block">Endereço completo</label>
                    <input type="text" value={novoFornecedor.endereco} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, endereco: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Observações</p>
                <textarea value={novoFornecedor.observacoes} onChange={(e) => setNovoFornecedor({ ...novoFornecedor, observacoes: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalFornecedor(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarFornecedor} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Cadastrar Fornecedor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}