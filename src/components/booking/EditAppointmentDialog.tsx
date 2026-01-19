'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  service_id: string;
  services: {
    name: string;
    duration_minutes: number;
    price: number;
  };
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface ExistingAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_id: string;
  services?: {
    duration_minutes: number;
  };
}

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  professionalId: string;
  availability: AvailabilitySlot[];
  existingAppointments: ExistingAppointment[];
  services: Service[];
  blockedDates?: string[];
  onSuccess: () => void;
}

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  professionalId,
  availability,
  existingAppointments,
  services,
  blockedDates = [],
  onSuccess,
}: EditAppointmentDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (appointment) {
      // Parse date correctly to avoid timezone issues
      const [year, month, day] = appointment.appointment_date.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
      setSelectedTime(appointment.appointment_time.slice(0, 5));
      setSelectedServiceId(appointment.service_id);
      setClientName(appointment.client_name);
      setClientPhone(appointment.client_phone);
      setClientEmail(appointment.client_email || '');
      setNotes(appointment.notes || '');
    }
  }, [appointment]);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const duration = selectedService?.duration_minutes || 60;

  // Check if a time slot conflicts with existing appointments
  const isTimeSlotBlocked = (dateStr: string, timeStr: string, serviceDuration: number) => {
    const slotStart = parseInt(timeStr.split(':')[0]) * 60 + parseInt(timeStr.split(':')[1]);
    const slotEnd = slotStart + serviceDuration;

    return existingAppointments.some(a => {
      // Skip cancelled appointments and the current appointment being edited
      if (a.status === 'cancelled' || a.id === appointment?.id) return false;
      if (a.appointment_date !== dateStr) return false;

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
    
    // Check blocked dates
    const dateStr = format(date, 'yyyy-MM-dd');
    if (blockedDates.includes(dateStr)) return false;
    
    const dayOfWeek = date.getDay();
    return availability.some(a => a.day_of_week === dayOfWeek);
  };

  const handleSave = async () => {
    if (!appointment || !selectedDate || !selectedTime || !selectedServiceId) return;

    setSaving(true);

    const { error } = await supabase
      .from('appointments')
      .update({
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        service_id: selectedServiceId,
        client_name: clientName,
        client_phone: clientPhone.replace(/\D/g, ''),
        client_email: clientEmail || null,
        notes: notes || null,
        payment_amount: selectedService?.price || 0,
      })
      .eq('id', appointment.id);

    if (error) {
      toast.error('Erro ao atualizar agendamento');
      setSaving(false);
      return;
    }

    toast.success('Agendamento atualizado!');
    setSaving(false);
    onSuccess();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!appointment) return;

    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    setDeleting(true);

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointment.id);

    if (error) {
      toast.error('Erro ao excluir agendamento');
      setDeleting(false);
      return;
    }

    toast.success('Agendamento excluído!');
    setDeleting(false);
    onSuccess();
    onOpenChange(false);
  };

  const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>
            Altere os dados do agendamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Telefone</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Serviço</Label>
              <Select value={selectedServiceId} onValueChange={(value) => {
                setSelectedServiceId(value);
                setSelectedTime(null); // Reset time when service changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes}min - R${service.price.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Data</Label>
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
            <div>
              <Label className="mb-2 block">
                {selectedDate 
                  ? `Horários para ${format(selectedDate, "dd/MM")}`
                  : 'Selecione uma data'
                }
              </Label>
              {selectedDate ? (
                availableTimes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum horário disponível para este serviço
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Selecione uma data primeiro
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações opcionais"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="sm:mr-auto"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Excluir
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!selectedDate || !selectedTime || !selectedServiceId || saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

