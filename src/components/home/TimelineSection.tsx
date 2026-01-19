'use client';

import Timeline from './Timeline';

const timelineData = [
  {
    title: "2024",
    content: (
      <div className="text-sm md:text-base text-muted-foreground space-y-4">
        <p>
          <strong>Lançamento do AgendaFlow:</strong> Começamos uma missão para
          simplificar o agendamento para profissionais autônomos e pequenas
          empresas. Nossa plataforma foi desenvolvida com foco em facilidade de
          uso e automação inteligente.
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs md:text-sm mt-4">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="font-semibold text-primary">1000+</p>
            <p className="text-muted-foreground">Profissionais</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="font-semibold text-primary">10K+</p>
            <p className="text-muted-foreground">Agendamentos</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Q1 2024",
    content: (
      <div className="text-sm md:text-base text-muted-foreground space-y-4">
        <p>
          <strong>Integração com Stripe:</strong> Adicionamos pagamento seguro
          na plataforma. Agora profissionais podem receber pagamentos
          automaticamente quando clientes realizam agendamentos.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Processamento automático de pagamentos</li>
          <li>Integração com Stripe</li>
          <li>Segurança PCI-DSS</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Q2 2024",
    content: (
      <div className="text-sm md:text-base text-muted-foreground space-y-4">
        <p>
          <strong>Gestão de Clientes:</strong> Sistema completo para
          armazenar histórico, preferências e dados de contato dos seus
          clientes em um só lugar.
        </p>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mt-4">
          <p className="text-sm font-semibold text-primary">Melhor organização e produtividade</p>
        </div>
      </div>
    ),
  },
  {
    title: "Q3 2024",
    content: (
      <div className="text-sm md:text-base text-muted-foreground space-y-4">
        <p>
          <strong>Recursos Avançados:</strong> Rescalonamento automático, bloqueio
          de datas, múltiplos serviços por profissional e gerenciamento de
          clientes.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Múltiplos calendários</li>
          <li>Gestão de clientes avançada</li>
          <li>Relatórios detalhados</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Q4 2024",
    content: (
      <div className="text-sm md:text-base text-muted-foreground space-y-4">
        <p>
          <strong>Conformidade LGPD:</strong> Implementamos total conformidade
          com a Lei Geral de Proteção de Dados (LGPD). Seus dados estão
          protegidos com criptografia de ponta a ponta.
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs md:text-sm mt-4">
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <p className="font-semibold text-green-600">🔒 LGPD</p>
            <p className="text-muted-foreground">Compliant</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <p className="font-semibold text-green-600">🔐 Criptografia</p>
            <p className="text-muted-foreground">End-to-End</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Próximos Passos",
    content: (
      <div className="text-sm md:text-base text-muted-foreground space-y-4">
        <p>
          <strong>Novidades em 2025:</strong> Estamos trabalhando em integração
          com Google Calendar, geração de relatórios avançados, e API pública
          para integrações personalizadas.
        </p>
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mt-4">
          <p className="text-sm font-semibold text-primary">🚀 Em Desenvolvimento</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2 text-xs md:text-sm">
            <li>Integração Google Calendar & Outlook</li>
            <li>API Pública e Webhooks</li>
            <li>Análises Avançadas com IA</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export default function TimelineSection() {
  return (
    <section className="py-10 lg:py-20 bg-background">
      <Timeline data={timelineData} />
    </section>
  );
}

