'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ExternalLink } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Política de Privacidade e Proteção de Dados</h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Introdução</h2>
          <p className="text-sm leading-relaxed">
            A <strong>AgendaFlow</strong> ("Plataforma", "nós", "nosso") está comprometida em proteger sua privacidade e garantir que você tenha uma experiência positiva em nossa plataforma. Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos seus dados pessoais em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD)</strong> e outras legislações aplicáveis.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2. Dados que Coletamos</h2>
          <p className="text-sm leading-relaxed mb-3">
            Coletamos diferentes categorias de dados dependendo de seu perfil de usuário:
          </p>
          
          <div className="space-y-4 ml-4">
            <div>
              <h3 className="font-semibold text-base">2.1 Profissionais (Prestadores de Serviço)</h3>
              <ul className="list-disc pl-6 text-sm space-y-2 mt-2">
                <li><strong>Dados Pessoais:</strong> Nome completo, email, telefone WhatsApp, CPF (se aplicável)</li>
                <li><strong>Dados Profissionais:</strong> Profissão, categoria de serviço, localização (cidade, estado, endereço), biografia, foto de perfil</li>
                <li><strong>Dados de Disponibilidade:</strong> Horários de funcionamento, datas bloqueadas, configurações de agendamento</li>
                <li><strong>Dados de Serviços:</strong> Descrição dos serviços, preços, duração, cores personalizadas</li>
                <li><strong>Dados de Assinatura:</strong> Plano contratado, status de pagamento, data de início/término, histórico de transações</li>
                <li><strong>Dados de Clientes:</strong> Nomes, telefones, emails, notas de preferência dos clientes atendidos</li>
                <li><strong>Dados de Agendamentos:</strong> Histórico completo de agendamentos, confirmações, cancelamentos</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base">2.2 Clientes (Agendadores)</h3>
              <ul className="list-disc pl-6 text-sm space-y-2 mt-2">
                <li><strong>Dados Pessoais:</strong> Nome completo, telefone WhatsApp, email (opcional), observações sobre atendimento</li>
                <li><strong>Dados de Agendamento:</strong> Data, horário, serviço selecionado, status do agendamento</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base">2.3 Dados Técnicos (Todos os Usuários)</h3>
              <ul className="list-disc pl-6 text-sm space-y-2 mt-2">
                <li>Endereço IP, navegador, sistema operacional, localização aproximada</li>
                <li>Cookies e identificadores de sessão para análise de uso</li>
                <li>Logs de acesso à plataforma</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">3. Como Coletamos Dados</h2>
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li><strong>Direto de você:</strong> Através de formulários de registro, perfil, agendamento e configurações</li>
            <li><strong>Automaticamente:</strong> Logs de sistema, cookies, análise de uso</li>
            <li><strong>De terceiros:</strong> Integração com Supabase, Stripe e análise de dados</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4. Finalidade do Processamento de Dados</h2>
          <p className="text-sm leading-relaxed mb-3">Utilizamos seus dados para:</p>
          
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li><strong>Fornecimento de Serviço:</strong> Criação de conta, gerenciamento de agendamentos, notificações via Email</li>
            <li><strong>Gestão de Assinatura:</strong> Controle de planos e renovações via Stripe</li>
            <li><strong>Melhorias:</strong> Análise de uso para otimizar a plataforma</li>
            <li><strong>Segurança:</strong> Detecção e prevenção de fraudes, proteção de dados</li>
            <li><strong>Conformidade Legal:</strong> Cumprimento de obrigações regulatórias e legais</li>
            <li><strong>Comunicação:</strong> Respostas a dúvidas, lembretes de agendamento, atualizações de conta</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. Base Legal para Processamento</h2>
          <p className="text-sm leading-relaxed">Conforme a LGPD, processamos seus dados com base em:</p>
          <ul className="list-disc pl-6 text-sm space-y-2 mt-2">
            <li><strong>Execução de Contrato:</strong> Para fornecer os serviços que você contratou</li>
            <li><strong>Consentimento:</strong> Para atividades não essenciais (newsletters, análises)</li>
            <li><strong>Obrigação Legal:</strong> Para cumprir leis e regulamentos</li>
            <li><strong>Interesses Legítimos:</strong> Para melhorar serviços, segurança e prevenção de fraudes</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">6. Compartilhamento de Dados com Terceiros</h2>
          <p className="text-sm leading-relaxed mb-3">
            Seus dados podem ser compartilhados apenas com:
          </p>
          
          <div className="space-y-3 text-sm ml-4">
            <div>
              <h3 className="font-semibold"><strong>Supabase (Banco de Dados)</strong></h3>
              <p className="text-muted-foreground">Armazenamento seguro em servidor PostgreSQL com encriptação</p>
            </div>
            <div>
              <h3 className="font-semibold"><strong>Stripe (Pagamentos)</strong></h3>
              <p className="text-muted-foreground">Processamento de pagamentos conforme padrão PCI-DSS. Nunca armazenamos dados de cartão</p>
            </div>
            <div>
              <h3 className="font-semibold"><strong>Perfis Públicos (Profissionais)</strong></h3>
              <p className="text-muted-foreground">Seu perfil profissional é visível publicamente (nome, foto, bio, serviços, horários) para permitir agendamentos. Dados de clientes nunca são compartilhados publicamente</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed mt-4 bg-yellow-50 p-4 rounded border border-yellow-200">
            <strong>Importante:</strong> Não vendemos, alugamos ou compartilhamos seus dados com terceiros para marketing ou fins comerciais não autorizados.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">7. Período de Retenção de Dados</h2>
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li><strong>Contas Ativas:</strong> Mantidos enquanto você for assinante ativo</li>
            <li><strong>Contas Canceladas:</strong> Até 90 dias para garantir reversão de transações e conformidade fiscal</li>
            <li><strong>Dados de Agendamentos:</strong> Mantidos por 2 anos para fins de auditoria e histórico</li>
            <li><strong>Dados Técnicos:</strong> Logs retidos por máximo 30 dias</li>
            <li><strong>Backup:</strong> Mantidos conforme política de retenção do Supabase (30-90 dias)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">8. Segurança de Dados</h2>
          <p className="text-sm leading-relaxed mb-3">
            Implementamos medidas de segurança técnicas e organizacionais:
          </p>
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li>Encriptação end-to-end (HTTPS/SSL)</li>
            <li>Autenticação segura via Supabase Auth</li>
            <li>Row-Level Security (RLS) nas tabelas de banco de dados</li>
            <li>Senhas armazenadas com hash seguro</li>
            <li>Acesso restrito apenas a dados relevantes (o profissional só vê seus clientes)</li>
            <li>Backups automáticos e encriptados</li>
            <li>Monitoramento contínuo de segurança</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Isenção de Responsabilidade:</strong> Embora implementemos protocolos robustos, nenhum sistema é 100% seguro. Você é responsável por manter sua senha confidencial.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">9. Seus Direitos (Conforme LGPD)</h2>
          <p className="text-sm leading-relaxed mb-3">
            Você tem os seguintes direitos sobre seus dados pessoais:
          </p>
          
          <div className="space-y-3 text-sm ml-4">
            <div>
              <h3 className="font-semibold">✓ Direito de Acesso</h3>
              <p className="text-muted-foreground">Solicitar e receber cópia de seus dados armazenados</p>
            </div>
            <div>
              <h3 className="font-semibold">✓ Direito de Retificação</h3>
              <p className="text-muted-foreground">Corrigir dados incorretos ou incompletos</p>
            </div>
            <div>
              <h3 className="font-semibold">✓ Direito de Exclusão</h3>
              <p className="text-muted-foreground">Solicitar a exclusão de seus dados (conforme permitido por lei)</p>
            </div>
            <div>
              <h3 className="font-semibold">✓ Direito à Portabilidade</h3>
              <p className="text-muted-foreground">Receber seus dados em formato estruturado e portável</p>
            </div>
            <div>
              <h3 className="font-semibold">✓ Direito à Limitação</h3>
              <p className="text-muted-foreground">Limitar o processamento de seus dados em certas circunstâncias</p>
            </div>
            <div>
              <h3 className="font-semibold">✓ Direito de Oposição</h3>
              <p className="text-muted-foreground">Opor-se ao processamento de dados para fins específicos</p>
            </div>
            <div>
              <h3 className="font-semibold">✓ Direito a Não Ser Submetido</h3>
              <p className="text-muted-foreground">À tomada de decisão automatizada que afete significativamente seus direitos</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed mt-4 bg-blue-50 p-4 rounded border border-blue-200">
            Para exercer qualquer destes direitos, envie uma solicitação para <strong>contato@AgendaFlow.com</strong> com detalhes da sua solicitação. Responderemos em até 15 dias úteis.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">10. Cookies e Tecnologias de Rastreamento</h2>
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li><strong>Cookies Essenciais:</strong> Necessários para operação da plataforma (autenticação, segurança)</li>
            <li><strong>Cookies de Análise:</strong> Ajudam a entender como você usa a plataforma</li>
            <li><strong>Controle:</strong> Você pode controlar cookies em suas configurações de navegador</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">11. Dados de Crianças</h2>
          <p className="text-sm leading-relaxed">
            A AgendaFlow não é destinada a menores de 13 anos. Não coletamos intencionalmente dados de crianças. Se soubermos que uma criança forneceu dados pessoais, excluiremos imediatamente e notificaremos o responsável.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">12. Transferências Internacionais</h2>
          <p className="text-sm leading-relaxed">
            Seus dados podem ser processados em servidores localizados fora do Brasil. O Supabase opera em conformidade com GDPR (EU) e LGPD (Brasil). Ao usar nossa plataforma, você consente com essas transferências.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">13. Mudanças nesta Política</h2>
          <p className="text-sm leading-relaxed">
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você de mudanças significativas por email ou aviso na plataforma. Seu uso continuado indica aceitação das mudanças.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">14. Responsável pela Proteção de Dados</h2>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm space-y-2">
            <p><strong>AgendaFlow</strong></p>
            <p>Email: contato@AgendaFlow.com</p>
            <p className="text-muted-foreground">Somos o controlador dos dados pessoais processados através da plataforma.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">15. Contato e Suporte</h2>
          <p className="text-sm leading-relaxed mb-3">
            Para dúvidas sobre esta Política de Privacidade ou para exercer seus direitos conforme LGPD:
          </p>
          <div className="bg-primary/5 p-4 rounded border border-primary/20 text-sm space-y-2">
            <p><strong>Email:</strong> contato@AgendaFlow.com</p>
            <p><strong>Tempo de Resposta:</strong> 15 dias úteis</p>
            <p><strong>Idioma:</strong> Português (Brasil)</p>
          </div>
        </section>

        <section className="space-y-4 bg-green-50 p-4 rounded border border-green-200">
          <h2 className="text-lg font-bold">✓ Seu Compromisso com Privacidade</h2>
          <p className="text-sm leading-relaxed">
            Você pode confiar que sua privacidade é nossa prioridade. Tratamos seus dados com o máximo respeito e protegemos suas informações com as mais altas práticas de segurança de dados. Se em algum momento você tiver dúvidas, entre em contato conosco.
          </p>
        </section>

        <hr className="my-8" />

        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <Link href="`/" className="flex items-center gap-2 text-sm text-primary hover:underline">
            <span>← Voltar à home</span>
          </Link>
          <Link href="`/terms" className="flex items-center gap-2 text-sm text-primary hover:underline">
            <span>Ler Termos de Serviço</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
          <a href="mailto:contato@AgendaFlow.com" className="flex items-center gap-2 text-sm text-primary hover:underline">
            <span>Contatar Suporte</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}



