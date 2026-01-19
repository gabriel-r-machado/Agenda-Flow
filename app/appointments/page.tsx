'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { EditAppointmentDialog } from '@/components/booking/EditAppointmentDialog';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  MessageCircle,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
    color?: string;
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

export default function Appointments() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      fetchAppointments();
    }
  }, [profile]);

  const fetchAppointments = async () => {
    if (!profile) return;

    const [appointmentsRes, servicesRes, availabilityRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, services(name, duration_minutes, price)')
        .eq('professional_id', profile.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true }),
      supabase
        .from('services')
        .select('id, name, duration_minutes, price')
        .eq('professional_id', profile.id)
        .eq('is_active', true),
      supabase
        .from('availability')
        .select('day_of_week, start_time, end_time')
        .eq('professional_id', profile.id)
        .eq('is_active', true)
    ]);

    if (appointmentsRes.data) {
      setAppointments(appointmentsRes.data as unknown as Appointment[]);
    }
    if (servicesRes.data) {
      setServices(servicesRes.data);
    }
    if (availabilityRes.data) {
      setAvailability(availabilityRes.data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (!error) {
      fetchAppointments();
      const statusMessages: Record<string, string> = {
        confirmed: 'confirmado',
        cancelled: 'cancelado',
        completed: 'concluído',
        no_show: 'marcado como não compareceu',
        awaiting_payment: 'marcado como aguardando pagamento',
      };
      toast.success(`Agendamento ${statusMessages[status] || 'atualizado'}!`);
    }
    setUpdating(null);
  };

  const deleteAppointment = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchAppointments();
      toast.success('Agendamento excluído!');
    } else {
      toast.error('Erro ao excluir agendamento');
    }
    setDeleting(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 font-medium">Confirmado</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200/60 font-medium">Cancelado</Badge>;
      case 'completed':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200/60 font-medium">Concluído</Badge>;
      case 'no_show':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200/60 font-medium">Não compareceu</Badge>;
      case 'awaiting_payment':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200/60 font-medium">Aguard. Pagamento</Badge>;
      default:
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200/60 font-medium">Pendente</Badge>;
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  const weekStart = new Date(new Date().setDate(new Date().getDate() - new Date().getDay()));
  const weekEnd = new Date(new Date().setDate(weekStart.getDate() + 6));
  const thisWeekStart = weekStart.toISOString().split('T')[0];
  const thisWeekEnd = weekEnd.toISOString().split('T')[0];

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'tomorrow' | 'week'>('all');

  const filterByDate = (appts: Appointment[]) => {
    switch (dateFilter) {
      case 'today':
        return appts.filter(a => a.appointment_date === today);
      case 'yesterday':
        return appts.filter(a => a.appointment_date === yesterday);
      case 'tomorrow':
        return appts.filter(a => a.appointment_date === tomorrow);
      case 'week':
        return appts.filter(a => a.appointment_date >= thisWeekStart && a.appointment_date <= thisWeekEnd);
      default:
        return appts;
    }
  };

  const pendingAppointments = filterByDate(appointments.filter(a => a.status === 'pending' && a.appointment_date >= today));
  const confirmedAppointments = filterByDate(appointments.filter(a => a.status === 'confirmed' && a.appointment_date >= today));
  const pastAppointments = filterByDate(appointments.filter(a => a.appointment_date < today || a.status === 'completed' || a.status === 'cancelled'));

  const formatWhatsAppLink = (phone: string, clientName: string, date: string, time: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const [year, month, day] = date.split('-').map(Number);
    const formattedDate = format(new Date(year, month - 1, day), "dd 'de' MMMM", { locale: ptBR });
    const message = encodeURIComponent(
      `Olá ${clientName}! Confirmando seu agendamento para ${formattedDate} às ${time.slice(0, 5)}. Até lá! 😊`
    );
    return `https://wa.me/55${cleanPhone}?text=${message}`;
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="border border-slate-200/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:scale-[1.005]">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          {/* Left side: Time & Date Badge */}
          <div className="flex items-start gap-5 flex-1">
            <div className="flex flex-col items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/60 shrink-0">
              <span className="text-2xl font-semibold text-indigo-900">
                {appointment.appointment_time.slice(0, 2)}
              </span>
              <span className="text-xs font-medium text-indigo-600">:</span>
              <span className="text-2xl font-semibold text-indigo-900">
                {appointment.appointment_time.slice(3, 5)}
              </span>
              <span className="text-xs font-medium text-slate-600 mt-1">
                {(() => {
                  const [y, m, d] = appointment.appointment_date.split('-').map(Number);
                  return format(new Date(y, m - 1, d), "dd/MMM", { locale: ptBR });
                })()}
              </span>
            </div>
            
            {/* Client Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{appointment.client_name}</h3>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-medium text-slate-700">{appointment.services?.name}</span>
                <span className="text-slate-400">•</span>
                <span className="text-sm text-slate-500">{appointment.services?.duration_minutes}min</span>
                <span className="text-slate-400">•</span>
                <span className="text-sm text-slate-500">{appointment.client_phone}</span>
              </div>
              {appointment.notes && (
                <p className="text-sm text-slate-500 mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200/60 italic">
                  "{appointment.notes}"
                </p>
              )}
            </div>
          </div>
          
          {/* Right side: Status, Price & Actions */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {getStatusBadge(appointment.status)}
            <p className="text-xl font-semibold text-indigo-600">
              R$ {appointment.services?.price?.toFixed(2)}
            </p>
            <div className="flex gap-2">
              {/* Main Action Button */}
              {appointment.status === 'pending' && (
                <Button
                  size="sm"
                  className="h-9 px-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-[0_4px_20px_rgb(16,185,129,0.2)]"
                  onClick={() => updateStatus(appointment.id, 'confirmed')}
                  disabled={updating === appointment.id}
                >
                  {updating === appointment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Confirmar
                    </>
                  )}
                </Button>
              )}
              {appointment.status === 'confirmed' && (
                <>
                  <a
                    href={formatWhatsAppLink(appointment.client_phone, appointment.client_name, appointment.appointment_date, appointment.appointment_time)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-9 px-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4 mr-1.5" />
                      WhatsApp
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    className="h-9 px-5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105"
                    onClick={() => updateStatus(appointment.id, 'completed')}
                    disabled={updating === appointment.id}
                  >
                    {updating === appointment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Concluir'}
                  </Button>
                </>
              )}
              {appointment.status === 'awaiting_payment' && (
                <Button
                  size="sm"
                  className="h-9 px-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105"
                  onClick={() => updateStatus(appointment.id, 'completed')}
                  disabled={updating === appointment.id}
                >
                  {updating === appointment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : '✓ Pago'}
                </Button>
              )}
              
              {/* Dropdown Menu for Secondary Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 hover:bg-slate-100 transition-all duration-300"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setEditingAppointment(appointment)}>
                    <Edit className="w-4 h-4 mr-2 text-slate-600" />
                    Editar
                  </DropdownMenuItem>
                  {appointment.status === 'pending' && (
                    <DropdownMenuItem 
                      onClick={() => updateStatus(appointment.id, 'cancelled')}
                      disabled={updating === appointment.id}
                    >
                      <XCircle className="w-4 h-4 mr-2 text-slate-600" />
                      Cancelar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        onSelect={(e) => e.preventDefault()}
                        className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O agendamento de {appointment.client_name} será excluído permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteAppointment(appointment.id)} 
                          className="bg-rose-600 hover:bg-rose-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Get existing appointments for the edit dialog (excluding cancelled)
  const existingAppointmentsForDialog = appointments
    .filter(a => a.status !== 'cancelled')
    .map(a => ({
      id: a.id,
      appointment_date: a.appointment_date,
      appointment_time: a.appointment_time,
      status: a.status,
      service_id: a.service_id,
      services: a.services ? { duration_minutes: a.services.duration_minutes } : undefined
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push('/dashboard')}
              className="hover:bg-slate-100 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Agendamentos</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Filtros rápidos de data */}
            <div className="mb-6 flex flex-wrap gap-2">
              <Button
                variant={dateFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('all')}
                className="font-medium"
              >
                Todos
              </Button>
              <Button
                variant={dateFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('today')}
                className="font-medium"
              >
                <Calendar className="w-4 h-4 mr-1.5" />
                Hoje
              </Button>
              <Button
                variant={dateFilter === 'tomorrow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('tomorrow')}
                className="font-medium"
              >
                Amanhã
              </Button>
              <Button
                variant={dateFilter === 'yesterday' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('yesterday')}
                className="font-medium"
              >
                Ontem
              </Button>
              <Button
                variant={dateFilter === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('week')}
                className="font-medium"
              >
                Esta semana
              </Button>
            </div>

            <Tabs defaultValue="pending">
            <TabsList className="mb-8 h-12 p-1 bg-slate-100 border border-slate-200/60">
              <TabsTrigger 
                value="pending"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300 font-medium"
              >
                Pendentes ({pendingAppointments.length})
              </TabsTrigger>
              <TabsTrigger 
                value="confirmed"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300 font-medium"
              >
                Confirmados ({confirmedAppointments.length})
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300 font-medium"
              >
                Histórico ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingAppointments.length > 0 ? (
                pendingAppointments.map((a, index) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AppointmentCard appointment={a} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border border-slate-200/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                    <CardContent className="py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 mx-auto mb-5 flex items-center justify-center shadow-inner">
                        <Calendar className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-semibold text-slate-900">Nenhum agendamento pendente</p>
                      <p className="text-sm text-slate-500 mt-2">Novos agendamentos aparecerão aqui</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              {confirmedAppointments.length > 0 ? (
                confirmedAppointments.map((a, index) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AppointmentCard appointment={a} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border border-slate-200/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                    <CardContent className="py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 mx-auto mb-5 flex items-center justify-center shadow-inner">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                      </div>
                      <p className="text-lg font-semibold text-slate-900">Nenhum agendamento confirmado</p>
                      <p className="text-sm text-slate-500 mt-2">Confirme agendamentos pendentes</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {pastAppointments.length > 0 ? (
                pastAppointments.map((a, index) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AppointmentCard appointment={a} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border border-slate-200/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                    <CardContent className="py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 mx-auto mb-5 flex items-center justify-center shadow-inner">
                        <Clock className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-semibold text-slate-900">Nenhum histórico ainda</p>
                      <p className="text-sm text-slate-500 mt-2">Agendamentos concluídos aparecerão aqui</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
          </>
        )}

        {/* Edit Appointment Dialog */}
        <EditAppointmentDialog
          open={!!editingAppointment}
          onOpenChange={(open) => !open && setEditingAppointment(null)}
          appointment={editingAppointment}
          professionalId={profile?.id || ''}
          availability={availability}
          existingAppointments={existingAppointmentsForDialog}
          services={services}
          blockedDates={profile?.blocked_dates || []}
          onSuccess={fetchAppointments}
        />
      </main>
    </div>
  );
}



