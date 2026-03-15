'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const statusCores = {
  Pendente: 'bg-amber-50 text-amber-600',
  'Em Trânsito': 'bg-blue-50 text-blue-600',
  Concluída: 'bg-green-50 text-green-600',
}

const niveisGerentes = ['Administrador', 'Suporte', 'Gerente Geral', 'Gerente de Estoque', 'Gerente Financeiro', 'Gerente de Setor']

export default function Transferencias() {
  const { usuario, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [transferencias, setTransferencias] = useState([])
  const [setores, setSetores] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [filtro, setFiltro] = useState('Todos')
  const [codigoBusca, setCodigoBusca] = useState('')
  const [produtoEncontrado, setProdutoEncontrado] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [nova, setNova] = useState({ produto: '', quantidade: '', unidade: '', origem: '', destino: '' })

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
      .from('transferencias')
      .select('*')
      .order('created_at', { ascending: false })

    const [{ data: trans }, { data: sets }, { data: emps }] = await Promise.all([
      query,
      supabase.from('setores').select('*'),
      supabase.from('empresas').select('*'),
    ])
    if (trans) {
      if (!isGerente && usuario?.setor_id) {
        const setorNome = sets?.find(s => s.id === usuario.setor_id)?.nome || ''
        setTransferencias(trans.filter(t =>
          t.origem?.includes(setorNome) || t.destino?.includes(setorNome)
        ))
      } else {
        setTransferencias(trans)
      }
    }
    if (sets) setSetores(sets)
    if (emps) setEmpresas(emps)
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
        origem: `${data.setores?.nome || ''} - ${data.empresas?.nome || ''}`,
      }))
    } else {
      setProdutoEncontrado(null)
      alert('Produto não encontrado.')
    }
    setBuscando(false)
  }

async function adicionarTransferencia() {
  console.log('nova:', nova)
  console.log('produto:', nova.produto)
  console.log('quantidade:', nova.quantidade)
  console.log('destino:', nova.destino)
  
  if (!nova.produto || !nova.quantidade || !nova.destino) {
    alert(`Faltando: ${!nova.produto ? 'produto ' : ''}${!nova.quantidade ? 'quantidade ' : ''}${!nova.destino ? 'destino' : ''}`)
    return
  }
  
  const { error } = await supabase.from('transferencias').insert([{
    produto: nova.produto,
    quantidade: Number(nova.quantidade),
    unidade: nova.unidade,
    origem: nova.origem,
    destino: nova.destino,
    solicitante: usuario.nome,
  }])
  
  if (error) {
    alert('Erro: ' + error.message)
    return
  }
  
  setNova({ produto: '', quantidade: '', unidade: '', origem: '', destino: '' })
  setProdutoEncontrado(null)
  setCodigoBusca('')
  setModal(false)
  carregarDados()
}
  async function alterarStatus(id, novoStatus) {
    await supabase.from('transferencias').update({ status: novoStatus }).eq('id', id)
    carregarDados()
  }

  const isGerente = niveisGerentes.includes(usuario?.nivel)
  const filtradas = filtro === 'Todos' ? transferencias : transferencias.filter(t => t.status === filtro)

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
            <a href="/transferencias" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Transferências</a>
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
              <a href="/alterar-senha" className="text-xs text-blue-600 hover:text-blue-700 block mb-3">Alterar senha</a>
              <button onClick={handleLogout} className="w-full text-left text-sm text-red-500 hover:text-red-600">Sair</button>
            </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Transferências</h2>
            {!isGerente && <p className="text-sm text-gray-400 mt-1">Mostrando transferências do seu setor</p>}
          </div>
          <button onClick={() => { setModal(true); setProdutoEncontrado(null); setCodigoBusca('') }} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            + Nova Transferência
          </button>
        </div>

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

        <div className="flex gap-2 mb-6">
          {['Todos', 'Pendente', 'Em Trânsito', 'Concluída'].map(f => (
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
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Quantidade</th>
                  <th className="px-6 py-4 font-medium">Origem</th>
                  <th className="px-6 py-4 font-medium">Destino</th>
                  <th className="px-6 py-4 font-medium">Solicitante</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {filtradas.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Nenhuma transferência cadastrada</td></tr>
                ) : filtradas.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{t.produto}</td>
                    <td className="px-6 py-4">{t.quantidade} {t.unidade}</td>
                    <td className="px-6 py-4">{t.origem}</td>
                    <td className="px-6 py-4">{t.destino}</td>
                    <td className="px-6 py-4">{t.solicitante || '—'}</td>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Nova Transferência</h3>
            <p className="text-sm text-gray-400 mb-6">Solicitante: {usuario?.nome}</p>

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
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Quantidade</label>
                  <input type="number" value={nova.quantidade} onChange={(e) => setNova({ ...nova, quantidade: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Origem</label>
                  <input type="text" value={nova.origem} onChange={(e) => setNova({ ...nova, origem: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Destino</label>
                  <select value={nova.destino} onChange={(e) => setNova({ ...nova, destino: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                    <option value="">Selecione o destino</option>
                    {setores.map(s => (
                      empresas.map(e => (
                        <option key={`${s.id}-${e.id}`} value={`${s.nome} - ${e.nome}`}>{s.nome} - {e.nome}</option>
                      ))
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setModal(false); setProdutoEncontrado(null); setCodigoBusca('') }} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
<button onClick={adicionarTransferencia} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Criar Transferência</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}