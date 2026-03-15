'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [telaEsqueci, setTelaEsqueci] = useState(false)
  const [emailEsqueci, setEmailEsqueci] = useState('')
  const [emailEnviado, setEmailEnviado] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!email || !senha) return
    setLoading(true)
    setErro('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('Email ou senha incorretos. Tente novamente.')
      setLoading(false)
      return
    }

    const { data: usuarioData } = await supabase
      .from('usuarios')
      .select('primeiro_acesso')
      .eq('auth_id', data.user.id)
      .single()

    if (usuarioData?.primeiro_acesso) {
      router.push('/primeiro-acesso')
    } else {
      router.push('/dashboard')
    }
  }

async function handleEsqueci() {
  if (!emailEsqueci) return
  setLoading(true)
  setErro('')
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(emailEsqueci, {
    redirectTo: `${window.location.origin}/alterar-senha`,
  })
  
  console.log('data:', data)
  console.log('error:', error)
  
  setLoading(false)
  if (error) {
    setErro('Erro: ' + error.message)
    return
  }
  setEmailEnviado(true)
}

  if (telaEsqueci) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 w-full max-w-md">
          <button onClick={() => { setTelaEsqueci(false); setEmailEnviado(false); setErro('') }} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">
            ← Voltar ao login
          </button>

          {emailEnviado ? (
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Email enviado!</h1>
              <p className="text-sm text-gray-400 mb-6">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600">Link enviado para <span className="font-medium">{emailEsqueci}</span></p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-1">Esqueci minha senha</h1>
              <p className="text-sm text-gray-400 mb-8">Digite seu email e enviaremos um link para redefinir sua senha.</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">E-mail</label>
                  <input
                    type="email"
                    value={emailEsqueci}
                    onChange={(e) => setEmailEsqueci(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEsqueci()}
                    placeholder="seu@email.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
                  />
                </div>

                {erro && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{erro}</p>}

                <button
                  onClick={handleEsqueci}
                  disabled={loading}
                  className="w-full bg-gray-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar link'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">LogiSystem</h1>
        <p className="text-sm text-gray-400 mb-8">Faça login para continuar</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="seu@email.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
            />
          </div>

          {erro && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{erro}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gray-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            onClick={() => { setTelaEsqueci(true); setErro('') }}
            className="text-sm text-gray-400 hover:text-gray-600 text-center"
          >
            Esqueci minha senha
          </button>
        </div>
      </div>
    </div>
  )
}