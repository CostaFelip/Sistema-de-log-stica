'use client'

import { useState } from 'react'

const empresasIniciais = [
  { id: 1, nome: 'Empresa A', cnpj: '12.345.678/0001-90', responsavel: 'João Silva', email: 'joao@empresaa.com', setores: ['Manutenção', 'Produção'] },
  { id: 2, nome: 'Empresa B', cnpj: '98.765.432/0001-10', responsavel: 'Maria Souza', email: 'maria@empresab.com', setores: ['Elétrica', 'RH'] },
]

export default function Empresas() {
  const [empresas, setEmpresas] = useState(empresasIniciais)
  const [modal, setModal] = useState(false)
  const [modalSetor, setModalSetor] = useState(null)
  const [novaEmpresa, setNovaEmpresa] = useState({ nome: '', cnpj: '', responsavel: '', email: '' })
  const [novoSetor, setNovoSetor] = useState('')

  function adicionarEmpresa() {
    if (!novaEmpresa.nome) return
    setEmpresas([...empresas, { ...novaEmpresa, id: empresas.length + 1, setores: [] }])
    setNovaEmpresa({ nome: '', cnpj: '', responsavel: '', email: '' })
    setModal(false)
  }

  function adicionarSetor(empresaId) {
    if (!novoSetor) return
    setEmpresas(empresas.map(e =>
      e.id === empresaId ? { ...e, setores: [...e.setores, novoSetor] } : e
    ))
    setNovoSetor('')
    setModalSetor(null)
  }

  function removerSetor(empresaId, setor) {
    setEmpresas(empresas.map(e =>
      e.id === empresaId ? { ...e, setores: e.setores.filter(s => s !== setor) } : e
    ))
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
          <a href="/empresas" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Empresas e Setores</a>
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
          <h2 className="text-2xl font-semibold text-gray-800">Empresas e Setores</h2>
          <button
            onClick={() => setModal(true)}
            className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Nova Empresa
          </button>
        </div>

        {/* Cards de empresas */}
        <div className="flex flex-col gap-4">
          {empresas.map(e => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">{e.nome}</h3>
                  <p className="text-sm text-gray-400">{e.cnpj}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{e.responsavel}</p>
                  <p className="text-sm text-gray-400">{e.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500">Setores</p>
                  <button
                    onClick={() => setModalSetor(e.id)}
                    className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50"
                  >
                    + Adicionar Setor
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {e.setores.map(s => (
                    <div key={s} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-lg">
                      {s}
                      <button
                        onClick={() => removerSetor(e.id, s)}
                        className="text-gray-400 hover:text-gray-600 ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {e.setores.length === 0 && (
                    <p className="text-sm text-gray-400">Nenhum setor cadastrado</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal nova empresa */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Nova Empresa</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Nome da Empresa', key: 'nome', type: 'text' },
                { label: 'CNPJ', key: 'cnpj', type: 'text' },
                { label: 'Responsável', key: 'responsavel', type: 'text' },
                { label: 'E-mail', key: 'email', type: 'email' },
              ].map(campo => (
                <div key={campo.key}>
                  <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                  <input
                    type={campo.type}
                    value={novaEmpresa[campo.key]}
                    onChange={(e) => setNovaEmpresa({ ...novaEmpresa, [campo.key]: e.target.value })}
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
                onClick={adicionarEmpresa}
                className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo setor */}
      {modalSetor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Novo Setor</h3>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Nome do Setor</label>
              <input
                type="text"
                value={novoSetor}
                onChange={(e) => setNovoSetor(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalSetor(null)}
                className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => adicionarSetor(modalSetor)}
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