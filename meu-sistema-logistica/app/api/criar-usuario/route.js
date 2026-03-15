import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('Criando usuário:', body.email)

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.senha,
      email_confirm: true,
    })

    if (authError) {
      console.log('Erro auth:', authError)
      return Response.json({ error: authError.message }, { status: 400 })
    }

    console.log('Auth criado:', authData.user.id)

    const { data: dbData, error: dbError } = await supabaseAdmin.from('usuarios').insert([{
      nome: body.nome,
      email: body.email,
      nivel: body.nivel,
      empresa_id: body.empresa_id || null,
      setor_id: body.setor_id || null,
      modulos: body.modulos?.length > 0 ? body.modulos : ['todos'],
      status: body.status || 'Ativo',
      auth_id: authData.user.id,
      primeiro_acesso: true,
    }]).select()

    if (dbError) {
      console.log('Erro db:', dbError)
      return Response.json({ error: dbError.message }, { status: 400 })
    }

    console.log('Usuário criado no db:', dbData)
    return Response.json({ success: true, data: dbData })

  } catch (error) {
    console.log('Erro geral:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}