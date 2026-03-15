import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { ordem } = await request.json()

    const { data, error } = await resend.emails.send({
      from: 'LogiSystem <onboarding@resend.dev>',
      to: [ordem.fornecedor_email],
      subject: `Ordem de Compra ${ordem.numero} - LogiSystem`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
          
          <div style="border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 24px; font-weight: 600; margin: 0; color: #1a1a1a;">LogiSystem</h1>
            <p style="font-size: 14px; color: #666; margin: 4px 0 0;">Sistema de Gestão Logística</p>
          </div>

          <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">Ordem de Compra</h2>
          <p style="font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0 0 30px; font-family: monospace;">${ordem.numero}</p>

          <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Dados do Pedido</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #666; width: 40%;">Produto</td>
                <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${ordem.produto}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #666;">Código SKU</td>
                <td style="padding: 8px 0; font-size: 14px; font-family: monospace; color: #1a1a1a;">${ordem.produto_codigo || '—'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #666;">Quantidade</td>
                <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${ordem.quantidade} ${ordem.unidade}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #666;">Valor Unitário</td>
                <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a;">R$ ${Number(ordem.valor).toFixed(2)}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e5e5;">
                <td style="padding: 12px 0 8px; font-size: 14px; color: #666;">Valor Total</td>
                <td style="padding: 12px 0 8px; font-size: 18px; font-weight: 700; color: #1a1a1a;">R$ ${(ordem.quantidade * ordem.valor).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          ${ordem.observacoes ? `
          <div style="background: #fff8e1; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
            <p style="font-size: 12px; font-weight: 600; color: #92400e; margin: 0 0 4px; text-transform: uppercase;">Observações</p>
            <p style="font-size: 14px; color: #78350f; margin: 0;">${ordem.observacoes}</p>
          </div>
          ` : ''}

          <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Solicitado por</h3>
            <p style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 0;">${ordem.solicitante}</p>
            <p style="font-size: 13px; color: #666; margin: 4px 0 0;">${new Date(ordem.created_at).toLocaleDateString('pt-BR')}</p>
          </div>

          <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 20px;">
            <p style="font-size: 13px; color: #999; margin: 0;">Este é um email automático enviado pelo sistema LogiSystem. Por favor não responda diretamente a este email.</p>
          </div>

        </div>
      `
    })

    if (error) return Response.json({ error }, { status: 400 })
    return Response.json({ data })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}