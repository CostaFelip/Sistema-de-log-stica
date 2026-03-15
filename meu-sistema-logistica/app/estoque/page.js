'use client'

import { useState } from 'react'

const produtosIniciais = [
  { id: 1, nome: 'Parafuso M8', categoria: 'Fixação', setor: 'Manutenção', empresa: 'Empresa A', quantidade: 500, unidade: 'un', valor: 0.50 },
  { id: 2, nome: 'Óleo Lubrificante', categoria: 'Químicos', setor: 'Produção', empresa: 'Empresa A', quantidade: 30, unidade: 'lt', valor: 25.00 },
  { id: 3, nome: 'Cabo Elétrico', categoria: 'Elétrica', setor: 'Elétrica', empresa: 'Empresa B', quantidade: 150, unidade: 'm', valor: 8.00 },
  { id: 4, nome: 'Luva de Segurança', categoria: 'EPI', setor: 'RH', empresa: 'Empresa B', quantidade: 8, unidade: 'par', valor: 12.00 },
]

export default function Estoque() {
  const [produtos, setProdutos] = useState(produtosIniciais)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(false)
  const [novo, setNovo] = useState({ nome: '', categoria: '', setor: '', empresa: '', quantidade: '', unidade: '', valor: '' })

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.setor.toLowerCase().includes(busca.toLowerCase()) ||
    p.empresa.toLowerCase().includes(busca.toLowerCase())
  )

  function adicionarProduto() {
    if (!novo.nome || !novo.quantidade) return
    setProdutos([...produtos, { ...novo, id: produtos.length + 1, quantidade: Number(novo.quantidade), valor: Number(novo.valor) }])
    setNovo({ nome: '', categoria: '', setor: '', empresa: '', quantidade: '', unidade: '', valor: '' })
    setModal(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Menu lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Dashboard</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
          <a href="/recebimento" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Estoque</h2>
          <button
            onClick={() => setModal(true)}
            className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Novo Produto
          </button>
        </div>

        {/* Busca */}
        <input
          type="text"
          placeholder="Buscar por produto, setor ou empresa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 mb-6"
        />

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
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
              {filtrados.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{p.nome}</td>
                  <td className="px-6 py-4">{p.categoria}</td>
                  <td className="px-6 py-4">{p.setor}</td>
                  <td className="px-6 py-4">{p.empresa}</td>
                  <td className="px-6 py-4">{p.quantidade} {p.unidade}</td>
                  <td className="px-6 py-4">R$ {p.valor.toFixed(2)}</td>
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
      </main>

      {/* Modal novo produto */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Novo Produto</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Nome do Produto', key: 'nome', type: 'text' },
                { label: 'Categoria', key: 'categoria', type: 'text' },
                { label: 'Setor', key: 'setor', type: 'text' },
                { label: 'Empresa', key: 'empresa', type: 'text' },
                { label: 'Quantidade', key: 'quantidade', type: 'number' },
                { label: 'Unidade (un, lt, m...)', key: 'unidade', type: 'text' },
                { label: 'Valor Unitário (R$)', key: 'valor', type: 'number' },
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
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarProduto}
                className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}