'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function GettingStarted() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Primeiros passos</h1>
        <p className="text-muted-foreground">Aqui está um guia rápido para começar a agendar com o AgendaFlow.</p>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">1 — Configure seu perfil</h2>
          <p className="text-sm text-muted-foreground">Adicione seu nome, foto e informações de contato em <strong>Configurações → Meu perfil</strong>.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">2 — Crie seus serviços</h2>
          <p className="text-sm text-muted-foreground">Vá em <strong>Serviços</strong> e adicione os tipos de atendimento que você oferece (nome, duração, preço).</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">3 — Ajuste sua disponibilidade</h2>
          <p className="text-sm text-muted-foreground">Em <strong>Disponibilidade</strong> defina os dias e horários em que você atende e bloqueie períodos não disponíveis.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">4 — Publique seu link de agendamento</h2>
          <p className="text-sm text-muted-foreground">Seu link público permite que clientes agendem diretamente. Acesse <strong>Perfil público</strong> para ver e copiar o link.</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">5 — Teste um agendamento</h2>
          <p className="text-sm text-muted-foreground">Simule um agendamento usando o link público para garantir que horários e notificações funcionem.</p>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => router.push('/settings')}>Ir para Configurações</Button>
          <Button variant="secondary" onClick={() => router.push('/services')}>Criar Serviço</Button>
        </div>
      </div>
    </div>
  );
}



