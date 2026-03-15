'use client'

import { useState } from 'react'

const usuariosIniciais = [
  { id: 1, nome: 'Admin Master', email: 'admin@logisystem.com', nivel: 'Administrador', empresa: 'Todas', setor: 'Todos', modulos: ['todos'], status: 'Ativo' },
  { id: 2, nome: 'João Silva', email: 'joao@empresaa.com', nivel: 'Gerente Geral', empresa: 'Empresa A', setor: 'Todos', modulos: ['Dashboard', 'Estoque', 'Ordens de Compra', 'Transferências', 'Financeiro', 'Relatórios'], status: 'Ativo' },
  { id: 3, nome: 'Maria Souza', email: 'maria@empresab.com', nivel: 'Gerente Financeiro', empresa: 'Empresa B', setor: 'Financeiro', modulos: ['Dashboard', 'Financeiro', 'Recebimento', 'Relatórios'], status: 'Ativo' },
  { id: 4, nome: 'Carlos Lima', email: 'carlos@empresaa.com', nivel: 'Operador de Estoque', empresa: 'Empresa A', setor: 'Manutenção', modulos: ['Dashboard', 'Estoque', 'Ordens de Compra', 'Transferências'], status: 'Ativo' },
  { id: 5, nome: 'Ana Costa', email: 'ana@empresab.com', nivel: 'Visualizador', empresa: 'Empresa B', setor: 'RH', modulos: ['Dashboard', 'Relatórios'], status: 'Inativo' },
]

const todosModulos = ['Dashboard', 'Estoque', 'Ordens de Compra', 'Transferências', 'Recebimento', 'Financeiro', 'Empresas e Setores', 'Relatórios', 'Suporte', 'Meus Tickets', 'Usuários e Permissões']

const niveis = ['Administrador', 'Suporte', 'Gerente Geral', 'Gerente Financeiro', 'Gerente de Estoque', 'Gerente de Setor', 'Operador de Estoque', 'Operador de Recebimento', 'Operador Financeiro', 'Visualizador']

const nivelCores = {
  Administrador: 'bg-red-50 text-red-500',
  Suporte: 'bg-purple-50 text-purple-600',
  'Gerente Geral': 'bg-blue-50 text-blue-600',
  'Gerente Financeiro': 'bg-blue-50 text-blue-600',
  'Gerente de Estoque': 'bg-blue-50 text-blue-600',
  'Gerente de Setor': 'bg-blue-50 text-blue-600',
  'Operador de Estoque': 'bg-amber-50 text-amber-600',
  'Operador de Recebimento': 'bg-amber-50 text-amber-600',
  'Operador Financeiro': 'bg-amber-50 text-amber-600',
  Visualizador: 'bg-gray-100 text-gray-500',
}

const statusCores = {
  Ativo: 'bg-green-50 text-green-600',
  Inativo: 'bg-gray-100 text-gray-500',
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState(usuariosIniciais)
  const [modal, setModal] = useState(false)
  const [modalPermissao, setModalPermissao] = useState(null)
  const [detalhe, setDetalhe] = useState(null)
  const [busca, setBusca] = useState('')
  const [novo, setNovo] = useState({ nome: '', email: '', nivel: 'Visualizador', empresa: '', setor: '', modulos: [], status: 'Ativo' })

  const filtrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase()) ||
    u.empresa.toLowerCase().includes(busca.toLowerCase())
  )

  function adicionarUsuario() {
    if (!novo.nome || !novo.email) return
    setUsuarios([...usuarios, { ...novo, id: usuarios.length + 1 }])
    setNovo({ nome: '', email: '', nivel: 'Visualizador', empresa: '', setor: '', modulos: [], status: 'Ativo' })
    setModal(false)
  }

  function toggleModulo(modulo) {
    setNovo(prev => ({
      ...prev,
      modulos: prev.modulos.includes(modulo)
        ? prev.modulos.filter(m => m !== modulo)
        : [...prev.modulos, modulo]
    }))
  }

  function toggleModuloPermissao(usuarioId, modulo) {
    setUsuarios(usuarios.map(u => {
      if (u.id !== usuarioId) return u
      return {
        ...u,
        modulos: u.modulos.includes(modulo)
          ? u.modulos.filter(m => m !== modulo)
          : [...u.modulos, modulo]
      }
    }))
  }

  function alterarStatus(id) {
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' } : u))
  }

  function deletarUsuario(id) {
    setUsuarios(usuarios.filter(u => u.id !== id))
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
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
          <a href="/usuarios" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Usuários e Permissões</a>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Usuários e Permissões</h2>
            <p className="text-sm text-gray-400 mt-1">Gerencie usuários e controle de acesso</p>
          </div>
          <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            + Novo Usuário
          </button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total de Usuários</p>
            <p className="text-2xl font-semibold text-gray-800">{usuarios.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Ativos</p>
            <p className="text-2xl font-semibold text-green-600">{usuarios.filter(u => u.status === 'Ativo').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Inativos</p>
            <p className="text-2xl font-semibold text-gray-400">{usuarios.filter(u => u.status === 'Inativo').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Gerentes</p>
            <p className="text-2xl font-semibold text-blue-600">{usuarios.filter(u => u.nivel.includes('Gerente')).length}</p>
          </div>
        </div>

        {/* Busca */}
        <input
          type="text"
          placeholder="Buscar por nome, email ou empresa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 mb-6"
        />

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Nível</th>
                <th className="px-6 py-4 font-medium">Empresa</th>
                <th className="px-6 py-4 font-medium">Setor</th>
                <th className="px-6 py-4 font-medium">Módulos</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filtrados.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{u.nome}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs ${nivelCores[u.nivel]}`}>{u.nivel}</span>
                  </td>
                  <td className="px-6 py-4">{u.empresa}</td>
                  <td className="px-6 py-4">{u.setor}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setModalPermissao(u)} className="text-xs text-blue-600 hover:underline">
                      {u.modulos.includes('todos') ? 'Todos os módulos' : `${u.modulos.length} módulo(s)`}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs ${statusCores[u.status]}`}>{u.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => alterarStatus(u.id)} className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-md hover:bg-gray-100">
                        {u.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                      </button>
                      {u.nivel !== 'Administrador' && (
                        <button onClick={() => deletarUsuario(u.id)} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100">Excluir</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal permissões */}
      {modalPermissao && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Permissões de Módulos</h3>
            <p className="text-sm text-gray-400 mb-6">{modalPermissao.nome} · {modalPermissao.nivel}</p>
            {modalPermissao.modulos.includes('todos') ? (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-600">Este usuário tem acesso a todos os módulos do sistema.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mb-6">
                {todosModulos.map(modulo => (
                  <label key={modulo} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={modalPermissao.modulos.includes(modulo)}
                      onChange={() => {
                        toggleModuloPermissao(modalPermissao.id, modulo)
                        setModalPermissao(prev => ({
                          ...prev,
                          modulos: prev.modulos.includes(modulo)
                            ? prev.modulos.filter(m => m !== modulo)
                            : [...prev.modulos, modulo]
                        }))
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{modulo}</span>
                  </label>
                ))}
              </div>
            )}
            <button onClick={() => setModalPermissao(null)} className="w-full bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Salvar Permissões</button>
          </div>
        </div>
      )}

      {/* Modal novo usuário */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Novo Usuário</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Nome completo', key: 'nome', type: 'text' },
                { label: 'E-mail', key: 'email', type: 'email' },
                { label: 'Empresa', key: 'empresa', type: 'text' },
                { label: 'Setor', key: 'setor', type: 'text' },
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
                <label className="text-sm text-gray-500 mb-1 block">Nível de Acesso</label>
                <select value={novo.nivel} onChange={(e) => setNovo({ ...novo, nivel: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none">
                  {niveis.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-3 block">Módulos com Acesso</label>
                <div className="flex flex-col gap-2">
                  {todosModulos.map(modulo => (
                    <label key={modulo} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={novo.modulos.includes(modulo)}
                        onChange={() => toggleModulo(modulo)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{modulo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={adicionarUsuario} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Criar Usuário</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}