'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const router = useRouter()

  function handleLogin() {
    if (email && senha) {
      router.push('/dashboard')
    }
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
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
            />
          </div>

          <button
            onClick={handleLogin}
            className="mt-2 w-full bg-gray-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Entrar
          </button>
        </div>

      </div>
    </div>
  )
}