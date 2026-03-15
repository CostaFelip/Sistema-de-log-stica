import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { nome, email, senha, nivel, empresa_id, setor_id, modulos, status } = await request.json()

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 })
    }

    const { error: dbError } = await supabaseAdmin.from('usuarios').insert([{
      nome,
      email,
      nivel,
      empresa_id: empresa_id || null,
      setor_id: setor_id || null,
      modulos: modulos.length > 0 ? modulos : ['todos'],
      status,
      auth_id: authData.user.id,
    }])

    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
