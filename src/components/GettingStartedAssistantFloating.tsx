'use client';

import React, { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const steps = [
  { title: 'Configure seu perfil', desc: 'Adicione nome, foto e contato em Configurações → Meu perfil. Isso torna seu link público mais profissional.' },
  { title: 'Crie seus serviços', desc: 'Em Serviços, adicione os tipos de atendimento (nome, duração, preço). Cada serviço vira uma opção para agendamento.' },
  { title: 'Ajuste sua disponibilidade', desc: 'Em Disponibilidade defina dias/horários de atendimento e bloqueie períodos que você não atende.' },
  { title: 'Publique seu link', desc: 'Copie o link público do seu perfil para compartilhar com clientes ou colocar no seu site.' },
  { title: 'Teste um agendamento', desc: 'Faça um teste usando seu link público para confirmar horários, notificações e confirmação de agendamento.' },
];

export default function GettingStartedAssistantFloating() {
  const STORAGE_KEY = 'agp_getting_started_v1';
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const handler = () => {
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.index === 'number') setIndex(parsed.index);
          if (Array.isArray(parsed.completed)) setCompleted(parsed.completed);
        }
      } catch (e) {}
      setOpen(true);
    };

    window.addEventListener('open-getting-started-floating', handler as EventListener);
    return () => window.removeEventListener('open-getting-started-floating', handler as EventListener);
  }, []);

  // Auto-open for new users (no saved progress and recently created profile)
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (loading || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return; // already has progress
    } catch (e) {
      // ignore
    }

    if (!profile) return;

    const dateStr = profile.trial_started_at || profile.created_at;
    if (!dateStr) return;

    const createdAt = new Date(dateStr).getTime();
    const now = Date.now();
    // consider 'new' if account created within last 14 days
    const TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;
    if (now - createdAt <= TWO_WEEKS) {
      setIndex(0);
      setOpen(true);
    }
  }, [profile, loading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ index, completed })); } catch (e) {}
  }, [index, completed]);

  if (!open) return null;

  const step = steps[index];

  const next = () => setIndex((i) => Math.min(steps.length - 1, i + 1));
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const markDone = () => {
    if (completed.includes(index)) return;
    const nc = [...completed, index];
    setCompleted(nc);
    setIndex((i) => Math.min(steps.length - 1, i + 1));
  };
  const resetProgress = () => {
    setCompleted([]);
    setIndex(0);
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  };
  const close = () => setOpen(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-full">
      <div className="bg-white rounded-lg shadow-lg p-4 border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge>Primeiros passos</Badge>
              <div className="text-sm text-muted-foreground">{index + 1}/{steps.length}</div>
            </div>
            <h3 className="mt-2 text-lg font-semibold flex items-center justify-between">
              <span className="break-words">{step.title}</span>
              {completed.includes(index) && (<span className="text-xs text-green-600 font-semibold">Concluído</span>)}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 whitespace-normal break-words">{step.desc}</p>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                {steps.map((_, i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full ${i <= index ? 'bg-primary' : 'bg-neutral-200'}`} style={{ minWidth: 0 }} />
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="ghost" onClick={prev} disabled={index === 0}>Anterior</Button>
                {!completed.includes(index) && (<Button variant="secondary" onClick={markDone}>Marcar passo como feito</Button>)}
                {index < steps.length - 1 ? (<Button onClick={next}>Próximo</Button>) : (<Button onClick={close}>Concluir</Button>)}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={resetProgress}>Resetar</Button>
                <Button variant="ghost" onClick={close}>Fechar</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

