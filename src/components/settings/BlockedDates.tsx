'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CalendarOff, Plus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BlockedDatesProps {
  blockedDates: string[];
  onUpdate: (dates: string[]) => Promise<void>;
}

export function BlockedDates({ blockedDates, onUpdate }: BlockedDatesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>(
    blockedDates.map(d => new Date(d))
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dateStrings = selectedDates.map(d => format(d, 'yyyy-MM-dd'));
      await onUpdate(dateStrings);
      toast.success('Dias inativos atualizados!');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDate = async (dateToRemove: string) => {
    const newDates = blockedDates.filter(d => d !== dateToRemove);
    await onUpdate(newDates);
    setSelectedDates(newDates.map(d => new Date(d)));
    toast.success('Data removida');
  };

  const upcomingBlockedDates = blockedDates
    .filter(d => new Date(d) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarOff className="w-5 h-5" />
              Dias de Folga e Feriados
            </CardTitle>
            <CardDescription>
              Marque os dias em que a clínica estará fechada para bloquear agendamentos
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Configurar Dias Inativos</DialogTitle>
                <DialogDescription>
                  Selecione os dias em que você não irá trabalhar
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  disabled={(date) => date < new Date(new Date().toDateString())}
                  locale={ptBR}
                  className="rounded-md border mx-auto"
                />
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedDates.length} dia{selectedDates.length !== 1 ? 's' : ''} selecionado{selectedDates.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingBlockedDates.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {upcomingBlockedDates.map((date) => (
              <Badge key={date} variant="secondary" className="flex items-center gap-2 py-1.5 px-3">
                {format(new Date(date), "dd 'de' MMMM", { locale: ptBR })}
                <button
                  onClick={() => handleRemoveDate(date)}
                  className="hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum dia bloqueado configurado
          </p>
        )}
      </CardContent>
    </Card>
  );
}

