'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  History,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { logger } from '@/lib/logger';

interface ClientHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientPhone: string;
  professionalId: string;
}

interface AppointmentHistory {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  payment_amount: number | null;
  notes: string | null;
  services: {
    name: string;
  };
}

export function ClientHistory({ 
  open, 
  onOpenChange, 
  clientName, 
  clientPhone,
  professionalId 
}: ClientHistoryProps) {
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && clientPhone) {
      fetchHistory();
    }
  }, [open, clientPhone]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, appointment_date, appointment_time, status, payment_amount, notes, services(name)')
        .eq('professional_id', professionalId)
        .eq('client_phone', clientPhone)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;
      setAppointments((data as unknown as AppointmentHistory[]) || []);
    } catch (error) {
      logger.error('Error fetching client history', { context: 'ClientHistory', metadata: { error } });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    noShows: appointments.filter(a => a.status === 'no-show').length,
    totalSpent: appointments
      .filter(a => a.status === 'completed' && a.payment_amount)
      .reduce((sum, a) => sum + (a.payment_amount || 0), 0),
    lastVisit: appointments.find(a => a.status === 'completed')?.appointment_date,
    firstVisit: appointments[appointments.length - 1]?.appointment_date,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmado</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Cancelado</Badge>;
      case 'no-show':
        return <Badge variant="outline" className="text-orange-600"><XCircle className="w-3 h-3 mr-1" /> Não Compareceu</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-slate-900">
            <History className="w-5 h-5 text-indigo-600" />
            Histórico de {clientName}
          </SheetTitle>
          <SheetDescription className="text-slate-500">
            Todos os agendamentos e estatísticas deste cliente
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Stats KPIs - Minimalista */}
            <div className="flex items-center justify-between px-4 py-5 rounded-2xl bg-slate-50/50 border border-slate-200/50">
              <div className="flex-1 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-slate-400 stroke-[1.5]" />
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total</p>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="flex-1 text-center">
                <DollarSign className="w-5 h-5 mx-auto mb-1 text-slate-400 stroke-[1.5]" />
                <p className="text-3xl font-bold text-emerald-600">R$ {stats.totalSpent.toFixed(0)}</p>
                <p className="text-xs text-slate-500 mt-0.5">Gasto</p>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="flex-1 text-center">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-slate-400 stroke-[1.5]" />
                <p className="text-3xl font-bold text-slate-900">{stats.completed}</p>
                <p className="text-xs text-slate-500 mt-0.5">Concluídos</p>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="flex-1 text-center">
                <XCircle className="w-5 h-5 mx-auto mb-1 text-slate-400 stroke-[1.5]" />
                <p className="text-3xl font-bold text-slate-900">{stats.cancelled + stats.noShows}</p>
                <p className="text-xs text-slate-500 mt-0.5">Cancelados</p>
              </div>
            </div>

            {/* Insights Section */}
            <div className="rounded-2xl bg-indigo-50/30 border border-indigo-100/50 p-5 space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Insights do Cliente</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Cliente desde</span>
                <span className="text-sm font-semibold text-slate-900">
                  {stats.firstVisit ? format(new Date(stats.firstVisit), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                </span>
              </div>
              <div className="h-px bg-indigo-100/50" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Última visita</span>
                <span className="text-sm font-semibold text-slate-900">
                  {stats.lastVisit ? format(new Date(stats.lastVisit), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                </span>
              </div>
              <div className="h-px bg-indigo-100/50" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Taxa de comparecimento</span>
                <span className="text-sm font-bold text-emerald-600">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Timeline de Agendamentos */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Timeline de Agendamentos</h3>
              <ScrollArea className="h-[400px] pr-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500">Nenhum agendamento encontrado</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Linha vertical da timeline */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
                    
                    <div className="space-y-6">
                      {appointments.map((apt, index) => (
                        <div key={apt.id} className="relative pl-8">
                          {/* Ponto da timeline */}
                          <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 shadow-sm" />
                          
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 text-sm">{apt.services.name}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(apt.appointment_date), "dd/MM/yy", { locale: ptBR })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {apt.appointment_time.slice(0, 5)}
                                  </span>
                                </div>
                              </div>
                              {apt.payment_amount && (
                                <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">
                                  R$ {apt.payment_amount.toFixed(2)}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {apt.status === 'completed' && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 h-4 font-medium">Concluído</Badge>
                              )}
                              {apt.status === 'confirmed' && (
                                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-1.5 py-0 h-4 font-medium">Confirmado</Badge>
                              )}
                              {apt.status === 'cancelled' && (
                                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0 h-4 font-medium">Cancelado</Badge>
                              )}
                              {apt.status === 'no-show' && (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0 h-4 font-medium">Não Compareceu</Badge>
                              )}
                              {apt.status === 'pending' && (
                                <Badge className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] px-1.5 py-0 h-4 font-medium">Pendente</Badge>
                              )}
                            </div>
                            
                            {apt.notes && (
                              <p className="text-xs text-slate-500 italic leading-relaxed">
                                "{apt.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

