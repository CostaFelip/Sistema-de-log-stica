'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const todosModulos = [
  'Dashboard', 'Compras', 'Estoque', 'Ordens de Compra',
  'Transferências', 'Recebimento', 'Financeiro', 'Pedidos',
  'Fornecedores', 'Empresas e Setores', 'Relatórios',
  'Suporte', 'Meus Tickets', 'Usuários e Permissões'
]

const niveis = [
  'Administrador', 'Suporte', 'Gerente Geral', 'Gerente Financeiro',
  'Gerente de Estoque', 'Gerente de Setor', 'Operador de Estoque',
  'Operador de Recebimento', 'Operador Financeiro', 'Visualizador'
]

const modulosPorNivel = {
  Administrador: ['todos'],
  Suporte: ['Dashboard', 'Suporte', 'Meus Tickets', 'Usuários e Permissões'],
  'Gerente Geral': ['Dashboard', 'Compras', 'Estoque', 'Ordens de Compra', 'Transferências', 'Recebimento', 'Financeiro', 'Pedidos', 'Fornecedores', 'Empresas e Setores', 'Relatórios', 'Suporte', 'Meus Tickets'],
  'Gerente Financeiro': ['Dashboard', 'Financeiro', 'Recebimento', 'Pedidos', 'Relatórios', 'Meus Tickets'],
  'Gerente de Estoque': ['Dashboard', 'Compras', 'Estoque', 'Ordens de Compra', 'Transferências', 'Recebimento', 'Fornecedores', 'Relatórios', 'Meus Tickets'],
  'Gerente de Setor': ['Dashboard', 'Estoque', 'Ordens de Compra', 'Transferências', 'Relatórios', 'Meus Tickets'],
  'Operador de Estoque': ['Dashboard', 'Estoque', 'Ordens de Compra', 'Transferências', 'Meus Tickets'],
  'Operador de Recebimento': ['Dashboard', 'Recebimento', 'Estoque', 'Meus Tickets'],
  'Operador Financeiro': ['Dashboard', 'Financeiro', 'Recebimento', 'Meus Tickets'],
  Visualizador: ['Dashboard', 'Relatórios', 'Meus Tickets'],
}

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
  const { usuario, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [setores, setSetores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [modalPermissao, setModalPermissao] = useState(null)
  const [busca, setBusca] = useState('')
  const [criando, setCriando] = useState(false)
  const [novo, setNovo] = useState({
    nome: '', email: '', senha: '', nivel: 'Visualizador',
    empresa_id: '', setor_id: '', modulos: [], status: 'Ativo'
  })

  useEffect(() => {
    if (!authLoading && !usuario) router.push('/')
    if (!authLoading && usuario) {
      if (!['Administrador', 'Suporte'].includes(usuario.nivel)) {
        router.push('/dashboard')
      } else {
        carregarDados()
      }
    }
  }, [usuario, authLoading])

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  async function carregarDados() {
    setLoading(true)
    const [{ data: usrs }, { data: emps }, { data: sets }] = await Promise.all([
      supabase.from('usuarios').select('*, empresas(nome), setores(nome)').order('created_at', { ascending: false }),
      supabase.from('empresas').select('*'),
      supabase.from('setores').select('*'),
    ])
    if (usrs) setUsuarios(usrs)
    if (emps) setEmpresas(emps)
    if (sets) setSetores(sets)
    setLoading(false)
  }

async function criarUsuario() {
  if (!novo.nome || !novo.email || !novo.senha) return
  setCriando(true)

  const response = await fetch('/api/criar-usuario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: novo.nome,
      email: novo.email,
      senha: novo.senha,
      nivel: novo.nivel,
      empresa_id: novo.empresa_id,
      setor_id: novo.setor_id,
      modulos: novo.modulos,
      status: novo.status,
    })
  })

  const data = await response.json()

  if (data.error) {
    alert('Erro ao criar usuário: ' + data.error)
    setCriando(false)
    return
  }

  setNovo({ nome: '', email: '', senha: '', nivel: 'Visualizador', empresa_id: '', setor_id: '', modulos: [], status: 'Ativo' })
  setModal(false)
  carregarDados()
  setCriando(false)
}

  async function toggleModulo(usuarioId, modulo) {
    const u = usuarios.find(u => u.id === usuarioId)
    if (!u) return
    const novosModulos = u.modulos?.includes(modulo)
      ? u.modulos.filter(m => m !== modulo)
      : [...(u.modulos || []), modulo]
    await supabase.from('usuarios').update({ modulos: novosModulos }).eq('id', usuarioId)
    setModalPermissao(prev => prev ? { ...prev, modulos: novosModulos } : null)
    carregarDados()
  }

  async function alterarStatus(id, novoStatus) {
    await supabase.from('usuarios').update({ status: novoStatus }).eq('id', id)
    carregarDados()
  }

  async function deletarUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    await supabase.from('usuarios').delete().eq('id', id)
    carregarDados()
  }

  function toggleModuloNovo(modulo) {
    setNovo(prev => ({
      ...prev,
      modulos: prev.modulos.includes(modulo)
        ? prev.modulos.filter(m => m !== modulo)
        : [...prev.modulos, modulo]
    }))
  }

  const filtrados = usuarios.filter(u =>
    u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase()) ||
    (u.empresas?.nome || '').toLowerCase().includes(busca.toLowerCase())
  )

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
          <a href="/recebimento" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Recebimento</a>
          <a href="/financeiro" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Financeiro</a>
          <a href="/pedidos" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Pedidos</a>
          <a href="/fornecedores" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Fornecedores</a>
          <a href="/empresas" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="/relatorios" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
          <a href="/suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Suporte</a>
          <a href="/meu-suporte" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Meus Tickets</a>
          <a href="/usuarios" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Usuários e Permissões</a>
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
            <h2 className="text-2xl font-semibold text-gray-800">Usuários e Permissões</h2>
            <p className="text-sm text-gray-400 mt-1">Gerencie usuários e controle de acesso</p>
          </div>
          <button onClick={() => setModal(true)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            + Novo Usuário
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total</p>
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
            <p className="text-2xl font-semibold text-blue-600">{usuarios.filter(u => u.nivel?.includes('Gerente')).length}</p>
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

        {loading ? (
          <div className="flex items-center justify-center h-40"><p className="text-gray-400 text-sm">Carregando...</p></div>
        ) : (
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
                {filtrados.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Nenhum usuário encontrado</td></tr>
                ) : filtrados.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{u.nome}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs ${nivelCores[u.nivel] || 'bg-gray-100 text-gray-500'}`}>{u.nivel}</span>
                    </td>
                    <td className="px-6 py-4">{u.empresas?.nome || '—'}</td>
                    <td className="px-6 py-4">{u.setores?.nome || '—'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => setModalPermissao(u)} className="text-xs text-blue-600 hover:underline">
                        {u.modulos?.includes('todos') ? 'Acesso total' : `${u.modulos?.length || 0} módulo(s)`}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs ${statusCores[u.status]}`}>{u.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => alterarStatus(u.id, u.status === 'Ativo' ? 'Inativo' : 'Ativo')} className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-md hover:bg-gray-100">
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
        )}
      </main>

      {/* Modal permissões */}
      {modalPermissao && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Permissões de Módulos</h3>
            <p className="text-sm text-gray-400 mb-6">{modalPermissao.nome} · {modalPermissao.nivel}</p>
            {modalPermissao.modulos?.includes('todos') ? (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-600">Este usuário tem acesso total ao sistema.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mb-6">
                {todosModulos.map(modulo => (
                  <label key={modulo} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={modalPermissao.modulos?.includes(modulo) || false}
                      onChange={() => toggleModulo(modalPermissao.id, modulo)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{modulo}</span>
                  </label>
                ))}
              </div>
            )}
            <button onClick={() => setModalPermissao(null)} className="w-full bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700">Fechar</button>
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
                { label: 'Senha', key: 'senha', type: 'password' },
              ].map(campo => (
                <div key={campo.key}>
                  <label className="text-sm text-gray-500 mb-1 block">{campo.label}</label>
                  <input type={campo.type} value={novo[campo.key]} onChange={(e) => setNovo({ ...novo, [campo.key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400" />
                </div>
              ))}

              <div>
                <label className="text-sm text-gray-500 mb-1 block">Nível de Acesso</label>
                <select
                  value={novo.nivel}
                  onChange={(e) => {
                    const nivel = e.target.value
                    const modulos = modulosPorNivel[nivel] || []
                    setNovo({ ...novo, nivel, modulos })
                  }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 outline-none"
                >
                  {niveis.map(n => <option key={n}>{n}</option>)}
                </select>
                {novo.nivel && (
                  <div className="mt-2 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Módulos incluídos automaticamente</p>
                    <p className="text-xs text-blue-800">
                      {modulosPorNivel[novo.nivel]?.includes('todos')
                        ? 'Acesso total ao sistema'
                        : modulosPorNivel[novo.nivel]?.join(', ')
                      }
                    </p>
                  </div>
                )}
              </div>

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

              <div>
                <label className="text-sm text-gray-500 mb-3 block">Módulos com Acesso</label>
                <div className="flex flex-col gap-2">
                  {todosModulos.map(modulo => (
                    <label key={modulo} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input type="checkbox" checked={novo.modulos.includes(modulo)} onChange={() => toggleModuloNovo(modulo)} className="w-4 h-4" />
                      <span className="text-sm text-gray-700">{modulo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={criarUsuario} disabled={criando} className="flex-1 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50">
                {criando ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}