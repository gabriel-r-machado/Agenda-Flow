# Configuração de E-mails com Resend

Este projeto usa [Resend](https://resend.com/) para envio de e-mails transacionais.

## Funcionalidades Implementadas

1. ✅ **Confirmação de E-mail** - Enviado automaticamente quando um novo usuário se cadastra
2. ✅ **Recuperação de Senha** - Enviado quando o usuário solicita redefinição de senha
3. ❌ **Notificação de Agendamento** - DESABILITADO (não envia mais e-mails para novos agendamentos)

## Configuração

### 1. Criar conta no Resend

1. Acesse https://resend.com/
2. Crie uma conta gratuita
3. Verifique seu domínio ou use o domínio de teste `onboarding@resend.dev`

### 2. Obter API Key

1. No painel do Resend, vá em **API Keys**
2. Crie uma nova API Key
3. Copie a chave (ela só é mostrada uma vez!)

### 3. Configurar Variáveis de Ambiente no Supabase

#### Via Dashboard (Recomendado)

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Vá em **Project Settings** > **Edge Functions**
3. Na seção **Secrets**, adicione:
   - `RESEND_API_KEY`: Sua API key do Resend
   - `RESEND_SENDER_EMAIL`: Seu e-mail verificado (ex: `noreply@seudominio.com`) ou use `onboarding@resend.dev` para testes

#### Via CLI (Opcional)

```bash
# Navegar até a pasta do projeto
cd supabase

# Definir secrets
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
supabase secrets set RESEND_SENDER_EMAIL=noreply@seudominio.com
```

### 4. Deploy das Edge Functions

```bash
# Deploy de todas as funções
supabase functions deploy send-confirmation-email
supabase functions deploy send-password-reset-email
```

### 5. Configurar Database Settings (Para Triggers)

Execute no SQL Editor do Supabase:

```sql
-- Substitua pelos seus valores reais
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://hndfviqcbvcctvdjhami.supabase.co';
ALTER DATABASE postgres SET app.settings.service_role_key = 'sua-service-role-key';
ALTER DATABASE postgres SET app.settings.site_url = 'http://localhost:3000'; -- ou seu domínio de produção
```

### 6. Aplicar Migration

```bash
# Aplicar a migration que cria os triggers
supabase db push
```

## Como Funciona

### Confirmação de E-mail

1. Usuário se cadastra via `/auth`
2. Trigger `on_auth_user_created` é acionado
3. Edge Function `send-confirmation-email` é chamada
4. Resend envia o e-mail com link de confirmação
5. Usuário clica no link e confirma o e-mail

### Recuperação de Senha

1. Usuário clica em "Esqueci a senha"
2. Frontend chama `supabase.auth.resetPasswordForEmail()`
3. Trigger `on_auth_user_password_reset` é acionado
4. Edge Function `send-password-reset-email` é chamada
5. Resend envia o e-mail com link de redefinição
6. Usuário clica no link e define nova senha

## Testando Localmente

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Iniciar Supabase Local

```bash
supabase start
```

### 3. Definir Secrets Locais

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx --env-file ./supabase/.env.local
supabase secrets set RESEND_SENDER_EMAIL=onboarding@resend.dev --env-file ./supabase/.env.local
```

### 4. Testar Edge Functions

```bash
# Testar confirmação de e-mail
supabase functions serve send-confirmation-email

# Em outro terminal
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-confirmation-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"email":"teste@exemplo.com","name":"Teste","confirmationUrl":"http://localhost:3000/auth/confirm?token=123"}'
```

## Personalização de E-mails

Os templates de e-mail estão nos arquivos:
- `supabase/functions/send-confirmation-email/index.ts`
- `supabase/functions/send-password-reset-email/index.ts`

Você pode personalizar:
- Cores e estilos
- Textos e mensagens
- Logo da empresa (adicione URL da imagem)
- Informações de rodapé

## Troubleshooting

### E-mails não estão sendo enviados

1. Verifique se as variáveis de ambiente estão configuradas:
   ```bash
   supabase secrets list
   ```

2. Verifique os logs das Edge Functions:
   ```bash
   supabase functions logs send-confirmation-email
   supabase functions logs send-password-reset-email
   ```

3. Verifique se o domínio está verificado no Resend

### E-mails vão para spam

1. Configure SPF, DKIM e DMARC no seu domínio
2. Use um domínio verificado no Resend
3. Evite palavras spam no assunto e conteúdo

### Limites do Plano Gratuito

O plano gratuito do Resend permite:
- 3.000 e-mails por mês
- 100 e-mails por dia

Para mais, considere upgrade para plano pago.

## Produção

Para produção, certifique-se de:

1. ✅ Usar domínio próprio verificado
2. ✅ Configurar `RESEND_SENDER_EMAIL` com e-mail do seu domínio
3. ✅ Atualizar `app.settings.site_url` para o domínio de produção
4. ✅ Configurar DNS (SPF, DKIM, DMARC) corretamente
5. ✅ Monitorar logs e taxa de entrega

## Recursos

- [Documentação Resend](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Email Best Practices](https://resend.com/docs/knowledge-base/best-practices)
