'use client'

import { useState } from 'react'

const recebimentosIniciais = [
  { id: 1, nota: 'NF-001234', fornecedor: 'Fornecedor ABC', produto: 'Parafuso M8', quantidade: 1000, unidade: 'un', valorUnit: 0.50, valorTotal: 500.00, setor: 'Manutenção', empresa: 'Empresa A', status: 'Enviado ao Financeiro', data: '14/03/2026' },
  { id: 2, nota: 'NF-001235', fornecedor: 'Fornecedor XYZ', produto: 'Cabo Elétrico', quantidade: 200, unidade: 'm', valorUnit: 8.00, valorTotal: 1600.00, setor: 'Elétrica', empresa: 'Empresa B', status: 'Pendente', data: '13/03/2026' },
  { id: 3, nota: 'NF-001236', fornecedor: 'Fornecedor ABC', produto: 'Óleo Lubrificante', quantidade: 50, unidade: 'lt', valorUnit: 25.00, valorTotal: 1250.00, setor: 'Produção', empresa: 'Empresa A', status: 'Conferido', data: '12/03/2026' },
]

const statusCores = {
  Pendente: 'bg-amber-50 text-amber-600',
  Conferido: 'bg-blue-50 text-blue-600',
  'Enviado ao Financeiro': 'bg-green-50 text-green-600',
}

export default function Recebimento() {
  const [recebimentos, setRecebimentos] = useState(recebimentosIniciais)
  const [modal, setModal] = useState(false)
  const [detalhe, setDetalhe] = useState(null)
  const [filtro, setFiltro] = useState('Todos')
  const [novo, setNovo] = useState({ nota: '', fornecedor: '', produto: '', quantidade: '', unidade: '', valorUnit: '', setor: '', empresa: '' })

  const filtrados = filtro === 'Todos' ? recebimentos : recebimentos.filter(r => r.status === filtro)

  function lancarNota() {
    if (!novo.nota || !novo.produto || !novo.quantidade) return
    const qtd = Number(novo.quantidade)
    const valor = Number(novo.valorUnit)
    setRecebimentos([...recebimentos, {
      ...novo,
      id: recebimentos.length + 1,
      quantidade: qtd,
      valorUnit: valor,
      valorTotal: qtd * valor,
      status: 'Pendente',
      data: new Date().toLocaleDateString('pt-BR'),
    }])
    setNovo({ nota: '', fornecedor: '', produto: '', quantidade: '', unidade: '', valorUnit: '', setor: '', empresa: '' })
    setModal(false)
  }

  function alterarStatus(id, novoStatus) {
    setRecebimentos(recebimentos.map(r => r.id === id ? { ...r, status: novoStatus } : r))
    setDetalhe(null)
  }

  const totalPendente = recebimentos.filter(r => r.status === 'Pendente').reduce((acc, r) => acc + r.valorTotal, 0)
  const totalFinanceiro = recebimentos.filter(r => r.status === 'Enviado ao Financeiro').reduce((acc, r) => acc + r.valorTotal, 0)

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Menu lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Dashboard</a>
          <a href="/estoque" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Estoque</a>
          <a href="/ordens" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="/transferencias" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="/recebimento" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
          <a href="/usuarios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Usuários e Permissões</a>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Recebimento</h2>
            <p className="text-sm text-gray-400 mt-1">Lance notas fiscais e envie ao financeiro</p>
          </div>
          <button
            onClick={() => setModal(true)}
            className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Lançar Nota Fiscal
          </button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Pendentes de Conferência</p>
            <p className="text-2xl font-semibold text-amber-600">{recebimentos.filter(r => r.status === 'Pendente').length}</p>
            <p className="text-xs text-gray-400 mt-1">R$ {totalPendente.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Conferidos</p>
            <p className="text-2xl font-semibold text-blue-600">{recebimentos.filter(r => r.status === 'Conferido').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Enviados ao Financeiro</p>
            <p className="text-2xl font-semibold text-green-600">{recebimentos.filter(r => r.status === 'Enviado ao Financeiro').length}</p>
            <p className="text-xs text-gray-400 mt-1">R$ {totalFinanceiro.toFixed(2)}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['Todos', 'Pendente', 'Conferido', 'Enviado ao Financeiro'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${filtro === f ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Nota Fiscal</th>
                <th className="px-6 py-4 font-medium">Fornecedor</th>
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Quantidade</th>
                <th className="px-6 py-4 font-medium">Valor Total</th>
                <th className="px-6 py-4 font-medium">Setor</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filtrados.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setDetalhe(r)}>
                  <td className="px-6 py-4 font-medium text-gray-800">{r.nota}</td>
                  <td className="px-6 py-4">{r.fornecedor}</td>
                  <td className="px-6 py-4">{r.produto}</td>
                  <td className="px-6 py-4">{r.quantidade} {r.unidade}</td>
                  <td className="px-6 py-4">R$ {r.valorTotal.toFixed(2)}</td>
                  <td className="px-6 py-4">{r.setor}</td>
                  <td className="px-6 py-4">{r.data}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs ${statusCores[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      {r.status === 'Pendente' && (
                        <button onClick={() => alterarStatus(r.id, 'Conferido')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100">Conferir</button>
                      )}
                      {r.status === 'Conferido' && (
                        <button onClick={() => alterarStatus(r.id, 'Enviado ao Financeiro')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Enviar ao Financeiro</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal detalhe */}
      {detalhe && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{detalhe.nota}</h3>
              <span className={`px-2 py-1 rounded-md text-xs ${statusCores[detalhe.status]}`}>{detalhe.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><p className="text-gray-400">Fornecedor</p><p className="text-gray-700">{detalhe.fornecedor}</p></div>
              <div><p className="text-gray-400">Produto</p><p className="text-gray-700">{detalhe.produto}</p></div>
              <div><p className="text-gray-400">Quantidade</p><p className="text-gray-700">{detalhe.quantidade} {detalhe.unidade}</p></div>
              <div><p className="text-gray-400">Valor Unitário</p><p className="text-gray-700">R$ {detalhe.valorUnit.toFixed(2)}</p></div>
              <div><p className="text-gray-400">Valor Total</p><p className="text-gray-700 font-medium">R$ {detalhe.valorTotal.toFixed(2)}</p></div>
              <div><p className="text-gray-400">Setor</p><p className="text-gray-700">{detalhe.setor}</p></div>
              <div><p className="text-gray-400">Empresa</p><p className="text-gray-700">{detalhe.empresa}</p></div>
              <div><p className="text-gray-400">Data</p><p className="text-gray-700">{detalhe.data}</p></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDetalhe(null)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Fechar</button>
              {detalhe.status === 'Pendente' && (
                <button onClick={() => alterarStatus(detalhe.id, 'Conferido')} className="flex-1 bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700">Conferir</button>
              )}
              {detalhe.status === 'Conferido' && (
                <button onClick={() => alterarStatus(detalhe.id, 'Enviado ao Financeiro')} className="flex-1 bg-green-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-green-700">Enviar ao Financeiro</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal lançar nota */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Lançar Nota Fiscal</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Número da Nota Fiscal', key: 'nota', type: 'text' },
                { label: 'Fornecedor', key: 'fornecedor', type: 'text' },
                { label: 'Produto', key: 'produto', type: 'text' },
                { label: 'Quantidade', key: 'quantidade', type: 'number' },
                { label: 'Unidade (un, lt, m...)', key: 'unidade', type: 'text' },
                { label: 'Valor Unitário (R$)', key: 'valorUnit', type: 'number' },
                { label: 'Setor', key: 'setor', type: 'text' },
                { label: 'Empresa', key: 'empresa', type: 'text' },
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
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={lancarNota} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Lançar Nota</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
