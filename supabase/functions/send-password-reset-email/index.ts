const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDER_EMAIL = Deno.env.get('RESEND_SENDER_EMAIL') || 'onboarding@resend.dev'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, resetUrl } = await req.json()

    if (!email || !resetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar senha - AgendarPlus</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 Recuperação de Senha</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Olá,
                    </p>
                    <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Recebemos uma solicitação para redefinir a senha da sua conta no <strong>AgendarPlus</strong>.
                    </p>
                    <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Clique no botão abaixo para criar uma nova senha:
                    </p>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.39);">
                            Redefinir Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <table role="presentation" style="width: 100%; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px; margin: 30px 0;" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                            ⚠️ <strong>Atenção:</strong> Este link expira em 1 hora por motivos de segurança.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Se você não solicitou a recuperação de senha, pode ignorar este e-mail com segurança. Sua senha não será alterada.
                    </p>
                    
                    <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                      Ou copie e cole este link no seu navegador:<br>
                      <a href="${resetUrl}" style="color: #f59e0b; word-break: break-all;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
                      Este email foi enviado pelo <strong>AgendarPlus</strong>
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      Sistema de agendamentos online • ${new Date().getFullYear()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [email],
        subject: 'Recuperação de senha - AgendarPlus',
        html: emailHtml,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: resendData }),
        { status: resendResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Email sent successfully:', resendData)

    return new Response(
      JSON.stringify({ success: true, data: resendData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
