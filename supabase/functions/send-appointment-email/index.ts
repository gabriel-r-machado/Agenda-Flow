const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDER_EMAIL = Deno.env.get('RESEND_SENDER_EMAIL') || 'onboarding@resend.dev'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate API key
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const {
      professionalEmail,
      professionalName,
      clientName,
      clientPhone,
      serviceName,
      appointmentDate,
      appointmentTime,
      servicePrice,
    } = await req.json()

    // Validate required fields
    if (!professionalEmail || !clientName || !serviceName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formattedDate = new Date(appointmentDate + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Novo Agendamento - AgendarPlus</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Novo Agendamento!</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Olá <strong>${professionalName}</strong>,
                    </p>
                    <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Você recebeu um novo agendamento através do <strong>AgendarPlus</strong>! 🎊
                    </p>
                    
                    <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; padding-bottom: 4px;">👤 Cliente:</td>
                            </tr>
                            <tr>
                              <td style="color: #111827; font-size: 16px; font-weight: 600;">${clientName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 12px 0; border-top: 1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; padding-bottom: 4px;">📞 Telefone:</td>
                            </tr>
                            <tr>
                              <td style="color: #111827; font-size: 16px; font-weight: 600;">${clientPhone}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 12px 0; border-top: 1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; padding-bottom: 4px;">💼 Serviço:</td>
                            </tr>
                            <tr>
                              <td style="color: #111827; font-size: 16px; font-weight: 600;">${serviceName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 12px 0; border-top: 1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; padding-bottom: 4px;">📅 Data e Horário:</td>
                            </tr>
                            <tr>
                              <td style="color: #111827; font-size: 16px; font-weight: 600;">${formattedDate} às ${appointmentTime.slice(0, 5)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 12px 0; border-top: 1px solid #e5e7eb;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; padding-bottom: 4px;">💰 Valor:</td>
                            </tr>
                            <tr>
                              <td style="color: #10b981; font-size: 20px; font-weight: 700;">R$ ${servicePrice.toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      💡 <strong>Dica:</strong> Acesse seu dashboard para confirmar o agendamento!
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

    const resendData = { success: true, message: 'Email envio desabilitado por enquanto' }

    console.log('Email desabilitado:', resendData)

    return new Response(
      JSON.stringify({ success: true, data: resendData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
