'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const statusCores = {
  Ativo: 'bg-green-50 text-green-600',
  Inativo: 'bg-gray-100 text-gray-500',
}

const categoriasDisponiveis = [
  'Cabos', 'Metais', 'Parafusos e Fixação', 'EPIs',
  'Químicos e Lubrificantes', 'Elétrica', 'Hidráulica',
  'Ferramentas', 'Embalagens', 'Informática', 'Limpeza',
  'Matéria-prima', 'Alimentos', 'Uniformes', 'Outros'
]

export default function Fornecedores() {
  const { usuario, loading: authLoading } = useAuth()
  const router = useRouter()
  const [fornecedores, setFornecedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detalhe, setDetalhe] = useState(null)
  const [editando, setEditando] = useState(false)
  const [busca, setBusca] = useState('')
  const [buscaCnpj, setBuscaCnpj] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [novo, setNovo] = useState({
    razao_social: '', nome_fantasia: '', cnpj: '',
    email: '', telefone: '', contato: '',
    endereco: '', cidade: '', estado: '', cep: '',
    categoria: '', observacoes: '', categorias_produtos: []
  })

  useEffect(() => {
    if (!authLoading && !usuario) router.push('/')
    if (!authLoading && usuario) carregarDados()
  }, [usuario, authLoading])

  async function carregarDados() {
    setLoading(true)
    const { data } = await supabase
      .from('fornecedores')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setFornecedores(data)
    setLoading(false)
  }

  async function gerarCodigo() {
    const { count } = await supabase.from('fornecedores').select('*', { count: 'exact', head: true })
    return `FOR-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`
  }
  
async function salvarFornecedor() {
  if (!novo.razao_social || !novo.cnpj) return
  if (editando && detalhe?.id) {
    await supabase.from('fornecedores').update(novo).eq('id', detalhe.id)
  } else {
    const codigo = await gerarCodigo()
    await supabase.from('fornecedores').insert([{ ...novo, codigo }])
  }
  setNovo({
    razao_social: '', nome_fantasia: '', cnpj: '',
    email: '', telefone: '', contato: '',
    endereco: '', cidade: '', estado: '', cep: '',
    categoria: '', observacoes: '', categorias_produtos: []
  })
  setModal(false)
  setEditando(false)
  setDetalhe(null)
  carregarDados()
}

  async function buscarPorCnpj() {
    if (!buscaCnpj) return
    const { data } = await supabase.from('fornecedores').select('*').eq('cnpj', buscaCnpj).single()
    if (data) setDetalhe(data)
    else alert('Fornecedor não encontrado.')
  }

  async function alterarStatus(id, novoStatus) {
    await supabase.from('fornecedores').update({ status: novoStatus }).eq('id', id)
    setDetalhe(null)
    carregarDados()
  }

  function abrirEdicao(f) {
    setNovo({ ...f, categorias_produtos: f.categorias_produtos || [] })
    setEditando(true)
    setDetalhe(null)
    setModal(true)
  }

  function toggleCategoria(cat) {
    setNovo(prev => ({
      ...prev,
      categorias_produtos: prev.categorias_produtos.includes(cat)
        ? prev.categorias_produtos.filter(c => c !== cat)
        : [...prev.categorias_produtos, cat]
    }))
  }

  const todasCategorias = [...new Set(fornecedores.flatMap(f => f.categorias_produtos || []))]

  const filtrados = fornecedores.filter(f => {
    const matchBusca = f.razao_social.toLowerCase().includes(busca.toLowerCase()) ||
      (f.nome_fantasia || '').toLowerCase().includes(busca.toLowerCase()) ||
      (f.codigo || '').toLowerCase().includes(busca.toLowerCase()) ||
      (f.cnpj || '').includes(busca)
    const matchCategoria = !filtroCategoria || (f.categorias_produtos || []).includes(filtroCategoria)
    return matchBusca && matchCategoria
  })

  if (authLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">Carregando...</p></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Dashboard</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="/recebimento" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
          <a href="/fornecedores" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Fornecedores</a>
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
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Fornecedores</h2>
            <p className="text-sm text-gray-400 mt-1">Gerencie seus fornecedores e categorias de produtos</p>
          </div>
          <button onClick={() => { setEditando(false); setModal(true) }} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            + Novo Fornecedor
          </button>
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-semibold text-gray-800">{fornecedores.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Ativos</p>
            <p className="text-2xl font-semibold text-green-600">{fornecedores.filter(f => f.status === 'Ativo').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Categorias</p>
            <p className="text-2xl font-semibold text-blue-600">{todasCategorias.length}</p>
          </div>
        </div>

        {/* Busca por CNPJ */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-sm text-gray-500 mb-3">Busca rápida por CNPJ</p>
          <div className="flex gap-2">
            <input type="text" placeholder="00.000.000/0000-00" value={buscaCnpj} onChange={(e) => setBuscaCnpj(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscarPorCnpj()} className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
            <button onClick={buscarPorCnpj} className="bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Buscar</button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          <input type="text" placeholder="Buscar por nome, código ou CNPJ..." value={busca} onChange={(e) => setBusca(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
            <option value="">Todas as categorias</option>
            {categoriasDisponiveis.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Carregando...</p></div>
        ) : filtrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">Nenhum fornecedor encontrado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtrados.map(f => (
              <div key={f.id} onClick={() => setDetalhe(f)} className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-xs text-gray-400">{f.codigo}</p>
                      <span className={`px-2 py-0.5 rounded-md text-xs ${statusCores[f.status]}`}>{f.status}</span>
                    </div>
                    <p className="font-medium text-gray-800">{f.razao_social}</p>
                    {f.nome_fantasia && <p className="text-sm text-gray-400">{f.nome_fantasia}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{f.cnpj}</p>
                    <p className="text-xs text-gray-400">{f.cidade}{f.estado ? ` - ${f.estado}` : ''}</p>
                  </div>
                </div>
                {f.categorias_produtos && f.categorias_produtos.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {f.categorias_produtos.map(cat => (
                      <span key={cat} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs">{cat}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal detalhe */}
      {detalhe && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono text-xs text-gray-400 mb-1">{detalhe.codigo}</p>
                <h3 className="text-lg font-semibold text-gray-800">{detalhe.razao_social}</h3>
                {detalhe.nome_fantasia && <p className="text-sm text-gray-400">{detalhe.nome_fantasia}</p>}
              </div>
              <span className={`px-2 py-1 rounded-md text-xs ${statusCores[detalhe.status]}`}>{detalhe.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><p className="text-gray-400">CNPJ</p><p className="text-gray-700">{detalhe.cnpj}</p></div>
              <div><p className="text-gray-400">Categoria</p><p className="text-gray-700">{detalhe.categoria || '—'}</p></div>
              <div><p className="text-gray-400">Email</p><p className="text-gray-700">{detalhe.email || '—'}</p></div>
              <div><p className="text-gray-400">Telefone</p><p className="text-gray-700">{detalhe.telefone || '—'}</p></div>
              <div><p className="text-gray-400">Contato</p><p className="text-gray-700">{detalhe.contato || '—'}</p></div>
              <div><p className="text-gray-400">CEP</p><p className="text-gray-700">{detalhe.cep || '—'}</p></div>
              <div className="col-span-2"><p className="text-gray-400">Endereço</p><p className="text-gray-700">{detalhe.endereco || '—'}</p></div>
              <div><p className="text-gray-400">Cidade</p><p className="text-gray-700">{detalhe.cidade || '—'}</p></div>
              <div><p className="text-gray-400">Estado</p><p className="text-gray-700">{detalhe.estado || '—'}</p></div>
            </div>
            {detalhe.categorias_produtos && detalhe.categorias_produtos.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Produtos fornecidos</p>
                <div className="flex flex-wrap gap-1">
                  {detalhe.categorias_produtos.map(cat => (
                    <span key={cat} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs">{cat}</span>
                  ))}
                </div>
              </div>
            )}
            {detalhe.observacoes && <div className="mb-4"><p className="text-sm text-gray-400 mb-1">Observações</p><p className="text-sm text-gray-700">{detalhe.observacoes}</p></div>}
            <div className="flex gap-3">
              <button onClick={() => setDetalhe(null)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Fechar</button>
              <button onClick={() => abrirEdicao(detalhe)} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Editar</button>
              {detalhe.status === 'Ativo'
                ? <button onClick={() => alterarStatus(detalhe.id, 'Inativo')} className="flex-1 bg-red-50 text-red-500 text-sm px-4 py-2.5 rounded-lg hover:bg-red-100">Desativar</button>
                : <button onClick={() => alterarStatus(detalhe.id, 'Ativo')} className="flex-1 bg-green-50 text-green-600 text-sm px-4 py-2.5 rounded-lg hover:bg-green-100">Ativar</button>
              }
            </div>
          </div>
        </div>
      )}

      {/* Modal novo/editar fornecedor */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{editando ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
            <p className="text-sm text-gray-400 mb-6">{editando ? 'Atualize os dados do fornecedor' : 'Código gerado automaticamente'}</p>

            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Identificação</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Razão Social', key: 'razao_social' },
                    { label: 'Nome Fantasia', key: 'nome_fantasia' },
                    { label: 'CNPJ', key: 'cnpj', placeholder: '00.000.000/0000-00' },
                    { label: 'Segmento', key: 'categoria', placeholder: 'Ex: Distribuidora, Fabricante...' },
                  ].map(campo => (
                    <div key={campo.key}>
                      <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                      <input type="text" placeholder={campo.placeholder || ''} value={novo[campo.key]} onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorias de produtos */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Produtos que fornece</p>
                <div className="flex flex-wrap gap-2">
                  {categoriasDisponiveis.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategoria(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${novo.categorias_produtos.includes(cat) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {cat}
                    </button>
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
                      <input type="text" value={novo[campo.key]} onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
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
                      <input type="text" placeholder={campo.placeholder || ''} value={novo[campo.key]} onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500 mb-1 block">Endereço completo</label>
                    <input type="text" value={novo.endereco} onChange={(e) => setNovo({ ...novo, endereco: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Observações</p>
                <textarea value={novo.observacoes} onChange={(e) => setNovo({ ...novo, observacoes: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModal(false); setEditando(false) }} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={salvarFornecedor} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">{editando ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}