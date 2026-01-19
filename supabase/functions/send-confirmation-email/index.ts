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

    const { email, name, confirmationUrl } = await req.json()

    if (!email || !confirmationUrl) {
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
        <title>Confirme seu e-mail - AgendarPlus</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">✨ Bem-vindo ao AgendarPlus!</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Olá${name ? ` <strong>${name}</strong>` : ''},
                    </p>
                    <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Obrigado por se cadastrar no <strong>AgendarPlus</strong>! 🎉
                    </p>
                    <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Para começar a usar sua conta, você precisa confirmar seu endereço de e-mail. Clique no botão abaixo:
                    </p>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);">
                            Confirmar E-mail
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Se você não criou esta conta, pode ignorar este e-mail com segurança.
                    </p>
                    
                    <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                      Ou copie e cole este link no seu navegador:<br>
                      <a href="${confirmationUrl}" style="color: #6366f1; word-break: break-all;">${confirmationUrl}</a>
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
        subject: 'Confirme seu e-mail - AgendarPlus',
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
