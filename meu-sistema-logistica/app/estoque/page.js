'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [setores, setSetores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(false)
  const [novo, setNovo] = useState({ nome: '', categoria: '', setor_id: '', empresa_id: '', quantidade: '', unidade: '', valor: '', codigo_barras: '' })

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    setLoading(true)
    const [{ data: prods }, { data: emps }, { data: sets }] = await Promise.all([
      supabase.from('produtos').select('*, empresas(nome), setores(nome)').order('created_at', { ascending: false }),
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
    const numero = String((count || 0) + 1).padStart(4, '0')
    return `PRD-${ano}-${numero}`
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
      setNovo({ nome: '', categoria: '', setor_id: '', empresa_id: '', quantidade: '', unidade: '', valor: '', codigo_barras: '' })
      setModal(false)
      carregarDados()
    }
  }

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.codigo || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.codigo_barras || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.setores?.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.empresas?.nome || '').toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Dashboard</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
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
          <h2 className="text-2xl font-semibold text-gray-800">Estoque</h2>
          <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            + Novo Produto
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nome, código SKU, código de barras, setor ou empresa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 mb-6"
        />

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400 text-sm">Carregando...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Código</th>
                  <th className="px-6 py-4 font-medium">Produto</th>
                  <th className="px-6 py-4 font-medium">Categoria</th>
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
                  <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-400">Nenhum produto cadastrado</td></tr>
                ) : filtrados.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-medium text-gray-800">{p.codigo}</p>
                      {p.codigo_barras && <p className="font-mono text-xs text-gray-400">{p.codigo_barras}</p>}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{p.nome}</td>
                    <td className="px-6 py-4">{p.categoria}</td>
                    <td className="px-6 py-4">{p.setores?.nome}</td>
                    <td className="px-6 py-4">{p.empresas?.nome}</td>
                    <td className="px-6 py-4">{p.quantidade} {p.unidade}</td>
                    <td className="px-6 py-4">R$ {Number(p.valor).toFixed(2)}</td>
                    <td className="px-6 py-4">R$ {(p.quantidade * p.valor).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {p.quantidade <= 10
                        ? <span className="bg-red-50 text-red-500 px-2 py-1 rounded-md">Baixo</span>
                        : <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md">Normal</span>
                      }
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
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Novo Produto</h3>
            <p className="text-sm text-gray-400 mb-6">O código SKU será gerado automaticamente</p>
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
                  <input
                    type={campo.type}
                    value={novo[campo.key]}
                    onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                  />
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