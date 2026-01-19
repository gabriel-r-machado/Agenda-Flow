'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Phone,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Star,
  Instagram,
  Facebook,
  Linkedin,
  Globe,
  Image as ImageIcon,
  MessageCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Mail,
  X,
} from 'lucide-react';
import { format, addDays, isBefore, isAfter, startOfDay, addMonths, startOfMonth, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RescheduleDialog } from '@/components/booking/RescheduleDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { appointmentBookingSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
  id: string;
  name: string;
  bio: string | null;
  profession: string | null;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  reschedule_hours_limit: number | null;
  blocked_dates: string[] | null;
  gallery?: string[];
  testimonials?: Array<{ author: string; text: string; date: string; rating: number }>;
  faq?: Array<{ question: string; answer: string }>;
  social_links?: { instagram?: string; facebook?: string; whatsapp?: string; linkedin?: string; website?: string };
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  interval_minutes: number | null;
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

interface AvailabilityException {
  id: string;
  exception_date: string;
  is_blocked: boolean;
  start_time: string | null;
  end_time: string | null;
}

export default function PublicProfile({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [availabilityExceptions, setAvailabilityExceptions] = useState<AvailabilityException[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<ExistingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date scroller state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scrollableMonth, setScrollableMonth] = useState(startOfMonth(new Date()));
  const [step, setStep] = useState<'services' | 'datetime' | 'contact' | 'success'>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  useEffect(() => {
    if (profileId) {
      fetchData();
    }
  }, [profileId]);

  const fetchData = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, name, bio, profession, city, state, avatar_url, reschedule_hours_limit, blocked_dates, gallery, testimonials, faq, social_links')
      .eq('id', profileId)
      .single();

    if (profileData) {
      setProfile(profileData as unknown as Profile);

      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', profileId)
        .eq('is_active', true);

      if (servicesData) {
        setServices(servicesData);
      }

      const { data: availabilityData } = await supabase
        .from('availability')
        .select('day_of_week, start_time, end_time, interval_minutes')
        .eq('professional_id', profileId)
        .eq('is_active', true);

      if (availabilityData) {
        setAvailability(availabilityData);
      }

      const { data: exceptionsData } = await supabase
        .from('availability_exceptions')
        .select('id, exception_date, is_blocked, start_time, end_time')
        .eq('professional_id', profileId);

      if (exceptionsData) {
        setAvailabilityExceptions(exceptionsData);
      }

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, status, service_id, services(duration_minutes)')
        .eq('professional_id', profileId)
        .in('status', ['pending', 'confirmed'])
        .gte('appointment_date', new Date().toISOString().split('T')[0]);

      if (appointmentsData) {
        setExistingAppointments(appointmentsData as unknown as ExistingAppointment[]);
      }
    }

    setLoading(false);
  };

  // Check if a time slot conflicts with existing appointments (considering service duration)
  const isTimeSlotBlocked = (dateStr: string, timeStr: string, serviceDuration: number) => {
    const slotStart = parseInt(timeStr.split(':')[0]) * 60 + parseInt(timeStr.split(':')[1]);
    const slotEnd = slotStart + serviceDuration;

    return existingAppointments.some(a => {
      // Skip cancelled appointments
      if (a.status === 'cancelled') return false;
      if (a.appointment_date !== dateStr) return false;

      const existingStart = parseInt(a.appointment_time.split(':')[0]) * 60 + parseInt(a.appointment_time.split(':')[1]);
      // Get duration from the existing appointment's service
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
    const duration = selectedService?.duration_minutes || 60;

    daySlots.forEach(slot => {
      let [startHour, startMin] = slot.start_time.split(':').map(Number);
      const [endHour, endMin] = slot.end_time.split(':').map(Number);
      const endMinutes = endHour * 60 + endMin;
      const interval = slot.interval_minutes || 30;

      while (startHour * 60 + startMin + duration <= endMinutes) {
        const timeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
        
        if (!isTimeSlotBlocked(dateStr, timeStr, duration)) {
          times.push(timeStr);
        }

        startMin += interval;
        if (startMin >= 60) {
          startHour += Math.floor(startMin / 60);
          startMin = startMin % 60;
        }
      }
    });

    return times;
  };

  const isDateAvailable = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30);
    
    if (isBefore(date, today) || isAfter(date, maxDate)) return false;
    
    // Check blocked dates from profile
    const dateStr = format(date, 'yyyy-MM-dd');
    if (profile?.blocked_dates?.includes(dateStr)) return false;

    // Check availability exceptions - if the day is blocked
    const exception = availabilityExceptions.find(e => e.exception_date === dateStr);
    if (exception && exception.is_blocked) return false;
    
    const dayOfWeek = date.getDay();
    return availability.some(a => a.day_of_week === dayOfWeek);
  };

  const handleBook = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !profile) return;

    // Validate form data
    try {
      appointmentBookingSchema.parse({
        client_name: form.name,
        client_phone: form.phone,
        client_email: form.email || '',
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        notes: form.notes || null,
      });
    } catch (error: any) {
      const firstError = error.errors?.[0]?.message || 'Dados inválidos';
      toast.error(firstError);
      return;
    }

    setBooking(true);

    try {
      // Build timestamp without timezone conversion
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const timeStr = selectedTime;
      const localTimestamp = `${dateStr}T${timeStr}:00`;

      const { data, error } = await supabase.rpc('criar_agendamento', {
        p_cliente_nome: form.name,
        p_cliente_telefone: form.phone.replace(/\D/g, ''),
        p_servico_id: selectedService.id,
        p_profissional_id: profile.id,
        p_data_horario: localTimestamp,
      });

      if (error) {
        logger.error('Error creating appointment', { context: 'PublicProfile', metadata: { error } });
        toast.error(error.message || 'Erro ao fazer agendamento. Tente novamente.');
        setBooking(false);
        return;
      }

      // Email de notificação de agendamento desabilitado
      // O profissional verá os agendamentos no dashboard

      setStep('success');
    } catch (err: any) {
      logger.error('Error creating appointment', { context: 'PublicProfile', metadata: { error: err } });
      toast.error('Erro ao fazer agendamento. Tente novamente.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Profissional não encontrado</h2>
            <p className="text-muted-foreground">Este perfil não existe ou não está disponível.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];
  
  // Gerar dias scrollable (próximos 30 dias)
  const scrollableDays = eachDayOfInterval({
    start: startOfDay(new Date()),
    end: addDays(new Date(), 30)
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Fixed Hero Header com Backdrop Blur */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar compacto */}
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200/60">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">{profile.name}</h1>
                {profile.profession && (
                  <p className="text-xs text-slate-500">{profile.profession}</p>
                )}
              </div>
            </div>
            
            {/* Badge "Aberto agora" */}
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5 h-6">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Aberto agora
            </Badge>
          </div>
        </div>
      </motion.header>

      {/* Banner Agendamento Rápido */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-200/60 px-4 py-3 text-center"
      >
        <p className="text-sm font-semibold text-indigo-700">⚡ Agende em menos de 2 minutos e sem enrolação</p>
      </motion.div>

      {/* Profile Info Section */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Info Section - ícones finos, botão "Como Chegar" */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/60 p-6 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          {profile.bio && (
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {profile.bio}
            </p>
          )}
          
          <div className="space-y-3">
            {/* Endereço */}
            {(profile.city || profile.state) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div className="flex-1 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">
                    {[profile.city, profile.state].filter(Boolean).join(', ')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    onClick={() => {
                      const address = [profile.city, profile.state].filter(Boolean).join(', ');
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                    }}
                  >
                    <Navigation className="w-3 h-3 mr-1.5" />
                    Como Chegar
                  </Button>
                </div>
              </div>
            )}
            
            {/* Social links (compacto) */}
            {profile.social_links && Object.keys(profile.social_links).length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {profile.social_links.instagram && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => window.open(profile.social_links?.instagram, '_blank')}
                  >
                    <Instagram className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                )}
                {profile.social_links.facebook && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => window.open(profile.social_links?.facebook, '_blank')}
                  >
                    <Facebook className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                )}
                {profile.social_links.linkedin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => window.open(profile.social_links?.linkedin, '_blank')}
                  >
                    <Linkedin className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                )}
                {profile.social_links.website && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => window.open(profile.social_links?.website, '_blank')}
                  >
                    <Globe className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Botão Remarcar - Destaque máximo no topo */}
        {step === 'services' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 mb-8 shadow-[0_8px_30px_rgb(99,102,241,0.3)]"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
            
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/90">Importante</p>
                </div>
                <p className="text-xl font-bold text-white mb-1">Já possui um agendamento?</p>
                <p className="text-sm text-indigo-100">Clientes não podem cancelar pelo link; podem reagendar pelo mesmo link.</p>
              </div>
              <Button 
                size="lg"
                className="h-14 px-8 text-base font-bold bg-white text-indigo-600 hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg hover:shadow-xl flex-shrink-0"
                onClick={() => setShowReschedule(true)}
              >
                <RefreshCw className="w-5 h-5 mr-2" strokeWidth={2.5} />
                Gerenciar
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' ? (
          <AnimatePresence mode="wait">
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 mx-auto mb-6 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                  Agendamento Confirmado!
                </h2>
                <p className="text-slate-600 text-sm mb-8 max-w-md mx-auto">
                  {profile.name} entrará em contato em breve para confirmar seu horário.
                </p>
                
                {/* Resumo visual */}
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6 mb-8 border border-indigo-100/50">
                  <p className="font-semibold text-slate-900 mb-3">{selectedService?.name}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <span className="font-medium text-indigo-600">
                      {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-medium text-indigo-600">{selectedTime}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-50 px-8 h-11 font-medium"
                >
                  Fazer outro agendamento
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              {/* Step Navigation - voltar */}
              {step !== 'services' && (
                <Button 
                  variant="ghost" 
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-10" 
                  onClick={() => {
                    if (step === 'datetime') setStep('services');
                    if (step === 'contact') setStep('datetime');
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Voltar
                </Button>
              )}

              {/* Services Step - Cards Premium */}
              {step === 'services' && (
                <div className="space-y-5">
                  {/* Header melhorado */}
                  <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200/60 mb-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Passo 1 de 3</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
                      Escolha um serviço
                    </h2>
                    <p className="text-lg text-slate-600 max-w-md mx-auto">Selecione o serviço que deseja agendar e vamos começar!</p>
                  </div>

                  {services.length > 0 ? (
                    <div className="space-y-3">
                      {services.map((service, idx) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <button
                            className={`w-full text-left bg-white/50 backdrop-blur-sm rounded-2xl border-2 transition-all duration-200 p-6 group hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 ${
                              selectedService?.id === service.id 
                                ? 'border-indigo-400 bg-indigo-50/80 shadow-[0_12px_40px_rgb(99,102,241,0.2)] scale-[1.02]' 
                                : 'border-slate-200/60 hover:border-indigo-300'
                            }`}
                            onClick={() => {
                              setSelectedService(service);
                              setStep('datetime');
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    selectedService?.id === service.id 
                                      ? 'bg-indigo-600' 
                                      : 'bg-gradient-to-br from-indigo-50 to-violet-50 group-hover:from-indigo-100 group-hover:to-violet-100'
                                  }`}>
                                    <CalendarIcon className={`w-4 h-4 ${
                                      selectedService?.id === service.id ? 'text-white' : 'text-indigo-600'
                                    }`} strokeWidth={2} />
                                  </div>
                                  <h3 className={`font-bold text-lg transition-colors ${
                                    selectedService?.id === service.id 
                                      ? 'text-indigo-700' 
                                      : 'text-slate-900 group-hover:text-indigo-600'
                                  }`}>
                                    {service.name}
                                  </h3>
                                </div>
                                {service.description && (
                                  <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                                )}
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-50">
                                    <Clock className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" strokeWidth={2} />
                                    <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700">
                                      {service.duration_minutes} min
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end flex-shrink-0 gap-2">
                                <p className="text-3xl font-black text-indigo-600">
                                  R$ {service.price.toFixed(2)}
                                </p>
                                <Badge className={`text-xs px-3 py-1 h-7 font-bold transition-all ${
                                  selectedService?.id === service.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                                }`}>
                                  {selectedService?.id === service.id ? '✓ Selecionado' : 'Selecionar'}
                                </Badge>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-12 text-center">
                      <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
                      <p className="text-sm text-slate-500">Nenhum serviço disponível no momento</p>
                    </div>
                  )}
                </div>
              )}

              {/* DateTime Step - Mobile-First com Date Scroller */}
              {step === 'datetime' && selectedService && (
                <div className="space-y-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Escolha data e horário</h2>
                    <p className="text-sm text-slate-600">Próximos 30 dias disponíveis</p>
                  </div>

                  {/* Resumo do serviço selecionado */}
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{selectedService.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {selectedService.duration_minutes} min <span className="text-slate-400">•</span>{' '}
                          <span className="font-semibold text-indigo-600">R$ {selectedService.price.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Date Scroller Horizontal - Mobile Optimized */}
                  <div className="relative">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
                      Selecione o dia
                    </label>
                    <div className="relative">
                      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
                        {scrollableDays.map((day, idx) => {
                          const isAvailable = isDateAvailable(day);
                          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                          
                          return (
                            <motion.button
                              key={day.toISOString()}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.01 }}
                              disabled={!isAvailable}
                              onClick={() => {
                                setSelectedDate(day);
                                setSelectedTime(null);
                              }}
                              className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center gap-1 snap-start transition-all duration-200 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-[0_8px_30px_rgb(99,102,241,0.25)] scale-105'
                                  : isAvailable
                                    ? 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                                    : 'bg-slate-50 border-2 border-slate-100 text-slate-300 cursor-not-allowed opacity-40'
                              }`}
                            >
                              <span className={`text-[10px] font-medium uppercase tracking-wider ${
                                isSelected ? 'text-indigo-100' : 'text-slate-500'
                              }`}>
                                {format(day, 'EEE', { locale: ptBR })}
                              </span>
                              <span className={`text-2xl font-bold ${
                                isSelected ? 'text-white' : isAvailable ? 'text-slate-900' : 'text-slate-300'
                              }`}>
                                {format(day, 'dd')}
                              </span>
                              <span className={`text-[10px] font-medium ${
                                isSelected ? 'text-indigo-100' : 'text-slate-500'
                              }`}>
                                {format(day, 'MMM', { locale: ptBR })}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Time Selection - Grid agrupado por período */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
                      {selectedDate 
                        ? `Horários disponíveis - ${format(selectedDate, "dd/MM")}`
                        : 'Selecione uma data primeiro'
                      }
                    </label>
                    
                    {selectedDate ? (
                      availableTimes.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableTimes.map((time, idx) => (
                            <motion.button
                              key={time}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.02 }}
                              onClick={() => setSelectedTime(time)}
                              className={`h-12 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                selectedTime === time 
                                  ? 'bg-indigo-600 text-white shadow-[0_4px_20px_rgb(99,102,241,0.3)] border-2 border-indigo-600' 
                                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'
                              }`}
                            >
                              {time}
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-8 text-center">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
                          <p className="text-sm text-slate-500">Nenhum horário disponível neste dia</p>
                        </div>
                      )
                    ) : (
                      <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-8 text-center">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
                        <p className="text-sm text-slate-500">Selecione uma data acima</p>
                      </div>
                    )}
                  </div>

                  {/* CTA continuar */}
                  <Button
                    className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-[0_4px_20px_rgb(99,102,241,0.25)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep('contact')}
                  >
                    Continuar para dados pessoais
                  </Button>
                </div>
              )}

              {/* Contact Step - Checkout limpo */}
              {step === 'contact' && selectedService && selectedDate && selectedTime && (
                <div className="space-y-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Confirme seus dados</h2>
                    <p className="text-sm text-slate-600">Estamos quase lá! Preencha suas informações</p>
                  </div>

                  {/* Resumo visual do agendamento */}
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-5 border border-indigo-100/50">
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-5 h-5 text-indigo-600" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm mb-1">{selectedService.name}</p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-indigo-600">
                            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                          </span>
                          {' '}•{' '}
                          <span className="font-medium text-indigo-600">{selectedTime}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formulário premium */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Seu nome <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Nome completo"
                        className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-11 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        WhatsApp <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          className="pl-10 rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-11 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        E-mail <span className="text-xs font-normal normal-case text-slate-400">(opcional)</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="seu@email.com"
                          className="pl-10 rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-11 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Observações <span className="text-xs font-normal normal-case text-slate-400">(opcional)</span>
                      </Label>
                      <Textarea
                        id="notes"
                        value={form.notes}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 500) {
                            setForm({ ...form, notes: value });
                          }
                        }}
                        placeholder="Informações adicionais sobre seu atendimento"
                        rows={3}
                        className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 resize-none text-sm"
                        maxLength={500}
                      />
                      <p className="text-[10px] text-slate-400 text-right">
                        {form.notes.length}/500 caracteres
                      </p>
                    </div>
                  </div>

                  {/* Consentimento LGPD */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="privacy-consent"
                        checked={acceptedPrivacy}
                        onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                        className="mt-0.5"
                      />
                      <label htmlFor="privacy-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                        Autorizo o uso dos meus dados pessoais (nome, telefone e e-mail) exclusivamente para fins de agendamento e comunicação relacionada ao serviço contratado, conforme a{' '}
                        <a href="/privacy" target="_blank" className="text-indigo-600 font-semibold hover:underline">
                          Política de Privacidade
                        </a>
                        {' '}e a LGPD.
                      </label>
                    </div>
                  </div>

                  {/* CTA Confirmar */}
                  <Button
                    className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-[0_4px_20px_rgb(99,102,241,0.25)] transition-all disabled:opacity-40"
                    disabled={!form.name || !form.phone || !acceptedPrivacy || booking}
                    onClick={handleBook}
                  >
                    {booking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" strokeWidth={1.5} />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Confirmar Agendamento
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Gallery Section - Premium */}
        {profile.gallery && profile.gallery.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-indigo-600" strokeWidth={1.5} />
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Galeria</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">Veja alguns dos nossos trabalhos</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {profile.gallery.map((url, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setLightboxSrc(url);
                                setLightboxOpen(true);
                              }}
                              className="overflow-hidden rounded-xl"
                              aria-label={`Ver imagem ${index + 1}`}
                            >
                              <motion.img
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                src={url}
                                alt={`Trabalho ${index + 1}`}
                                className="w-full h-48 object-cover rounded-xl hover:scale-105 transition-transform cursor-pointer border border-slate-200/60"
                              />
                            </button>
                          ))}
            </div>
          </motion.div>
        )}

        {/* Testimonials Section - Premium */}
        {profile.testimonials && profile.testimonials.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-indigo-600" strokeWidth={1.5} />
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Depoimentos</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">O que nossos clientes dizem</p>
            <div className="space-y-3">
              {profile.testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200/60"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-indigo-600 text-sm">
                        {testimonial.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2 flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                        <p className="font-semibold text-sm text-slate-900 break-words">{testimonial.author}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed break-words whitespace-normal">{testimonial.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lightbox dialog for gallery images */}
        <Dialog open={lightboxOpen} onOpenChange={(open) => { if (!open) setLightboxSrc(null); setLightboxOpen(open); }}>
          <DialogContent className="p-0 max-w-4xl w-full sm:mx-auto">
            <div className="relative bg-black/90 flex items-center justify-center">
              <img
                src={lightboxSrc || ''}
                alt="Imagem da galeria"
                className="w-full h-[70vh] sm:h-[80vh] object-contain"
              />
              <Button
                variant="ghost"
                onClick={() => setLightboxOpen(false)}
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 shadow-md rounded-full p-2"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* FAQ Section - Premium */}
        {profile.faq && profile.faq.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-indigo-600" strokeWidth={1.5} />
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Perguntas Frequentes</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">Tire suas dúvidas</p>
            <Accordion type="single" collapsible className="w-full">
              {profile.faq.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-slate-200/60">
                  <AccordionTrigger className="text-left text-sm font-semibold text-slate-900 hover:text-indigo-600 hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-600 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        )}
      </main>

      {/* Reschedule Dialog */}
      <RescheduleDialog
        open={showReschedule}
        onOpenChange={setShowReschedule}
        professionalId={profile.id}
        rescheduleHoursLimit={profile.reschedule_hours_limit || 4}
        availability={availability}
        existingAppointments={existingAppointments}
        blockedDates={profile.blocked_dates || []}
        onSuccess={fetchData}
      />
    </div>
  );
}