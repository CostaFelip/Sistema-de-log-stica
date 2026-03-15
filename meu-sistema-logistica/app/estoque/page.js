'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const niveisGerentes = ['Administrador', 'Suporte', 'Gerente Geral', 'Gerente de Estoque', 'Gerente Financeiro', 'Gerente de Setor']

export default function Estoque() {
  const { usuario, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [produtos, setProdutos] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [setores, setSetores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(false)
  const [detalhe, setDetalhe] = useState(null)
  const [novo, setNovo] = useState({
    nome: '', categoria: '', setor_id: '', empresa_id: '',
    quantidade: '', unidade: '', valor: '', codigo_barras: '',
    armazem: '', corredor: '', armario: '', prateleira: '', posicao: ''
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
    const isGerente = niveisGerentes.includes(usuario?.nivel)

    let query = supabase
      .from('produtos')
      .select('*, empresas(nome), setores(nome)')
      .order('created_at', { ascending: false })

    if (!isGerente && usuario?.setor_id) {
      query = query.eq('setor_id', usuario.setor_id)
    }

    const [{ data: prods }, { data: emps }, { data: sets }] = await Promise.all([
      query,
      supabase.from('empresas').select('*'),
      supabase.from('setores').select('*'),
    ])

    if (prods) setProdutos(prods)
    if (emps) setEmpresas(emps)
    if (sets) setSetores(sets)
    setLoading(false)
  }

  async function gerarCodigo() {
    const ano = new Date().getFullYear()
    const { count } = await supabase.from('produtos').select('*', { count: 'exact', head: true })
    return `PRD-${ano}-${String((count || 0) + 1).padStart(4, '0')}`
  }

  async function adicionarProduto() {
    if (!novo.nome || !novo.quantidade) return
    const codigo = await gerarCodigo()
    const { error } = await supabase.from('produtos').insert([{
      ...novo,
      codigo,
      quantidade: Number(novo.quantidade),
      valor: Number(novo.valor),
    }])
    if (!error) {
      setNovo({
        nome: '', categoria: '', setor_id: '', empresa_id: '',
        quantidade: '', unidade: '', valor: '', codigo_barras: '',
        armazem: '', corredor: '', armario: '', prateleira: '', posicao: ''
      })
      setModal(false)
      carregarDados()
    }
  }

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.codigo || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.codigo_barras || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.setores?.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.empresas?.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.armazem || '').toLowerCase().includes(busca.toLowerCase())
  )

  const isGerente = niveisGerentes.includes(usuario?.nivel)

  if (authLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">Carregando...</p></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Dashboard</a>
          <a href="/compras" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Compras</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="/recebimento" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Recebimento</a>
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
          {!isGerente && usuario?.setor_id && (
            <p className="text-xs text-blue-600 mb-3">Visualizando seu setor</p>
          )}
          <button onClick={handleLogout} className="w-full text-left text-sm text-red-500 hover:text-red-600">Sair</button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Estoque</h2>
            {!isGerente && <p className="text-sm text-gray-400 mt-1">Mostrando produtos do seu setor</p>}
          </div>
          <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            + Novo Produto
          </button>
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total de Produtos</p>
            <p className="text-2xl font-semibold text-gray-800">{produtos.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Valor em Estoque</p>
            <p className="text-2xl font-semibold text-gray-800">R$ {produtos.reduce((acc, p) => acc + (p.quantidade * p.valor), 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Estoque Baixo</p>
            <p className="text-2xl font-semibold text-red-500">{produtos.filter(p => p.quantidade <= 10).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Sem Estoque</p>
            <p className="text-2xl font-semibold text-gray-400">{produtos.filter(p => p.quantidade === 0).length}</p>
          </div>
        </div>

        <input
          type="text"
          placeholder="Buscar por nome, código, setor, empresa ou armazém..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 mb-6"
        />

        {loading ? (
          <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Carregando...</p></div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Código</th>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Categoria</th>
                  <th className="px-6 py-4 font-medium">Localização</th>
                  <th className="px-6 py-4 font-medium">Setor</th>
                  <th className="px-6 py-4 font-medium">Empresa</th>
                  <th className="px-6 py-4 font-medium">Quantidade</th>
                  <th className="px-6 py-4 font-medium">Valor Unit.</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {filtrados.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-12 text-center text-gray-400">Nenhum produto encontrado</td></tr>
                ) : filtrados.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setDetalhe(p)}>
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-medium text-gray-800">{p.codigo}</p>
                      {p.codigo_barras && <p className="font-mono text-xs text-gray-400">{p.codigo_barras}</p>}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{p.nome}</td>
                    <td className="px-6 py-4">{p.categoria}</td>
                    <td className="px-6 py-4">
                      {p.armazem || p.corredor || p.armario ? (
                        <div>
                          {p.armazem && <p className="text-xs text-gray-600">{p.armazem}</p>}
                          {p.corredor && <p className="text-xs text-gray-500">Corredor {p.corredor}</p>}
                          {p.armario && <p className="text-xs text-gray-500">Armário {p.armario}</p>}
                          {p.prateleira && <p className="text-xs text-gray-500">Prat. {p.prateleira}</p>}
                          {p.posicao && <p className="text-xs text-gray-400">{p.posicao}</p>}
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4">{p.setores?.nome}</td>
                    <td className="px-6 py-4">{p.empresas?.nome}</td>
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
        )}
      </main>

      {/* Modal detalhe produto */}
      {detalhe && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono text-xs text-gray-400 mb-1">{detalhe.codigo}</p>
                <h3 className="text-lg font-semibold text-gray-800">{detalhe.nome}</h3>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs ${detalhe.quantidade === 0 ? 'bg-gray-100 text-gray-500' : detalhe.quantidade <= 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                {detalhe.quantidade === 0 ? 'Zerado' : detalhe.quantidade <= 10 ? 'Estoque Baixo' : 'Normal'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><p className="text-gray-400">Categoria</p><p className="text-gray-700">{detalhe.categoria || '—'}</p></div>
              <div><p className="text-gray-400">Código de Barras</p><p className="font-mono text-gray-700">{detalhe.codigo_barras || '—'}</p></div>
              <div><p className="text-gray-400">Quantidade</p><p className="text-gray-700 font-medium">{detalhe.quantidade} {detalhe.unidade}</p></div>
              <div><p className="text-gray-400">Valor Unitário</p><p className="text-gray-700">R$ {Number(detalhe.valor).toFixed(2)}</p></div>
              <div><p className="text-gray-400">Valor Total</p><p className="text-gray-700 font-medium">R$ {(detalhe.quantidade * detalhe.valor).toFixed(2)}</p></div>
              <div><p className="text-gray-400">Setor</p><p className="text-gray-700">{detalhe.setores?.nome || '—'}</p></div>
              <div><p className="text-gray-400">Empresa</p><p className="text-gray-700">{detalhe.empresas?.nome || '—'}</p></div>
            </div>

            {(detalhe.armazem || detalhe.corredor || detalhe.armario || detalhe.prateleira || detalhe.posicao) && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-xs font-medium text-blue-600 mb-2">Localização Física</p>
                <div className="flex items-center gap-2 text-sm text-blue-800 flex-wrap">
                  {detalhe.armazem && <span className="bg-blue-100 px-2 py-1 rounded-md">{detalhe.armazem}</span>}
                  {detalhe.armazem && detalhe.corredor && <span className="text-blue-400">›</span>}
                  {detalhe.corredor && <span className="bg-blue-100 px-2 py-1 rounded-md">Corredor {detalhe.corredor}</span>}
                  {detalhe.corredor && detalhe.armario && <span className="text-blue-400">›</span>}
                  {detalhe.armario && <span className="bg-blue-100 px-2 py-1 rounded-md">Armário {detalhe.armario}</span>}
                  {detalhe.armario && detalhe.prateleira && <span className="text-blue-400">›</span>}
                  {detalhe.prateleira && <span className="bg-blue-100 px-2 py-1 rounded-md">Prateleira {detalhe.prateleira}</span>}
                  {detalhe.prateleira && detalhe.posicao && <span className="text-blue-400">›</span>}
                  {detalhe.posicao && <span className="bg-blue-100 px-2 py-1 rounded-md">{detalhe.posicao}</span>}
                </div>
              </div>
            )}

            <button onClick={() => setDetalhe(null)} className="w-full border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Fechar</button>
          </div>
        </div>
      )}

      {/* Modal novo produto */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Novo Produto</h3>
            <p className="text-sm text-gray-400 mb-6">Código SKU gerado automaticamente</p>

            <div className="flex flex-col gap-6">

              {/* Dados básicos */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Informações do Produto</p>
                <div className="grid grid-cols-2 gap-3">
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
                      <input type={campo.type} value={novo[campo.key]} onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Empresa</label>
                    <select value={novo.empresa_id} onChange={(e) => setNovo({ ...novo, empresa_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                      <option value="">Selecione a empresa</option>
                      {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Setor</label>
                    <select value={novo.setor_id} onChange={(e) => setNovo({ ...novo, setor_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                      <option value="">Selecione o setor</option>
                      {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Localização Física</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Armazém', key: 'armazem', placeholder: 'Ex: Armazém 1' },
                    { label: 'Corredor', key: 'corredor', placeholder: 'Ex: A, B, C' },
                    { label: 'Armário', key: 'armario', placeholder: 'Ex: A-12' },
                    { label: 'Prateleira', key: 'prateleira', placeholder: 'Ex: Prateleira 2' },
                    { label: 'Posição (gaveta, bin)', key: 'posicao', placeholder: 'Ex: Gaveta 3, Bin 05' },
                  ].map(campo => (
                    <div key={campo.key}>
                      <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                      <input type="text" placeholder={campo.placeholder} value={novo[campo.key]} onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                </div>

                {/* Preview localização */}
                {(novo.armazem || novo.corredor || novo.armario) && (
                  <div className="mt-3 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 mb-1">Preview da localização</p>
                    <div className="flex items-center gap-2 text-sm text-blue-800 flex-wrap">
                      {novo.armazem && <span className="bg-blue-100 px-2 py-1 rounded-md">{novo.armazem}</span>}
                      {novo.armazem && novo.corredor && <span className="text-blue-400">›</span>}
                      {novo.corredor && <span className="bg-blue-100 px-2 py-1 rounded-md">Corredor {novo.corredor}</span>}
                      {novo.corredor && novo.armario && <span className="text-blue-400">›</span>}
                      {novo.armario && <span className="bg-blue-100 px-2 py-1 rounded-md">Armário {novo.armario}</span>}
                      {novo.armario && novo.prateleira && <span className="text-blue-400">›</span>}
                      {novo.prateleira && <span className="bg-blue-100 px-2 py-1 rounded-md">Prateleira {novo.prateleira}</span>}
                      {novo.prateleira && novo.posicao && <span className="text-blue-400">›</span>}
                      {novo.posicao && <span className="bg-blue-100 px-2 py-1 rounded-md">{novo.posicao}</span>}
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarProduto} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}