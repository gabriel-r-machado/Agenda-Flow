'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const steps = [
  {
    title: 'Configure seu perfil',
    desc: 'Adicione nome, foto e contato em Configurações → Meu perfil. Isso torna seu link público mais profissional.',
  },
  {
    title: 'Crie seus serviços',
    desc: 'Em Serviços, adicione os tipos de atendimento (nome, duração, preço). Cada serviço vira uma opção para agendamento.',
  },
  {
    title: 'Ajuste sua disponibilidade',
    desc: 'Em Disponibilidade defina dias/horários de atendimento e bloqueie períodos que você não atende.',
  },
  {
    title: 'Publique seu link',
    desc: 'Copie o link público do seu perfil para compartilhar com clientes ou colocar no seu site.',
  },
  {
    title: 'Teste um agendamento',
    desc: 'Faça um teste usando seu link público para confirmar horários, notificações e confirmação de agendamento.',
  },
];

export default function GettingStartedAssistant() {
  const STORAGE_KEY = 'agp_getting_started_v1';

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  // Modal assistant does not auto-open on sidebar click anymore.
  // It can remain mounted but will not listen to the global open event.

  const step = steps[index];

  const saveState = (newIndex: number, newCompleted: number[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ index: newIndex, completed: newCompleted }));
    } catch (e) {
      // ignore
    }
  };

  const next = () => {
    setIndex((i) => {
      const ni = Math.min(steps.length - 1, i + 1);
      saveState(ni, completed);
      return ni;
    });
  };

  const prev = () => {
    setIndex((i) => {
      const ni = Math.max(0, i - 1);
      saveState(ni, completed);
      return ni;
    });
  };

  const finish = () => {
    setOpen(false);
  };

  const markDone = () => {
    if (completed.includes(index)) return;
    const nextCompleted = [...completed, index];
    setCompleted(nextCompleted);
    const ni = Math.min(steps.length - 1, index + 1);
    setIndex(ni);
    saveState(ni, nextCompleted);
  };

  const resetProgress = () => {
    setCompleted([]);
    setIndex(0);
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  useEffect(() => {
    // persist on index change (in case other navigation happens)
    saveState(index, completed);
  }, [index, completed]);

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge>Primeiros passos</Badge>
            <div className="text-sm text-muted-foreground">{index + 1}/{steps.length}</div>
          </div>
          <DialogTitle className="mt-2 flex items-center justify-between">
            <span className="break-words">{step.title}</span>
            {completed.includes(index) && (
              <span className="text-xs text-green-600 font-semibold">Concluído</span>
            )}
          </DialogTitle>
          <DialogDescription className="whitespace-normal break-words">{step.desc}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${i <= index ? 'bg-primary' : 'bg-neutral-200'}`}
                style={{ minWidth: 0 }}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
            <div className="flex flex-wrap gap-2 items-center">
              <Button variant="ghost" onClick={prev} disabled={index === 0}>
                Anterior
              </Button>
              {!completed.includes(index) && (
                <Button variant="secondary" onClick={markDone}>Marcar passo como feito</Button>
              )}
              {index < steps.length - 1 ? (
                <Button onClick={next}>Próximo</Button>
              ) : (
                <Button onClick={finish}>Concluir</Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={resetProgress}>Resetar progresso</Button>
              <div className="text-sm text-muted-foreground">{index + 1}/{steps.length}</div>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

