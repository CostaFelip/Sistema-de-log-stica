'use client'

import { useState } from 'react'

const contasIniciais = [
  { id: 1, tipo: 'Pagar', descricao: 'NF-001234 - Parafuso M8', fornecedor: 'Fornecedor ABC', valor: 500.00, vencimento: '20/03/2026', status: 'Pendente', categoria: 'Estoque' },
  { id: 2, tipo: 'Pagar', descricao: 'NF-001236 - Óleo Lubrificante', fornecedor: 'Fornecedor ABC', valor: 1250.00, vencimento: '18/03/2026', status: 'Pendente', categoria: 'Estoque' },
  { id: 3, tipo: 'Receber', descricao: 'Venda de produtos - Empresa B', fornecedor: 'Empresa B', valor: 3200.00, vencimento: '16/03/2026', status: 'Pendente', categoria: 'Vendas' },
  { id: 4, tipo: 'Pagar', descricao: 'Aluguel do galpão', fornecedor: 'Imobiliária XYZ', valor: 4500.00, vencimento: '10/03/2026', status: 'Pago', categoria: 'Infraestrutura' },
  { id: 5, tipo: 'Receber', descricao: 'Serviços prestados - Empresa A', fornecedor: 'Empresa A', valor: 1800.00, vencimento: '12/03/2026', status: 'Recebido', categoria: 'Serviços' },
]

const orcamentosIniciais = [
  { id: 1, descricao: 'Compra de equipamentos', valor: 15000.00, categoria: 'Equipamentos', status: 'Aprovado', data: '10/03/2026' },
  { id: 2, descricao: 'Reforma do estoque', valor: 8000.00, categoria: 'Infraestrutura', status: 'Pendente', data: '13/03/2026' },
]

const tipoCores = {
  Pagar: 'bg-red-50 text-red-500',
  Receber: 'bg-green-50 text-green-600',
}

const statusCores = {
  Pendente: 'bg-amber-50 text-amber-600',
  Pago: 'bg-green-50 text-green-600',
  Recebido: 'bg-green-50 text-green-600',
  Cancelado: 'bg-red-50 text-red-500',
  Aprovado: 'bg-green-50 text-green-600',
}

export default function Financeiro() {
  const [contas, setContas] = useState(contasIniciais)
  const [orcamentos, setOrcamentos] = useState(orcamentosIniciais)
  const [aba, setAba] = useState('fluxo')
  const [modal, setModal] = useState(false)
  const [modalOrc, setModalOrc] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [nova, setNova] = useState({ tipo: 'Pagar', descricao: '', fornecedor: '', valor: '', vencimento: '', categoria: '' })
  const [novoOrc, setNovoOrc] = useState({ descricao: '', valor: '', categoria: '' })

  const contasFiltradas = filtroTipo === 'Todos' ? contas : contas.filter(c => c.tipo === filtroTipo)

  const totalPagar = contas.filter(c => c.tipo === 'Pagar' && c.status === 'Pendente').reduce((acc, c) => acc + c.valor, 0)
  const totalReceber = contas.filter(c => c.tipo === 'Receber' && c.status === 'Pendente').reduce((acc, c) => acc + c.valor, 0)
  const totalPago = contas.filter(c => c.status === 'Pago').reduce((acc, c) => acc + c.valor, 0)
  const totalRecebido = contas.filter(c => c.status === 'Recebido').reduce((acc, c) => acc + c.valor, 0)
  const saldo = totalRecebido - totalPago

  function adicionarConta() {
    if (!nova.descricao || !nova.valor) return
    setContas([...contas, { ...nova, id: contas.length + 1, valor: Number(nova.valor), status: 'Pendente' }])
    setNova({ tipo: 'Pagar', descricao: '', fornecedor: '', valor: '', vencimento: '', categoria: '' })
    setModal(false)
  }

  function adicionarOrcamento() {
    if (!novoOrc.descricao || !novoOrc.valor) return
    setOrcamentos([...orcamentos, { ...novoOrc, id: orcamentos.length + 1, valor: Number(novoOrc.valor), status: 'Pendente', data: new Date().toLocaleDateString('pt-BR') }])
    setNovoOrc({ descricao: '', valor: '', categoria: '' })
    setModalOrc(false)
  }

  function alterarStatusConta(id, novoStatus) {
    setContas(contas.map(c => c.id === id ? { ...c, status: novoStatus } : c))
  }

  function alterarStatusOrc(id, novoStatus) {
    setOrcamentos(orcamentos.map(o => o.id === id ? { ...o, status: novoStatus } : o))
  }

  function deletarConta(id) {
    setContas(contas.filter(c => c.id !== id))
  }

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
          <a href="/recebimento" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Financeiro</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
          <a href="/usuarios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Usuários e Permissões</a>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Financeiro</h2>

        {/* Cards de resumo */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">A Pagar</p>
            <p className="text-2xl font-semibold text-red-500">R$ {totalPagar.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">A Receber</p>
            <p className="text-2xl font-semibold text-green-600">R$ {totalReceber.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Saldo do Mês</p>
            <p className={`text-2xl font-semibold ${saldo >= 0 ? 'text-green-600' : 'text-red-500'}`}>R$ {saldo.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Orçamentos Pendentes</p>
            <p className="text-2xl font-semibold text-amber-600">{orcamentos.filter(o => o.status === 'Pendente').length}</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'fluxo', label: 'Fluxo de Caixa' },
            { key: 'contas', label: 'Contas' },
            { key: 'orcamentos', label: 'Orçamentos' },
          ].map(a => (
            <button
              key={a.key}
              onClick={() => setAba(a.key)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${aba === a.key ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Aba Fluxo de Caixa */}
        {aba === 'fluxo' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Fluxo de Caixa</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Total Recebido', valor: totalRecebido, cor: 'text-green-600', pct: 100 },
                { label: 'Total Pago', valor: totalPago, cor: 'text-red-500', pct: totalRecebido > 0 ? (totalPago / totalRecebido) * 100 : 0 },
                { label: 'Saldo', valor: saldo, cor: saldo >= 0 ? 'text-green-600' : 'text-red-500', pct: totalRecebido > 0 ? Math.abs(saldo / totalRecebido) * 100 : 0 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className={`font-medium ${item.cor}`}>R$ {item.valor.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.valor >= 0 ? 'bg-gray-800' : 'bg-red-400'}`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba Contas */}
        {aba === 'contas' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {['Todos', 'Pagar', 'Receber'].map(f => (
                  <button key={f} onClick={() => setFiltroTipo(f)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${filtroTipo === f ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{f}</button>
                ))}
              </div>
              <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">+ Nova Conta</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium">Descrição</th>
                    <th className="px-6 py-4 font-medium">Fornecedor</th>
                    <th className="px-6 py-4 font-medium">Valor</th>
                    <th className="px-6 py-4 font-medium">Vencimento</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {contasFiltradas.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${tipoCores[c.tipo]}`}>{c.tipo}</span></td>
                      <td className="px-6 py-4 font-medium text-gray-800">{c.descricao}</td>
                      <td className="px-6 py-4">{c.fornecedor}</td>
                      <td className="px-6 py-4">R$ {c.valor.toFixed(2)}</td>
                      <td className="px-6 py-4">{c.vencimento}</td>
                      <td className="px-6 py-4">{c.categoria}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${statusCores[c.status]}`}>{c.status}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {c.status === 'Pendente' && c.tipo === 'Pagar' && (
                            <button onClick={() => alterarStatusConta(c.id, 'Pago')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Pagar</button>
                          )}
                          {c.status === 'Pendente' && c.tipo === 'Receber' && (
                            <button onClick={() => alterarStatusConta(c.id, 'Recebido')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Receber</button>
                          )}
                          {c.status === 'Pendente' && (
                            <button onClick={() => alterarStatusConta(c.id, 'Cancelado')} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100">Cancelar</button>
                          )}
                          <button onClick={() => deletarConta(c.id)} className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-md hover:bg-gray-100">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aba Orçamentos */}
        {aba === 'orcamentos' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setModalOrc(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700">+ Novo Orçamento</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-4 font-medium">Descrição</th>
                    <th className="px-6 py-4 font-medium">Valor</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {orcamentos.map(o => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{o.descricao}</td>
                      <td className="px-6 py-4">R$ {o.valor.toFixed(2)}</td>
                      <td className="px-6 py-4">{o.categoria}</td>
                      <td className="px-6 py-4">{o.data}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs ${statusCores[o.status]}`}>{o.status}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {o.status === 'Pendente' && (
                            <>
                              <button onClick={() => alterarStatusOrc(o.id, 'Aprovado')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100">Aprovar</button>
                              <button onClick={() => alterarStatusOrc(o.id, 'Cancelado')} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100">Cancelar</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal nova conta */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Nova Conta</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Tipo</label>
                <select value={nova.tipo} onChange={(e) => setNova({ ...nova, tipo: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                  <option>Pagar</option>
                  <option>Receber</option>
                </select>
              </div>
              {[
                { label: 'Descrição', key: 'descricao', type: 'text' },
                { label: 'Fornecedor / Cliente', key: 'fornecedor', type: 'text' },
                { label: 'Valor (R$)', key: 'valor', type: 'number' },
                { label: 'Vencimento', key: 'vencimento', type: 'text', placeholder: 'dd/mm/aaaa' },
                { label: 'Categoria', key: 'categoria', type: 'text' },
              ].map(campo => (
                <div key={campo.key}>
                  <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                  <input
                    type={campo.type}
                    placeholder={campo.placeholder || ''}
                    value={nova[campo.key]}
                    onChange={(e) => setNova({ ...nova, [campo.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarConta} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo orçamento */}
      {modalOrc && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Novo Orçamento</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Descrição', key: 'descricao', type: 'text' },
                { label: 'Valor (R$)', key: 'valor', type: 'number' },
                { label: 'Categoria', key: 'categoria', type: 'text' },
              ].map(campo => (
                <div key={campo.key}>
                  <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                  <input
                    type={campo.type}
                    value={novoOrc[campo.key]}
                    onChange={(e) => setNovoOrc({ ...novoOrc, [campo.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOrc(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarOrcamento} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Adicionar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}