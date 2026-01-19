'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Clock, Loader2, AlertCircle, Lightbulb } from 'lucide-react';

interface RescheduleSettingsProps {
  currentHours: number;
  onUpdate: (hours: number) => Promise<void>;
}

export function RescheduleSettings({ currentHours, onUpdate }: RescheduleSettingsProps) {
  const [hours, setHours] = useState(currentHours);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (hours < 0) {
      toast.error('O prazo deve ser maior ou igual a 0');
      return;
    }

    setSaving(true);
    try {
      await onUpdate(hours);
      toast.success('Configuração salva!');
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-warning">
          <AlertCircle className="w-5 h-5" />
          Configurações de Cancelamento e Reagendamento
        </CardTitle>
        <CardDescription className="text-warning/80">
          Configure quanto tempo antes do agendamento os clientes podem cancelar ou remarcar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="hours" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Prazo mínimo (em horas)
          </Label>
          <div className="flex gap-3">
            <Input
              id="hours"
              type="number"
              min={0}
              max={168}
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value) || 0)}
              className="max-w-[120px]"
            />
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Clientes precisarão cancelar ou remarcar com pelo menos {hours} hora{hours !== 1 ? 's' : ''} de antecedência
          </p>
        </div>

        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 mt-0.5 text-warning" />
            <div className="text-sm">
              <p className="font-medium text-warning mb-2">Exemplos práticos:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>2 horas:</strong> Para consultas rápidas</li>
                <li>• <strong>4 horas:</strong> Padrão para consultas médicas</li>
                <li>• <strong>24 horas:</strong> Para procedimentos complexos</li>
                <li>• <strong>48 horas:</strong> Para hospedagem/acomodações</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

