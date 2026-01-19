'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ExternalLink } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Termos de Serviço</h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Aceitação dos Termos</h2>
          <p className="text-sm leading-relaxed">
            Ao acessar e usar a plataforma <strong>AgendaFlow</strong>, você concorda em cumprir estes Termos de Serviço e todas as leis e regulamentos aplicáveis. Se você não concordar com qualquer parte destes termos, você não pode usar esta plataforma.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2. Descrição do Serviço</h2>
          <p className="text-sm leading-relaxed">
            A AgendaFlow é uma plataforma de agendamento online que permite profissionais criarem perfis públicos e clientes agendarem serviços. Fornecemos:
          </p>
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li>Perfil profissional personalizável</li>
            <li>Gerenciamento de disponibilidade e agendamentos</li>
            <li>Página pública para agendamentos de clientes</li>
            <li>Relatórios e análises de agendamentos</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">3. Elegibilidade</h2>
          <p className="text-sm leading-relaxed">
            Você deve ter pelo menos 18 anos de idade para usar esta plataforma. Ao se registrar, você garante que:
          </p>
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li>É uma pessoa natural ou jurídica maior de idade</li>
            <li>Tem autoridade legal para vincular-se a estes termos</li>
            <li>As informações fornecidas são verdadeiras e precisas</li>
            <li>Não está violando nenhuma lei ou regulamento</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4. Conta do Usuário</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold">4.1 Responsabilidade da Conta</h3>
              <p className="text-muted-foreground">
                Você é responsável por manter a confidencialidade de sua senha e é totalmente responsável por todas as atividades realizadas sob sua conta. Você concorda em:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Notificar-nos imediatamente de qualquer acesso não autorizado</li>
                <li>Manter suas credenciais seguras</li>
                <li>Atualizar informações de contato para receber notificações importantes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">4.2 Exclusão de Conta</h3>
              <p className="text-muted-foreground">
                Você pode solicitar a exclusão de sua conta a qualquer momento. Seus dados serão retidos conforme a Política de Privacidade para fins legais e auditoria.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. Pagamentos e Assinatura</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold">5.1 Planos Disponíveis</h3>
              <p className="text-muted-foreground">
                Oferecemos diferentes planos com funcionalidades variadas. Consulte nossa página de preços para detalhes atualizados sobre cada plano.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">5.2 Período de Gratuito (Trial)</h3>
              <p className="text-muted-foreground">
                Novos usuários recebem 3 dias de teste gratuito. Após este período, será necessário escolher um plano pago para continuar usando a plataforma.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">5.3 Cobranças e Renovação</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Todas as assinaturas se renovam automaticamente conforme o ciclo escolhido (mensal ou anual)</li>
                <li>A cobrança ocorre no cartão cadastrado 7 dias antes do vencimento</li>
                <li>Você será notificado de renovações por email</li>
                <li>Alteração ou cancelamento deve ser realizado em Configurações antes da data de renovação</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">5.4 Reembolsos</h3>
              <p className="text-muted-foreground">
                Reembolsos são processados em conformidade com a política de cada plano. Contate suporte para solicitar reembolso dentro de 7 dias após o pagamento.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">5.5 Falha de Pagamento</h3>
              <p className="text-muted-foreground">
                Se um pagamento falhar, sua assinatura será suspensa até que o pagamento seja processado com sucesso. Tentaremos cobrar novamente automaticamente nos próximos 7 dias.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">6. Limitações de Responsabilidade</h2>
          <p className="text-sm leading-relaxed">
            A AgendaFlow não se responsabiliza por:
          </p>
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li>Perdas financeiras ou dados resultantes de falhas técnicas</li>
            <li>Danos indiretos, incidentais ou consequentes</li>
            <li>Comportamento inadequado de usuários (clientes ou profissionais)</li>
            <li>Conteúdo fornecido por terceiros</li>
            <li>Interrupções não previstas do serviço</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3 bg-yellow-50 p-4 rounded border border-yellow-200">
            <strong>Responsabilidade Máxima:</strong> Nossa responsabilidade total por qualquer reclamação não excede o valor que você pagou nos últimos 12 meses.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">7. Políticas de Uso Aceitável</h2>
          <p className="text-sm leading-relaxed mb-3">
            Você concorda em NÃO usar a plataforma para:
          </p>
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li>Qualquer atividade ilegal ou que viole direitos de terceiros</li>
            <li>Assédio, ameaças ou abuso de outros usuários</li>
            <li>Spam, phishing ou malware</li>
            <li>Acesso não autorizado a sistemas ou dados</li>
            <li>Fraude ou enganação</li>
            <li>Conteúdo discriminatório ou ofensivo</li>
            <li>Violação de propriedade intelectual</li>
            <li>Venda de dados pessoais sem consentimento</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">8. Propriedade Intelectual</h2>
          <p className="text-sm leading-relaxed">
            Todos os conteúdos da plataforma (design, código, textos, logos) são propriedade da AgendaFlow ou de seus licenciadores. Você concede à AgendaFlow uma licença não exclusiva para usar seu nome, foto e profissão em seu perfil público.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">9. Conteúdo do Usuário</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold">9.1 Responsabilidade</h3>
              <p className="text-muted-foreground">
                Você é totalmente responsável por todo conteúdo que publica (fotos, descrições, valores, disponibilidades). Você garante que possui direitos sobre este conteúdo.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">9.2 Direitos Concedidos</h3>
              <p className="text-muted-foreground">
                Ao publicar conteúdo, você concede à AgendaFlow direito de exibir, reproduzir e distribuir este conteúdo através da plataforma.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">9.3 Remoção de Conteúdo</h3>
              <p className="text-muted-foreground">
                Podemos remover conteúdo que viole estes termos, sem aviso prévio.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">10. Modificação do Serviço</h2>
          <p className="text-sm leading-relaxed">
            Reservamos o direito de modificar, suspender ou descontinuar a plataforma a qualquer momento. Notificaremos você de mudanças significativas por email com 30 dias de antecedência quando possível.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">11. Rescisão</h2>
          <p className="text-sm leading-relaxed">
            Podemos encerrar ou suspender sua conta imediatamente se:
          </p>
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li>Você violar estes Termos de Serviço</li>
            <li>Sua conta estiver inativa por 12 meses</li>
            <li>Você realizar atividades ilegais ou fraudulentas</li>
            <li>Você assediar outros usuários</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">12. Garantia de Agendamentos</h2>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Profissionais:</strong> Você é responsável por cumprir os compromissos de agendamento. AgendaFlow não é responsável por não cumprimento de agendamentos ou disputas com clientes.
            </p>
            <p>
              <strong>Clientes:</strong> Ao agendar, você concorda com os termos do profissional, incluindo políticas de cancelamento e rescisão.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">13. Aviso Legal (Disclaimer)</h2>
          <p className="text-sm leading-relaxed">
            A plataforma é fornecida "COMO ESTÁ" sem garantias de qualquer tipo. AgendaFlow não garante que:
          </p>
          <ul className="list-disc pl-6 text-sm space-y-2">
            <li>O serviço será ininterrupto ou sem erros</li>
            <li>Defeitos serão corrigidos</li>
            <li>O serviço atenderá suas expectativas</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">14. Lei Aplicável</h2>
          <p className="text-sm leading-relaxed">
            Estes Termos de Serviço são regidos pelas leis da <strong>República Federativa do Brasil</strong>, especificamente as leis do estado de São Paulo, sem considerar conflitos de leis. Qualquer disputa será resolvida nos tribunais competentes de São Paulo.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">15. Resolução de Disputas</h2>
          <p className="text-sm leading-relaxed mb-3">
            Antes de processar judicialmente, você concorda em:
          </p>
          <ol className="list-decimal pl-6 text-sm space-y-2">
            <li>Notificar-nos por escrito sobre a disputa</li>
            <li>Tentar resolver amigavelmente em 30 dias</li>
            <li>Se não resolvido, submeter a mediação antes de litigância</li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">16. Modificações dos Termos</h2>
          <p className="text-sm leading-relaxed">
            Podemos atualizar estes Termos de Serviço periodicamente. Notificaremos mudanças significativas por email. Seu uso continuado indica aceitação dos termos modificados.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">17. Contato</h2>
          <div className="bg-primary/5 p-4 rounded border border-primary/20 text-sm space-y-2">
            <p><strong>Email:</strong> contato@AgendaFlow.com</p>
            <p><strong>Idioma:</strong> Português (Brasil)</p>
            <p className="text-muted-foreground">Dúvidas sobre estes Termos? Entre em contato conosco.</p>
          </div>
        </section>

        <hr className="my-8" />

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="`/" className="flex items-center gap-2 text-sm text-primary hover:underline">
            <span>← Voltar à home</span>
          </Link>
          <Link href="`/privacy" className="flex items-center gap-2 text-sm text-primary hover:underline">
            <span>Ler Política de Privacidade</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}



