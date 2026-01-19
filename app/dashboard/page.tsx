'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { useReminders } from '@/hooks/useReminders';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Calendar, 
  Clock, 
  Users, 
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Bell,
  Trash2,
  Edit2,
  MessageCircle,
  AlertTriangle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Loader2
} from 'lucide-react';
import { EditAppointmentDialog } from '@/components/booking/EditAppointmentDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  notes: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
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
  price: number;
  duration_minutes: number;
  is_active: boolean;
  color?: string;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
  reminder_interval_hours: number | null;
}

export default function Dashboard() {
  const { profile, getTrialDaysLeft, isSubscriptionActive, isAccountActive } = useProfile();
  const { notifications, addReminder, completeReminder, removeNotification } = useReminders();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const router = useRouter();

  // Check if account is active
  useEffect(() => {
    if (profile && !isAccountActive()) {
      toast.error('Sua conta está inativa. Escolha um plano para continuar.');
      router.push('/upgrade-plan');
    }
  }, [profile, isAccountActive, router]);

  // Reminder dialog state
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    priority: '2',
    due_date: '',
    reminder_interval_hours: ''
  });
  const [savingReminder, setSavingReminder] = useState(false);
  const [isViewingReminder, setIsViewingReminder] = useState(false);
  const [agendaDayFilter, setAgendaDayFilter] = useState<'all' | 'pending' | 'confirmed' | 'history'>('all');
  const [allAppointmentsFilter, setAllAppointmentsFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [dateFilterFrom, setDateFilterFrom] = useState<string>('');
  const [dateFilterTo, setDateFilterTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    const { data: todayData } = await supabase
      .from('appointments')
      .select('*, services(name, duration_minutes, price)')
      .eq('professional_id', profile.id)
      .eq('appointment_date', today)
      .order('appointment_time', { ascending: true });

    if (todayData) {
      setTodayAppointments(todayData as unknown as Appointment[]);
    }

    // RLS policies ensure professional only sees their own appointments
    // Includes all statuses to show complete history for analytics
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select('*, services(name, duration_minutes, price)')
      .eq('professional_id', profile.id)
      .gte('appointment_date', today)
      .in('status', ['pending', 'confirmed', 'completed', 'cancelled'])
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (appointmentsData) {
      setAppointments(appointmentsData as unknown as Appointment[]);
    }

    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('professional_id', profile.id);

    if (servicesData) {
      setServices(servicesData as Service[]);
    }

    // Required for calculating real-time occupation percentage in analytics dashboard
    const { data: availabilityData } = await supabase
      .from('availability')
      .select('day_of_week, start_time, end_time')
      .eq('professional_id', profile.id)
      .eq('is_active', true);

    if (availabilityData) {
      setAvailability(availabilityData);
    }

    // Priority reminders appear first, then sorted by creation time (newest first)
    // Completed reminders are filtered out to keep the dashboard focused
    const { data: remindersData } = await supabase
      .from('reminders')
      .select('*')
      .eq('professional_id', profile.id)
      .eq('is_completed', false)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (remindersData) {
      setReminders(remindersData as Reminder[]);
    }

    setLoadingData(false);
  };

  // Calculate available slots for today
  const calculateTodaySlots = () => {
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();
    const daySlots = availability.filter(a => a.day_of_week === dayOfWeek);
    
    if (daySlots.length === 0) return 0;

    let totalSlots = 0;
    daySlots.forEach(slot => {
      let [startHour, startMin] = slot.start_time.split(':').map(Number);
      const [endHour, endMin] = slot.end_time.split(':').map(Number);
      const endMinutes = endHour * 60 + endMin;

      while (startHour * 60 + startMin + 30 <= endMinutes) {
        totalSlots++;
        startMin += 30;
        if (startMin >= 60) {
          startHour += 1;
          startMin = 0;
        }
      }
    });

    return totalSlots;
  };

  const totalSlotsToday = calculateTodaySlots();
  const bookedSlotsToday = todayAppointments.filter(a => a.status !== 'cancelled').length;
  const availableSlotsToday = Math.max(0, totalSlotsToday - bookedSlotsToday);
  const occupationRate = totalSlotsToday > 0 ? Math.round((bookedSlotsToday / totalSlotsToday) * 100) : 0;

  // Comparação com período anterior (últimos 7 dias vs 7 dias anteriores)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const last14Days = new Date();
  last14Days.setDate(last14Days.getDate() - 14);

  const appointmentsLast7Days = appointments.filter(a => {
    const appointmentDate = new Date(a.appointment_date);
    return appointmentDate >= last7Days && appointmentDate <= new Date();
  }).length;

  const appointmentsPrevious7Days = appointments.filter(a => {
    const appointmentDate = new Date(a.appointment_date);
    return appointmentDate >= last14Days && appointmentDate < last7Days;
  }).length;

  const appointmentsTrend = appointmentsPrevious7Days > 0
    ? Math.round(((appointmentsLast7Days - appointmentsPrevious7Days) / appointmentsPrevious7Days) * 100)
    : appointmentsLast7Days > 0 ? 100 : 0;

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-success" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-destructive" />;
    return <ArrowRight className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendText = (trend: number) => {
    if (trend > 0) return `+${trend}% vs semana anterior`;
    if (trend < 0) return `${trend}% vs semana anterior`;
    return 'Sem mudanças vs semana anterior';
  };

  const getMotivationalMessage = () => {
    const todayCancelled = todayAppointments.filter(a => a.status === 'cancelled').length;
    if (occupationRate >= 80) return '🔥 Agenda lotada hoje!';
    if (todayCancelled >= 3) return '⚠️ ' + todayCancelled + ' cancelamentos hoje';
    if (appointmentsTrend > 20) return '📈 Crescimento acelerado!';
    if (bookedSlotsToday === 0) return '💡 Dia tranquilo para organizar';
    return '✨ Continue assim!';
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Cancelado</Badge>;
      case 'completed':
        return <Badge className="bg-muted text-muted-foreground">Concluído</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (!error) {
      fetchData();
      toast.success(`Agendamento ${status === 'confirmed' ? 'confirmado' : status === 'cancelled' ? 'cancelado' : 'concluído'}!`);
    }
    setUpdating(null);
  };

  const formatWhatsAppLink = (phone: string, clientName: string, date: string, time: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const [year, month, day] = date.split('-').map(Number);
    const formattedDate = format(new Date(year, month - 1, day), "dd 'de' MMMM", { locale: ptBR });
    const message = encodeURIComponent(
      `Olá ${clientName}! Confirmando seu agendamento para ${formattedDate} às ${time.slice(0, 5)}. Até lá! 😊`
    );
    return `https://wa.me/55${cleanPhone}?text=${message}`;
  };

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 1:
        return <ArrowUp className="w-4 h-4 text-destructive" />;
      case 3:
        return <ArrowDown className="w-4 h-4 text-muted-foreground" />;
      default:
        return <ArrowRight className="w-4 h-4 text-warning" />;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Alta';
      case 3:
        return 'Baixa';
      default:
        return 'Média';
    }
  };

  const copyPublicUrl = () => {
    if (profile) {
      navigator.clipboard.writeText(`${window.location.origin}/p/${profile.id}`);
      toast.success('Link copiado!');
    }
  };

  // Reminder handlers
  const openNewReminderDialog = () => {
    setEditingReminder(null);
    setReminderForm({ title: '', description: '', priority: '2', due_date: '', reminder_interval_hours: '' });
    setIsViewingReminder(false);
    setReminderDialogOpen(true);
  };

  const openEditReminderDialog = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setReminderForm({
      title: reminder.title,
      description: reminder.description || '',
      priority: String(reminder.priority),
      due_date: reminder.due_date || '',
      reminder_interval_hours: reminder.reminder_interval_hours ? String(reminder.reminder_interval_hours) : ''
    });
    setIsViewingReminder(false);
    setReminderDialogOpen(true);
  };

  const openViewReminderDialog = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setReminderForm({
      title: reminder.title,
      description: reminder.description || '',
      priority: String(reminder.priority),
      due_date: reminder.due_date || '',
      reminder_interval_hours: reminder.reminder_interval_hours ? String(reminder.reminder_interval_hours) : ''
    });
    setIsViewingReminder(true);
    setReminderDialogOpen(true);
  };

  const handleSaveReminder = async () => {
    if (!profile || !reminderForm.title.trim()) {
      toast.error('Digite um título para o lembrete');
      return;
    }

    setSavingReminder(true);

    const reminderData = {
      professional_id: profile.id,
      title: reminderForm.title.trim(),
      description: reminderForm.description.trim() || null,
      priority: parseInt(reminderForm.priority),
      due_date: reminderForm.due_date || null,
      reminder_interval_hours: reminderForm.reminder_interval_hours ? parseInt(reminderForm.reminder_interval_hours) : null
    };

    if (editingReminder) {
      const { error } = await supabase
        .from('reminders')
        .update(reminderData)
        .eq('id', editingReminder.id);

      if (error) {
        toast.error('Erro ao atualizar lembrete');
      } else {
        toast.success('Lembrete atualizado!');
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('reminders')
        .insert(reminderData);

      if (error) {
        toast.error('Erro ao criar lembrete');
      } else {
        toast.success('Lembrete criado!');
        fetchData();
      }
    }

    setSavingReminder(false);
    setReminderDialogOpen(false);
  };

  const handleCompleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_completed: true })
      .eq('id', id);

    if (!error) {
      toast.success('Lembrete concluído!');
      fetchData();
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Lembrete excluído!');
      fetchData();
    }
  };

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

  const trialDaysLeft = getTrialDaysLeft();
  const publicUrl = profile ? `${window.location.origin}/p/${profile.id}` : '';

  // Filter today's appointments based on selected filter
  const getFilteredTodayAppointments = () => {
    switch (agendaDayFilter) {
      case 'pending':
        return todayAppointments.filter(a => a.status === 'pending');
      case 'confirmed':
        return todayAppointments.filter(a => a.status === 'confirmed');
      case 'history':
        return todayAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');
      default:
        return todayAppointments;
    }
  };

  const filteredTodayAppointments = getFilteredTodayAppointments();

  // Filter all appointments based on status and date
  const getFilteredAllAppointments = () => {
    let filtered = appointments;

    // Filter by status
    if (allAppointmentsFilter !== 'all') {
      filtered = filtered.filter(a => a.status === allAppointmentsFilter);
    }

    // Filter by date range
    if (dateFilterFrom) {
      filtered = filtered.filter(a => a.appointment_date >= dateFilterFrom);
    }
    if (dateFilterTo) {
      filtered = filtered.filter(a => a.appointment_date <= dateFilterTo);
    }

    // Filter by search query (client name or service name)
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(a => {
        const client = a.client_name?.toLowerCase() || '';
        const service = a.services?.name?.toLowerCase() || '';
        return client.includes(q) || service.includes(q);
      });
    }

    return filtered.sort((a, b) => {
      const dateCompare = b.appointment_date.localeCompare(a.appointment_date);
      if (dateCompare !== 0) return dateCompare;
      return b.appointment_time.localeCompare(a.appointment_time);
    });
  };

  const filteredAllAppointments = getFilteredAllAppointments();

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-4 sm:space-y-8 md:space-y-10">
        {/* Welcome & Public Link */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6 sm:gap-8"
        >
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Olá, {profile?.name?.split(' ')[0]}! 👋
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 group">
              <span className="text-xs sm:text-sm font-medium text-slate-500">Sua página pública:</span>
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200/60 transition-all duration-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:border-slate-300/60">
                <a 
                  href={publicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-2 transition-colors break-all"
                >
                  {publicUrl.replace('http://', '').replace('https://', '').substring(0, 35)}
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-slate-200/60 transition-all duration-300 hover:scale-105" 
                  onClick={copyPublicUrl}
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={() => router.push('/availability')} 
              className="flex-1 sm:flex-none h-11 px-6 border-slate-200/60 text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)]"
            >
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium">Configurar horários</span>
            </Button>
            <Button 
              className="flex-1 sm:flex-none h-11 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(99,102,241,0.25)] font-medium" 
              onClick={() => window.open(publicUrl, '_blank')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-medium">Novo agendamento</span>
            </Button>
          </div>
        </motion.div>

        {/* Lembretes - Sempre visível no topo */}
        {reminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="border border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-yellow-50/30 shadow-[0_8px_30px_rgb(251,191,36,0.15)] hover:shadow-[0_8px_30px_rgb(251,191,36,0.25)] transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-600" />
                    Lembretes
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 border-amber-200/60 hover:border-amber-300 hover:bg-amber-100/50 text-amber-700 font-semibold transition-all duration-300 hover:scale-105" 
                    onClick={openNewReminderDialog}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Novo
                  </Button>
                </div>
                <CardDescription className="text-sm font-medium text-amber-700/80 mt-1">{reminders.length} lembrete{reminders.length !== 1 ? 's' : ''} ativo{reminders.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3 max-h-[300px] overflow-auto">
                  {reminders.slice(0, 3).map((reminder, index) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-white border border-amber-200/60 hover:shadow-[0_4px_20px_rgb(251,191,36,0.15)] hover:scale-[1.01] transition-all duration-300 group cursor-pointer"
                      onClick={() => openViewReminderDialog(reminder)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getPriorityIcon(reminder.priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">{reminder.title}</p>
                          {reminder.description && (
                            <p className="text-xs text-slate-600 line-clamp-1 mt-1">{reminder.description}</p>
                          )}
                          {reminder.due_date && (
                            <p className="text-xs text-amber-700 mt-1.5 font-medium">
                              📅 {format(new Date(reminder.due_date + 'T12:00:00'), "dd/MM")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-emerald-50 hover:scale-110 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteReminder(reminder.id);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-indigo-50 hover:scale-110 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditReminderDialog(reminder);
                            }}
                          >
                            <Edit2 className="w-4 h-4 text-indigo-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-rose-50 hover:scale-110 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReminder(reminder.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {reminders.length > 3 && (
                  <p className="text-xs text-center text-amber-600 font-medium mt-3">
                    +{reminders.length - 3} lembrete{reminders.length - 3 !== 1 ? 's' : ''}. Role para baixo para ver todos.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1 sm:mb-2">Agendamentos</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-2 sm:mb-3">{bookedSlotsToday}</p>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {getTrendIcon(appointmentsTrend)}
                      <p className="text-[10px] sm:text-xs font-medium text-slate-600">{getTrendText(appointmentsTrend)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1 sm:mb-2">Disponíveis</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-2 sm:mb-3">{availableSlotsToday}</p>
                    <p className="text-[10px] sm:text-xs font-medium text-slate-600">de {totalSlotsToday} horários</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <Card className="border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1 sm:mb-2">Ocupação</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-2 sm:mb-3">{occupationRate}%</p>
                    <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-2 sm:mb-3">{getMotivationalMessage()}</p>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${occupationRate}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="h-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        {/* Removed 'Agenda do Dia' — replaced by improved 'Todos os Agendamentos' UX below */}

        {/* All Appointments Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50 border-b border-slate-200/60 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">Todos os Agendamentos</CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500 mt-2">
                    Total de {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* Filters */}
              <div className="space-y-6 mb-8 pb-8 border-b border-slate-200/60">
                {/* Status Filter Tabs */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setAllAppointmentsFilter('all')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm ${
                      allAppointmentsFilter === 'all'
                        ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-[0_4px_20px_rgb(0,0,0,0.15)] scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
                    }`}
                  >
                    Todos ({appointments.length})
                  </button>
                  <button
                    onClick={() => setAllAppointmentsFilter('pending')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm ${
                      allAppointmentsFilter === 'pending'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-[0_4px_20px_rgb(245,158,11,0.3)] scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
                    }`}
                  >
                    Pendentes ({appointments.filter(a => a.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setAllAppointmentsFilter('confirmed')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm ${
                      allAppointmentsFilter === 'confirmed'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_4px_20px_rgb(16,185,129,0.3)] scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
                    }`}
                  >
                    Confirmados ({appointments.filter(a => a.status === 'confirmed').length})
                  </button>
                  <button
                    onClick={() => setAllAppointmentsFilter('completed')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm ${
                      allAppointmentsFilter === 'completed'
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-[0_4px_20px_rgb(99,102,241,0.3)] scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
                    }`}
                  >
                    Concluídos ({appointments.filter(a => a.status === 'completed').length})
                  </button>
                  <button
                    onClick={() => setAllAppointmentsFilter('cancelled')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm ${
                      allAppointmentsFilter === 'cancelled'
                        ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_4px_20px_rgb(244,63,94,0.3)] scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
                    }`}
                  >
                    Cancelados ({appointments.filter(a => a.status === 'cancelled').length})
                  </button>
                </div>

              {/* Filtros rápidos de data */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200/60">
                <Button
                  variant={!dateFilterFrom && !dateFilterTo ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setDateFilterFrom('');
                    setDateFilterTo('');
                  }}
                  className="font-medium"
                >
                  Todos os períodos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setDateFilterFrom(today);
                    setDateFilterTo(today);
                  }}
                  className="font-medium"
                >
                  <Calendar className="w-4 h-4 mr-1.5" />
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
                    setDateFilterFrom(tomorrow);
                    setDateFilterTo(tomorrow);
                  }}
                  className="font-medium"
                >
                  Amanhã
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
                    setDateFilterFrom(yesterday);
                    setDateFilterTo(yesterday);
                  }}
                  className="font-medium"
                >
                  Ontem
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                    const weekEnd = new Date(today.setDate(weekStart.getDate() + 6));
                    setDateFilterFrom(weekStart.toISOString().split('T')[0]);
                    setDateFilterTo(weekEnd.toISOString().split('T')[0]);
                  }}
                  className="font-medium"
                >
                  Esta semana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    setDateFilterFrom(monthStart.toISOString().split('T')[0]);
                    setDateFilterTo(monthEnd.toISOString().split('T')[0]);
                  }}
                  className="font-medium"
                >
                  Este mês
                </Button>
              </div>

              {/* Search + Date Range Filter */}
              <div className="flex flex-col gap-5">
                <div className="flex gap-4 flex-col sm:flex-row items-end">
                  <div className="flex-1 w-full sm:w-auto">
                    <Label htmlFor="search" className="text-sm font-semibold text-slate-700 mb-2 block">Pesquisar</Label>
                    <Input
                      id="search"
                      placeholder="Cliente ou serviço"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 border-slate-200/60 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery('')}
                    className="h-11 px-5 border-slate-200/60 text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 font-medium transition-all duration-300 hover:scale-[1.02]"
                  >
                    Limpar busca
                  </Button>
                </div>

                <div className="flex gap-4 flex-col sm:flex-row">
                  <div className="flex-1">
                    <Label htmlFor="date-from" className="text-sm font-semibold text-slate-700 mb-2 block">Data De:</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateFilterFrom}
                      onChange={(e) => setDateFilterFrom(e.target.value)}
                      className="h-11 w-full border-slate-200/60 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="date-to" className="text-sm font-semibold text-slate-700 mb-2 block">Data Até:</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateFilterTo}
                      onChange={(e) => setDateFilterTo(e.target.value)}
                      className="h-11 w-full border-slate-200/60 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300"
                    />
                  </div>
                  {(dateFilterFrom || dateFilterTo) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDateFilterFrom('');
                        setDateFilterTo('');
                      }}
                      className="self-end h-11 px-5 border-slate-200/60 text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 font-medium transition-all duration-300 hover:scale-[1.02]"
                    >
                      Limpar filtros
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Appointments List */}
            {filteredAllAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAllAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:scale-[1.01] transition-all duration-300"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                        <span className="text-lg sm:text-xl font-semibold text-indigo-600">
                          {appointment.client_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base sm:text-lg text-slate-900 truncate">{appointment.client_name}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge
                            className="text-white text-xs font-medium px-2.5 py-0.5 rounded-lg"
                            style={{ backgroundColor: appointment.services?.color || '#6366F1' }}
                          >
                            {appointment.services?.name}
                          </Badge>
                          <span className="text-xs sm:text-sm text-slate-500 font-medium">• {appointment.services?.duration_minutes}min</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1.5 flex gap-3 sm:gap-5 flex-wrap font-medium">
                          <span>📅 {format(new Date(appointment.appointment_date + 'T00:00:00'), 'dd/MM', { locale: ptBR })}</span>
                          <span>🕐 {appointment.appointment_time.slice(0, 5)}</span>
                          <span className="hidden sm:inline">💰 R$ {appointment.services?.price?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 justify-between sm:justify-end">
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(appointment.status)}
                        <p className="text-base sm:text-xl font-semibold text-indigo-600">R$ {appointment.services?.price?.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAppointment(appointment)}
                            className="h-9 w-9 p-0 border-slate-200/60 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 hover:scale-105 group"
                          >
                            <Edit2 className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
                          </Button>
                          {appointment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(appointment.id, 'cancelled')}
                                disabled={updating === appointment.id}
                                className="h-9 w-9 p-0 border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 transition-all duration-300 hover:scale-105"
                              >
                                {updating === appointment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                className="h-9 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-[0_4px_20px_rgb(16,185,129,0.2)]"
                                onClick={() => updateStatus(appointment.id, 'confirmed')}
                                disabled={updating === appointment.id}
                              >
                                {updating === appointment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              </Button>
                            </>
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
                                  className="h-9 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-600 transition-all duration-300 hover:scale-105"
                                >
                                  <MessageCircle className="w-4 h-4 mr-1.5" />
                                  WhatsApp
                                </Button>
                              </a>
                              <Button
                                size="sm"
                                onClick={() => updateStatus(appointment.id, 'completed')}
                                disabled={updating === appointment.id}
                                className="h-9 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105"
                              >
                                {updating === appointment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Concluir'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 mx-auto mb-5 flex items-center justify-center shadow-inner"
                >
                  <Calendar className="w-10 h-10 text-slate-400" />
                </motion.div>
                <p className="text-lg font-semibold text-slate-900 mb-2">Nenhum agendamento encontrado</p>
                <p className="text-sm text-slate-500 font-medium">Ajuste os filtros para ver mais agendamentos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

        {/* Quick Actions / Reminders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 md:gap-8"
          >
            {/* Quick Actions Card */}
            <Card className="h-full border-0 bg-gradient-to-br from-white via-white to-slate-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-500 overflow-hidden relative">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-indigo-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <CardHeader className="pb-3 sm:pb-5 px-4 sm:px-6 pt-4 sm:pt-6 relative z-10">
                <CardTitle className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 flex flex-col justify-start relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
                <Button 
                  className="w-full justify-start h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold shadow-[0_4px_20px_rgb(99,102,241,0.35)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.5)] hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 group border-0" 
                  onClick={() => router.push('/services')}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 group-hover:bg-white/30 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-base">Gerenciar Serviços</span>
                </Button>
                <Button 
                  className="w-full justify-start h-14 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-[0_4px_20px_rgb(16,185,129,0.35)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.5)] hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 group border-0" 
                  onClick={() => router.push('/availability')}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 group-hover:bg-white/30 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-base">Definir Horários</span>
                </Button>
                <Button 
                  className="w-full justify-start h-14 px-6 rounded-2xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-semibold shadow-[0_4px_20px_rgb(139,92,246,0.35)] hover:shadow-[0_8px_30px_rgb(139,92,246,0.5)] hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 group border-0" 
                  onClick={() => router.push('/clients')}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 group-hover:bg-white/30 transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-base">Ver Clientes</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
              <CardHeader className="pb-5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Lembretes
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 hover:scale-105" 
                    onClick={openNewReminderDialog}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Novo
                  </Button>
                </div>
                <CardDescription className="text-sm font-medium text-slate-500 mt-2">{reminders.length} lembrete{reminders.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent className="p-5 flex flex-col justify-between">
                {reminders.length > 0 ? (
                  <div className="space-y-3 overflow-auto max-h-64">
                    {reminders.map((reminder, index) => (
                      <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:scale-[1.01] transition-all duration-300 group cursor-pointer"
                        onClick={() => openViewReminderDialog(reminder)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getPriorityIcon(reminder.priority)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-900 truncate">{reminder.title}</p>
                            {reminder.description && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-1">{reminder.description}</p>
                            )}
                            {reminder.due_date && (
                              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                                📅 {format(new Date(reminder.due_date + 'T12:00:00'), "dd/MM")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-emerald-50 hover:scale-110 transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteReminder(reminder.id);
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-indigo-50 hover:scale-110 transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditReminderDialog(reminder);
                              }}
                            >
                              <Edit2 className="w-4 h-4 text-indigo-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-rose-50 hover:scale-110 transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReminder(reminder.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 mx-auto mb-4 flex items-center justify-center shadow-inner">
                      <Bell className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Nenhum lembrete cadastrado</p>
                    <p className="text-xs text-slate-500 mt-1">Clique em "Novo" para criar seu primeiro lembrete</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

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
        onSuccess={fetchData}
      />

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isViewingReminder ? 'Visualizar Lembrete' : editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
            </DialogTitle>
            <DialogDescription>
              {isViewingReminder ? 'Detalhes do lembrete' : editingReminder ? 'Atualize as informações do lembrete' : 'Crie um novo lembrete para não esquecer'}
            </DialogDescription>
          </DialogHeader>

          {isViewingReminder && editingReminder ? (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-semibold break-words max-w-full whitespace-normal">{editingReminder.title}</h3>
                {editingReminder.due_date && (
                  <p className="text-sm text-muted-foreground">Prazo: {format(new Date(editingReminder.due_date + 'T12:00:00'), 'dd/MM/yyyy')}</p>
                )}
              </div>
              {editingReminder.description && (
                <div>
                  <p className="text-sm text-muted-foreground break-words break-all whitespace-pre-wrap max-w-full overflow-auto">{editingReminder.description}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(editingReminder.priority)}
                  <span className="text-sm">Prioridade: {getPriorityLabel(editingReminder.priority)}</span>
                </div>
                {editingReminder.reminder_interval_hours && (
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="text-sm">Lembrar a cada {editingReminder.reminder_interval_hours}h</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-title">Título *</Label>
                <Input
                  id="reminder-title"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                  placeholder="Ex: Ligar para cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-description">Descrição</Label>
                <Textarea
                  id="reminder-description"
                  value={reminderForm.description}
                  onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                  placeholder="Detalhes do lembrete..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={reminderForm.priority}
                    onValueChange={(value) => setReminderForm({ ...reminderForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        <div className="flex items-center gap-2">
                          <ArrowUp className="w-4 h-4 text-destructive" />
                          Alta
                        </div>
                      </SelectItem>
                      <SelectItem value="2">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-warning" />
                          Média
                        </div>
                      </SelectItem>
                      <SelectItem value="3">
                        <div className="flex items-center gap-2">
                          <ArrowDown className="w-4 h-4 text-muted-foreground" />
                          Baixa
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-due-date">Data limite</Label>
                  <Input
                    id="reminder-due-date"
                    type="date"
                    value={reminderForm.due_date}
                    onChange={(e) => setReminderForm({ ...reminderForm, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-interval">Lembrar a cada (horas)</Label>
                <Select
                  value={reminderForm.reminder_interval_hours || 'none'}
                  onValueChange={(value) => setReminderForm({ ...reminderForm, reminder_interval_hours: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Não repetir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não repetir</SelectItem>
                    <SelectItem value="1">A cada 1 hora</SelectItem>
                    <SelectItem value="2">A cada 2 horas</SelectItem>
                    <SelectItem value="4">A cada 4 horas</SelectItem>
                    <SelectItem value="8">A cada 8 horas</SelectItem>
                    <SelectItem value="12">A cada 12 horas</SelectItem>
                    <SelectItem value="24">A cada 24 horas</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Opcional: define de quanto em quanto tempo você será notificado sobre este lembrete.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
              Fechar
            </Button>
            {isViewingReminder && editingReminder ? (
              <Button onClick={() => setIsViewingReminder(false)}>
                Editar
              </Button>
            ) : (
              <Button onClick={handleSaveReminder} disabled={savingReminder}>
                {savingReminder ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingReminder ? (
                  'Salvar'
                ) : (
                  'Criar'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Center moved to DashboardLayout to be global */}
    </DashboardLayout>
  );
}


