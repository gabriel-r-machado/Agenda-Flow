'use client';

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { format, addHours, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
  rescheduleHoursLimit: number;
  availability: { day_of_week: number; start_time: string; end_time: string }[];
  existingAppointments: { 
    id?: string;
    appointment_date: string; 
    appointment_time: string; 
    status: string;
    service_id?: string;
    services?: { duration_minutes: number };
  }[];
  blockedDates?: string[];
  onSuccess: () => void;
}

interface FoundAppointment {
  id: string;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_id: string;
  services: {
    name: string;
    duration_minutes: number;
    price: number;
  };
}

export function RescheduleDialog({
  open,
  onOpenChange,
  professionalId,
  rescheduleHoursLimit,
  availability,
  existingAppointments,
  blockedDates = [],
  onSuccess,
}: RescheduleDialogProps) {
  const [step, setStep] = useState<'search' | 'found' | 'reschedule' | 'success'>('search');
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundAppointment, setFoundAppointment] = useState<FoundAppointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!phone.trim()) {
      toast.error('Digite seu telefone');
      return;
    }

    setSearching(true);
    setError(null);

    // Search for appointments by phone
    const { data, error: searchError } = await supabase
      .from('appointments')
      .select('*, services(name, duration_minutes, price)')
      .eq('professional_id', professionalId)
      .eq('client_phone', phone.replace(/\D/g, ''))
      .in('status', ['pending', 'confirmed'])
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .order('appointment_date', { ascending: true })
      .limit(1);

    if (searchError) {
      setError('Erro ao buscar agendamento');
      setSearching(false);
      return;
    }

    if (!data || data.length === 0) {
      // Try with formatted phone
      const { data: data2 } = await supabase
        .from('appointments')
        .select('*, services(name, duration_minutes, price)')
        .eq('professional_id', professionalId)
        .ilike('client_phone', `%${phone.replace(/\D/g, '').slice(-8)}%`)
        .in('status', ['pending', 'confirmed'])
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .limit(1);

      if (!data2 || data2.length === 0) {
        setError('Nenhum agendamento encontrado com este telefone');
        setSearching(false);
        return;
      }

      setFoundAppointment(data2[0] as unknown as FoundAppointment);
    } else {
      setFoundAppointment(data[0] as unknown as FoundAppointment);
    }

    setStep('found');
    setSearching(false);
  };

  const canReschedule = () => {
    if (!foundAppointment) return false;
    
    // Parse date correctly to avoid timezone issues
    const [year, month, day] = foundAppointment.appointment_date.split('-').map(Number);
    const [hours, minutes] = foundAppointment.appointment_time.split(':').map(Number);
    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
    const minRescheduleTime = addHours(new Date(), rescheduleHoursLimit);
    
    return isBefore(minRescheduleTime, appointmentDateTime);
  };

  // Check if a time slot conflicts with existing appointments (considering service duration)
  const isTimeSlotBlocked = (dateStr: string, timeStr: string, serviceDuration: number) => {
    const slotStart = parseInt(timeStr.split(':')[0]) * 60 + parseInt(timeStr.split(':')[1]);
    const slotEnd = slotStart + serviceDuration;

    return existingAppointments.some(a => {
      // Skip cancelled appointments
      if (a.status === 'cancelled') return false;
      if (a.appointment_date !== dateStr) return false;
      
      // Exclude the original appointment from blocking by ID
      if (foundAppointment && a.id === foundAppointment.id) {
        return false;
      }

      const existingStart = parseInt(a.appointment_time.split(':')[0]) * 60 + parseInt(a.appointment_time.split(':')[1]);
      const existingDuration = a.services?.duration_minutes || 60;
      const existingEnd = existingStart + existingDuration;

      // Check for overlap: slot overlaps if it starts before existing ends AND ends after existing starts
      return slotStart < existingEnd && slotEnd > existingStart;
    });
  };

  const getAvailableTimesForDate = (date: Date): string[] => {
    const dayOfWeek = date.getDay();
    const daySlots = availability.filter(a => a.day_of_week === dayOfWeek);
    
    if (daySlots.length === 0) return [];

    const times: string[] = [];
    const dateStr = format(date, 'yyyy-MM-dd');
    const duration = foundAppointment?.services?.duration_minutes || 60;

    daySlots.forEach(slot => {
      let [startHour, startMin] = slot.start_time.split(':').map(Number);
      const [endHour, endMin] = slot.end_time.split(':').map(Number);
      const endMinutes = endHour * 60 + endMin;

      while (startHour * 60 + startMin + duration <= endMinutes) {
        const timeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
        
        if (!isTimeSlotBlocked(dateStr, timeStr, duration)) {
          times.push(timeStr);
        }

        startMin += 30;
        if (startMin >= 60) {
          startHour += 1;
          startMin = 0;
        }
      }
    });

    return times;
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return false;
    
    // Check blocked dates
    const dateStr = format(date, 'yyyy-MM-dd');
    if (blockedDates.includes(dateStr)) return false;
    
    const dayOfWeek = date.getDay();
    return availability.some(a => a.day_of_week === dayOfWeek);
  };

  const handleReschedule = async () => {
    if (!foundAppointment || !selectedDate || !selectedTime) return;

    setSaving(true);

    try {
      // Build timestamp without timezone conversion
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const timeStr = selectedTime;
      const localTimestamp = `${dateStr}T${timeStr}:00`;

      const { data: rpcData, error: rpcError } = await supabase.rpc('remarcar_agendamento', {
        p_agendamento_id: foundAppointment.id,
        p_novo_horario: localTimestamp,
        p_telefone_cliente: phone.replace(/\D/g, ''),
      });

      if (rpcError) {
        toast.error(rpcError.message || 'Erro ao remarcar agendamento');
        setSaving(false);
        return;
      }

      toast.success('Agendamento remarcado com sucesso!');
      setStep('success');
      setSaving(false);
      
      // Call onSuccess to refresh appointment list
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remarcar agendamento');
      setSaving(false);
    }
  };

  const reset = () => {
    setStep('search');
    setPhone('');
    setFoundAppointment(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setError(null);
  };

  const handleClose = () => {
    // If success step, refresh data before closing
    if (step === 'success') {
      onSuccess();
    }
    reset();
    onOpenChange(false);
  };

  const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'search' && 'Remarcar Agendamento'}
            {step === 'found' && 'Agendamento Encontrado'}
            {step === 'reschedule' && 'Escolha Nova Data'}
            {step === 'success' && 'Remarcado com Sucesso!'}
          </DialogTitle>
          <DialogDescription>
            {step === 'search' && 'Digite seu telefone para encontrar seu agendamento'}
            {step === 'found' && 'Confirme os dados do seu agendamento'}
            {step === 'reschedule' && 'Selecione uma nova data e horário'}
            {step === 'success' && 'Seu agendamento foi remarcado'}
          </DialogDescription>
        </DialogHeader>

        {step === 'search' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Buscar
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'found' && foundAppointment && (
          <div className="space-y-4 py-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{foundAppointment.services?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const [y, m, d] = foundAppointment.appointment_date.split('-').map(Number);
                        return format(new Date(y, m - 1, d), "EEEE, dd 'de' MMMM", { locale: ptBR });
                      })()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      às {foundAppointment.appointment_time.slice(0, 5)}
                    </p>
                    <Badge className="mt-2" variant="secondary">
                      {foundAppointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!canReschedule() && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">Não é possível remarcar</p>
                    <p className="text-muted-foreground">
                      Remarcações devem ser feitas com pelo menos {rescheduleHoursLimit} hora{rescheduleHoursLimit > 1 ? 's' : ''} de antecedência.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={reset}>
                Voltar
              </Button>
              <Button 
                onClick={() => setStep('reschedule')} 
                disabled={!canReschedule()}
              >
                Remarcar
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'reschedule' && foundAppointment && (
          <div className="space-y-4 py-4">
            {/* Mobile: stacked layout, Desktop: side by side */}
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Nova Data</Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                    disabled={(date) => !isDateAvailable(date)}
                    locale={ptBR}
                    className="rounded-md border pointer-events-auto"
                  />
                </div>
              </div>
              
              {selectedDate && (
                <div>
                  <Label className="mb-2 block">
                    Horários para {format(selectedDate, "dd/MM")}
                  </Label>
                  {availableTimes.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className="w-full"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum horário disponível
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStep('found')} className="w-full sm:w-auto">
                Voltar
              </Button>
              <Button 
                onClick={handleReschedule} 
                disabled={!selectedDate || !selectedTime || saving}
                className="w-full sm:w-auto"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Remarcação'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Agendamento Remarcado!</h3>
            <p className="text-muted-foreground mb-4">
              Sua nova data é {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
            </p>
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

