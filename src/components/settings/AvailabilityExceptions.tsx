'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { AlertTriangle, Plus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Exception {
  id: string;
  exception_date: string;
  start_time: string | null;
  end_time: string | null;
  is_blocked: boolean;
  reason: string | null;
}

interface AvailabilityExceptionsProps {
  professionalId: string;
}

export function AvailabilityExceptions({ professionalId }: AvailabilityExceptionsProps) {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    fetchExceptions();
  }, [professionalId]);

  const fetchExceptions = async () => {
    const { data, error } = await supabase
      .from('availability_exceptions')
      .select('*')
      .eq('professional_id', professionalId)
      .order('exception_date', { ascending: true });

    if (!error && data) {
      setExceptions(data);
      // Convert dates to Date objects
      const dates = data
        .filter(e => e.is_blocked)
        .map(e => new Date(e.exception_date + 'T00:00:00'));
      setSelectedDates(dates);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete all previous blocked exceptions
      await supabase
        .from('availability_exceptions')
        .delete()
        .eq('professional_id', professionalId)
        .eq('is_blocked', true);

      // Insert new blocked dates
      if (selectedDates.length > 0) {
        const datesToInsert = selectedDates.map(date => ({
          professional_id: professionalId,
          exception_date: format(date, 'yyyy-MM-dd'),
          start_time: null,
          end_time: null,
          is_blocked: true,
          reason: null,
        }));

        const { error } = await supabase
          .from('availability_exceptions')
          .insert(datesToInsert);

        if (error) throw error;
      }

      await fetchExceptions();
      toast.success('Exceções atualizadas!');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar exceções');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDate = async (dateToRemove: string) => {
    const { error } = await supabase
      .from('availability_exceptions')
      .delete()
      .eq('professional_id', professionalId)
      .eq('exception_date', dateToRemove);

    if (!error) {
      await fetchExceptions();
      toast.success('Data removida');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const upcomingExceptions = exceptions
    .filter(e => e.is_blocked && new Date(e.exception_date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.exception_date).getTime() - new Date(b.exception_date).getTime());

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Dias Fechados / Exceções
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
                <DialogTitle>Configurar Dias Fechados</DialogTitle>
                <DialogDescription>
                  Selecione os dias em que a clínica estará fechada
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
                  <p className="text-sm text-muted-foreground">
                    {selectedDates.length} dia{selectedDates.length !== 1 ? 's' : ''} selecionado{selectedDates.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : ''}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingExceptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {upcomingExceptions.map((exception) => (
              <Badge key={exception.id} variant="secondary" className="flex items-center gap-2 py-1.5 px-3 bg-destructive/10 text-destructive border-destructive/20">
                {format(new Date(exception.exception_date + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                <button
                  onClick={() => handleRemoveDate(exception.exception_date)}
                  className="hover:text-destructive transition-colors ml-1"
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

