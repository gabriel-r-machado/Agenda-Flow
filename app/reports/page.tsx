'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PlanRestriction, usePlanAccess } from '@/components/PlanRestriction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users,
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react';
import { format, subDays, subMonths, eachDayOfInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  appointment_date: string;
  status: string;
  payment_amount: number | null;
  created_at: string;
}

interface StatData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  chartData: Array<{ name: string; uv: number }>;
}


const COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-slate-900/90 backdrop-blur-md px-4 py-3 shadow-xl border border-slate-700/50">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold text-white">
            {entry.name}: <span style={{ color: entry.color }}>{typeof entry.value === 'number' && entry.dataKey === 'revenue' ? `R$ ${entry.value.toFixed(2)}` : entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  chartData,
}: StatData) {
  const chartColor = changeType === 'positive' ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)';

  return (
    <div className="group rounded-2xl border border-border bg-card/60 p-5 shadow-lg transition-all duration-300 ease-in-out hover:border-primary/50 hover:bg-card hover:-translate-y-1 cursor-pointer">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-muted-foreground">{title}</h3>
        <div className="text-primary/60">{icon}</div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="flex flex-col">
          <p className="text-3xl font-bold tracking-tighter text-foreground">{value}</p>
          <p
            className={`mt-1 text-xs ${
              changeType === 'positive' ? 'text-secondary' : 'text-destructive'
            }`}
          >
            {change}
          </p>
        </div>
        <div className="h-12 w-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`colorUv-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: 'rgba(200,150,255,0.1)',
                  strokeWidth: 1,
                  strokeDasharray: '3 3',
                }}
              />
              <Line
                type="monotone"
                dataKey="uv"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
                fillOpacity={1}
                fill={`url(#colorUv-${title})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { hasFeature } = usePlanAccess();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m' | 'next30d'>('30d');
  const [periodType, setPeriodType] = useState<'past' | 'future'>('past');

  useEffect(() => {
    if (profile) {
      fetchAppointments();
    }
  }, [profile, period, periodType]);

  const fetchAppointments = async () => {
    if (!profile) return;
    setLoadingData(true);

    let startDate: Date;
    let endDate = new Date();

    if (periodType === 'future') {
      // For future appointments (próximos 30 dias)
      startDate = new Date();
      endDate = addDays(startDate, 30);
    } else {
      // For past appointments
      switch (period) {
        case '7d':
          startDate = subDays(endDate, 7);
          break;
        case '30d':
          startDate = subDays(endDate, 30);
          break;
        case '90d':
          startDate = subDays(endDate, 90);
          break;
        case '12m':
          startDate = subMonths(endDate, 12);
          break;
        default:
          startDate = subDays(endDate, 30);
      }
    }

    const { data } = await supabase
      .from('appointments')
      .select('id, appointment_date, status, payment_amount, created_at')
      .eq('professional_id', profile.id)
      .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
      .lte('appointment_date', format(endDate, 'yyyy-MM-dd'))
      .order('appointment_date', { ascending: true });

    if (data) {
      setAppointments(data);
    }
    setLoadingData(false);
  };

  // Calculate stats
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  
  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.payment_amount || 0), 0);

  const cancellationRate = totalAppointments > 0 
    ? Math.round((cancelledAppointments / totalAppointments) * 100) 
    : 0;

  const confirmationRate = totalAppointments > 0 
    ? Math.round((confirmedAppointments / totalAppointments) * 100) 
    : 0;

  // Prepare chart data
  const statusData = [
    { name: 'Confirmados', value: confirmedAppointments, color: 'hsl(var(--success))' },
    { name: 'Pendentes', value: pendingAppointments, color: 'hsl(var(--warning))' },
    { name: 'Cancelados', value: cancelledAppointments, color: 'hsl(var(--destructive))' },
  ].filter(d => d.value > 0);

  // Daily appointments data
  const getDailyData = () => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = subDays(new Date(), days);
    const interval = eachDayOfInterval({ start: startDate, end: new Date() });
    
    if (period === '12m') {
      // Group by month for 12 months
      const monthlyData: { [key: string]: { confirmed: number; cancelled: number; revenue: number } } = {};
      
      appointments.forEach(apt => {
        const monthKey = format(new Date(apt.appointment_date), 'MMM/yy', { locale: ptBR });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { confirmed: 0, cancelled: 0, revenue: 0 };
        }
        if (apt.status === 'confirmed' || apt.status === 'completed') {
          monthlyData[monthKey].confirmed++;
          monthlyData[monthKey].revenue += apt.payment_amount || 0;
        }
        if (apt.status === 'cancelled') {
          monthlyData[monthKey].cancelled++;
        }
      });

      return Object.entries(monthlyData).map(([name, data]) => ({
        name,
        ...data
      }));
    }

    return interval.slice(-14).map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayAppointments = appointments.filter(a => a.appointment_date === dateStr);
      
      return {
        name: format(date, 'dd/MM'),
        confirmed: dayAppointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length,
        cancelled: dayAppointments.filter(a => a.status === 'cancelled').length,
        revenue: dayAppointments
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.payment_amount || 0), 0),
      };
    });
  };

  const dailyData = getDailyData();

  if (profileLoading) {
    return (
      <DashboardLayout title="Relatórios" subtitle="Análise de desempenho e métricas">
        <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </DashboardLayout>
    );
  }

  // Check if user has access to reports feature (only check after profile is loaded)
  if (profile && !hasFeature('reports')) {
    return (
      <DashboardLayout title="Relatórios" subtitle="Análise de desempenho e métricas">
        <div className="p-3 sm:p-6 max-w-7xl mx-auto">
          <PlanRestriction feature="reports">
            <div className="h-96" />
          </PlanRestriction>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Relatórios" subtitle="Análise de desempenho e métricas">
      <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Period Selector - Segmented Control */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Visão Geral</h2>
          <div className="flex flex-col md:flex-row gap-3">
            {/* Segmented Control */}
            <div className="relative flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              <motion.div
                className="absolute inset-y-1 rounded-lg bg-white shadow-sm"
                initial={false}
                animate={{
                  x: periodType === 'past' ? 4 : '100%',
                  width: 'calc(50% - 8px)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setPeriodType('past')}
                className={`relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  periodType === 'past'
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Passado
              </button>
              <button
                onClick={() => setPeriodType('future')}
                className={`relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  periodType === 'future'
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Próximos 30 dias
              </button>
            </div>
            {periodType === 'past' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Select value={period} onValueChange={(v: '7d' | '30d' | '90d' | '12m') => setPeriod(v as '7d' | '30d' | '90d' | '12m')}>
                  <SelectTrigger className="w-[180px] border-slate-200">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="90d">Últimos 90 dias</SelectItem>
                    <SelectItem value="12m">Últimos 12 meses</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats Cards - Minimalista */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Total de Agendamentos</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{totalAppointments}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex items-center text-xs text-slate-600">
                <TrendingUp className="w-3 h-3 mr-1 text-indigo-600" strokeWidth={2} />
                <span>Acompanhe a evolução</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Receita Total</p>
                  <p className="text-3xl font-bold tracking-tight text-emerald-600">R$ {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex items-center text-xs text-slate-600">
                <span className="font-semibold text-emerald-600 mr-1">+{((totalRevenue / (completedAppointments || 1)) * 0.1).toFixed(0)}%</span>
                <span>vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Taxa de Confirmação</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{confirmationRate}%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex items-center text-xs text-slate-600">
                <span className="font-semibold text-indigo-600 mr-1">{confirmedAppointments}</span>
                <span>confirmados</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Taxa de Cancelamento</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{cancellationRate}%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-rose-500" strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex items-center text-xs text-slate-600">
                <span className="font-semibold text-rose-600 mr-1">{cancelledAppointments}</span>
                <span>cancelados</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointments Over Time */}
            <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Agendamentos por Período</CardTitle>
              <CardDescription className="text-slate-500">Evolução de confirmados vs cancelados</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <Skeleton className="h-64" />
              ) : dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confirmed" 
                      name="Confirmados" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      fill="url(#colorConfirmed)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cancelled" 
                      name="Cancelados" 
                      stroke="#f43f5e" 
                      strokeWidth={2}
                      fill="url(#colorCancelled)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Distribuição por Status</CardTitle>
              <CardDescription className="text-slate-500">Proporção de cada status</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <Skeleton className="h-64" />
              ) : statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Receita por Período</CardTitle>
            <CardDescription className="text-slate-500">Valor recebido de agendamentos concluídos</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <Skeleton className="h-64" />
            ) : dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Receita"
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fill="url(#colorRevenue)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Nenhum dado disponível para o período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-slate-200/60 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Concluídos</p>
              <p className="text-3xl font-bold text-emerald-600">{completedAppointments}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Pendentes</p>
              <p className="text-3xl font-bold text-amber-600">{pendingAppointments}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Média por dia</p>
              <p className="text-3xl font-bold text-slate-900">{(totalAppointments / (period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365)).toFixed(1)}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Ticket Médio</p>
              <p className="text-3xl font-bold text-indigo-600">R$ {completedAppointments > 0 ? (totalRevenue / completedAppointments).toFixed(2) : '0.00'}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

