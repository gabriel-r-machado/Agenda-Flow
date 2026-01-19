'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface IntervalSettingsProps {
  professionalId: string;
  currentInterval?: number;
  onUpdate: () => void;
}

const INTERVAL_OPTIONS = [
  { value: 15, label: '15 minutos', description: 'Máxima flexibilidade' },
  { value: 30, label: '30 minutos', description: 'Padrão recomendado' },
  { value: 60, label: '60 minutos', description: 'Sessões completas' },
];

export function IntervalSettings({ professionalId, currentInterval = 30, onUpdate }: IntervalSettingsProps) {
  const [interval, setInterval] = useState(String(currentInterval));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    // Update all availability slots with new interval
    const { error } = await supabase
      .from('availability')
      .update({ interval_minutes: parseInt(interval) })
      .eq('professional_id', professionalId);

    if (error) {
      toast.error('Erro ao salvar intervalo');
    } else {
      toast.success('Intervalo atualizado!');
      onUpdate();
    }
    setSaving(false);
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Intervalo entre Horários
        </CardTitle>
        <CardDescription>
          Define o intervalo de tempo entre os slots de agendamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={interval} onValueChange={setInterval}>
          {INTERVAL_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                interval === String(option.value)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={String(option.value)} id={`interval-${option.value}`} />
              <Label
                htmlFor={`interval-${option.value}`}
                className="flex-1 cursor-pointer"
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  — {option.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Salvar Intervalo
        </Button>
      </CardContent>
    </Card>
  );
}

