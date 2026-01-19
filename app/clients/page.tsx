'use client';

import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { clientSchema } from '@/lib/validations';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClientHistory } from '@/components/ClientHistory';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { 
  Plus, 
  Search, 
  Users, 
  Phone, 
  Mail, 
  Calendar,
  Filter,
  Grid3X3,
  List,
  Loader2,
  MoreVertical,
  Edit2,
  Trash2,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
  total_appointments?: number;
  confirmed_appointments?: number;
  cancelled_appointments?: number;
  pending_appointments?: number;
  total_spent?: number;
}

export default function Clients() {
  const { profile, loading: profileLoading } = useProfile();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [historyClient, setHistoryClient] = useState<{ name: string; phone: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    if (profile) {
      fetchClients();
    }
  }, [profile]);

  // Reset form when dialog closes and cleanup potential leftover overlay
  useEffect(() => {
    console.debug('[Clients] isDialogOpen', isDialogOpen);
    if (!isDialogOpen) {
      resetForm();

      // In some browsers / race conditions the Radix overlay can remain in the DOM
      // and block clicks. Try a conservative cleanup after animations complete.
      setTimeout(() => {
        try {
          const candidates = Array.from(document.querySelectorAll('div.fixed.inset-0'));
          candidates.forEach((el) => {
            const cls = (el.className || '').toString();
            if (cls.includes('bg-black/80') || cls.includes('z-50')) {
              // remove leftover overlay
              el.remove();
              console.debug('[Clients] removed leftover dialog overlay');
            }
          });
        } catch (err) {
          console.debug('[Clients] overlay cleanup failed', err);
        }
        // Force a remount of the Dialog to ensure Radix state is fully reset
        try {
          setDialogKey((k) => k + 1);
          console.debug('[Clients] incremented dialogKey to remount dialog');
        } catch (e) {
          /* ignore */
        }
      }, 250);
    }
  }, [isDialogOpen]);

  const fetchClients = async () => {
    if (!profile) return;

    const { data: clientsData, error } = await supabase
      .from('clients')
      .select('*')
      .eq('professional_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching clients', { context: 'Clients', metadata: { error } });
      toast.error('Erro ao carregar clientes');
      setLoadingData(false);
      return;
    }

    // Aggregate appointment data by phone to calculate client lifetime value and engagement metrics
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select('client_phone, status, payment_amount')
      .eq('professional_id', profile.id);

    const clientsWithStats = (clientsData || []).map(client => {
      const clientAppointments = (appointmentsData || []).filter(
        a => a.client_phone === client.phone
      );
      
      return {
        ...client,
        total_appointments: clientAppointments.length,
        confirmed_appointments: clientAppointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length,
        cancelled_appointments: clientAppointments.filter(a => a.status === 'cancelled').length,
        pending_appointments: clientAppointments.filter(a => a.status === 'pending').length,
        total_spent: clientAppointments
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + (a.payment_amount || 0), 0),
      };
    });

    setClients(clientsWithStats);
    setLoadingData(false);
  };

  const registerNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      clientSchema.parse({
        name: form.name,
        phone: form.phone,
        email: form.email || '',
        notes: form.notes || null,
      });
    } catch (error: any) {
      const firstError = error.errors?.[0]?.message || 'Dados inválidos';
      toast.error(firstError);
      return;
    }

    setSaving(true);

    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update({
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          notes: form.notes || null,
        })
        .eq('id', editingClient.id);

      if (error) {
        logger.error('Error updating client', { context: 'Clients', metadata: { error } });
        toast.error('Erro ao atualizar cliente');
      } else {
        toast.success('Cliente atualizado!');
        fetchClients();
      }
    } else {
      const { error } = await supabase
        .from('clients')
        .insert({
          professional_id: profile.id,
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          notes: form.notes || null,
        });

      if (error) {
        logger.error('Error creating client', { context: 'Clients', metadata: { error } });
        toast.error('Erro ao cadastrar cliente');
      } else {
        toast.success('Cliente cadastrado!');
        fetchClients();
      }
    }

    setSaving(false);
    setIsDialogOpen(false);
  };

  const handleEdit = (client: Client) => {
    setHistoryClient(null); // Close history sidebar when opening edit dialog
    setEditingClient(client);
    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      notes: client.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (client: Client) => {
    setHistoryClient(null);
    if (!profile) return;

    // Check for appointments associated with this client by phone
    const { data: apptsByPhone } = await supabase
      .from('appointments')
      .select('id')
      .eq('professional_id', profile.id)
      .eq('client_phone', client.phone);

    const ids = (apptsByPhone || []).map(a => a.id);

    if (ids.length > 0) {
      const confirmDelete = window.confirm(
        `O cliente "${client.name}" possui ${ids.length} agendamento(s).\n` +
        'Deseja excluir também esses agendamentos? OK = apagar agendamentos e o cliente. Cancel = não apagar.'
      );

      if (!confirmDelete) {
        toast('Ação cancelada. Remova os agendamentos manualmente para apagar o cliente.');
        return;
      }

      // Delete associated appointments first
      const { error: delApptsError } = await supabase
        .from('appointments')
        .delete()
        .in('id', ids);

      if (delApptsError) {
        toast.error('Erro ao excluir agendamentos associados');
        return;
      }
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', client.id);

    if (error) {
      toast.error('Erro ao excluir cliente');
    } else {
      toast.success('Cliente excluído');
      fetchClients();
    }
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', notes: '' });
    setEditingClient(null);
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${name}!`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && (client.total_appointments || 0) > 0;
    if (statusFilter === 'new') return matchesSearch && (client.total_appointments || 0) === 0;
    
    return matchesSearch;
  });

  // Stats
  const totalClients = clients.length;
  const totalConfirmed = clients.reduce((sum, c) => sum + (c.confirmed_appointments || 0), 0);
  const totalPending = clients.reduce((sum, c) => sum + (c.pending_appointments || 0), 0);
  const totalCancelled = clients.reduce((sum, c) => sum + (c.cancelled_appointments || 0), 0);
  const totalRevenue = clients.reduce((sum, c) => sum + (c.total_spent || 0), 0);

  if (profileLoading) {
    return (
      <DashboardLayout title="Clientes" subtitle="Gerencie seus clientes e histórico de agendamentos">
        <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-8">
          <Skeleton className="h-16 sm:h-20 w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Clientes" subtitle="Gerencie seus clientes e histórico de agendamentos">
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        {/* View Mode Toggle */}
        <div className="flex justify-end mb-3 sm:mb-4 gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="text-xs sm:text-sm"
          >
            <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Cards</span>
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="text-xs sm:text-sm"
          >
            <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Compacto</span>
          </Button>
        </div>
        {/* Info Banner */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-success/10 border border-success/20">
          <p className="text-xs sm:text-sm text-success flex items-center gap-2">
            <span className="text-base sm:text-lg">💡</span>
            Clientes permanecem aqui mesmo após cancelamento no painel de agendamentos
          </p>
        </div>

        {/* Stats Cards - Minimalista */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-slate-200/60 hover:border-slate-300 transition-all shadow-sm">
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium mb-0.5">Total Clientes</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalClients}</p>
                </div>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 hover:border-emerald-200 transition-all shadow-sm">
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium mb-0.5">Confirmados</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600">{totalConfirmed}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 hover:border-amber-200 transition-all shadow-sm">
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium mb-0.5">Pendentes</p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-600">{totalPending}</p>
                </div>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 hover:border-rose-200 transition-all shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-0.5">Cancelados</p>
                  <p className="text-2xl font-bold text-rose-600">{totalCancelled}</p>
                </div>
                <XCircle className="w-5 h-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 hover:border-indigo-200 transition-all shadow-sm col-span-2">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-0.5">Receita Total</p>
                  <p className="text-2xl font-bold text-indigo-600">R$ {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                  <span className="text-base">💰</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters - Compacto */}
        <motion.div 
          className="mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 rounded-2xl border border-slate-200/60 bg-white shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 h-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 h-10 border-slate-200">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Com agendamentos</SelectItem>
              <SelectItem value="new">Novos clientes</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
            className="w-full md:w-auto h-10 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 font-medium"
          >
            Limpar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto h-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2 stroke-[2.5]" />
                Novo Cliente
              </Button>
      </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl border-slate-200/60">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                <DialogDescription className="text-slate-500 text-sm">
                  {editingClient ? 'Atualize os dados do cliente' : 'Cadastre um novo cliente manualmente'}
                </DialogDescription>
              </DialogHeader>
                    <form onSubmit={registerNewClient} className="space-y-5 mt-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nome completo *</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          className="bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11 text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-medium text-slate-500 uppercase tracking-wider">Telefone / WhatsApp *</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          required
                          className="bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11 text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-medium text-slate-500 uppercase tracking-wider">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="email@exemplo.com"
                          className="bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11 text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-xs font-medium text-slate-500 uppercase tracking-wider">Observações</Label>
                        <Textarea
                          id="notes"
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          placeholder="Preferências, alergias, etc..."
                          rows={3}
                          className="bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-slate-900"
                        />
                      </div>
                      <DialogFooter className="gap-2 pt-4">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setIsDialogOpen(false)}
                          className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={saving}
                          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm min-w-[100px]"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingClient ? 'Salvar' : 'Cadastrar')}
                        </Button>
                      </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Clients List */}
        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : filteredClients.length > 0 ? (
          viewMode === 'cards' ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredClients.map((client, index) => {
                  const isVIP = (client.total_appointments || 0) >= 5;
                  const isFrequent = (client.total_appointments || 0) >= 3 && !isVIP;
                  
                  return (
                    <motion.div
                      key={client.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <Card 
                        className="hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer border-slate-200/60 rounded-2xl group"
                        onClick={() => setHistoryClient({ name: client.name, phone: client.phone })}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-bold text-slate-900 leading-none">{client.name}</h3>
                                  {isVIP && (
                                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-1.5 py-0 h-4">VIP</Badge>
                                  )}
                                  {isFrequent && (
                                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-1.5 py-0 h-4">Frequente</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {client.phone}
                                </p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-slate-500 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-slate-100 hover:bg-opacity-80 dark:hover:bg-slate-800/60" 
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  openWhatsApp(client.phone, client.name);
                                }} className="cursor-pointer">
                                  <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(client);
                                }} className="cursor-pointer">
                                  <Edit2 className="w-4 h-4 mr-2 text-indigo-600" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(client);
                                  }}
                                  className="text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {client.email && (
                            <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </p>
                          )}

                          {/* Métricas Discretas em Linha */}
                          <div className="flex items-center justify-between py-3 px-3 rounded-xl bg-slate-50/80 mb-3">
                            <div className="text-center">
                              <p className="text-lg font-bold text-emerald-600">{client.confirmed_appointments || 0}</p>
                              <p className="text-[10px] text-slate-500 font-medium">Confirmados</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="text-center">
                              <p className="text-lg font-bold text-amber-600">{client.pending_appointments || 0}</p>
                              <p className="text-[10px] text-slate-500 font-medium">Pendentes</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="text-center">
                              <p className="text-lg font-bold text-rose-600">{client.cancelled_appointments || 0}</p>
                              <p className="text-[10px] text-slate-500 font-medium">Cancelados</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-slate-500 pt-3 border-t border-slate-100">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            {(client.total_appointments || 0) > 0 && (
                              <span className="text-xs font-medium text-slate-600">{client.total_appointments} agendamentos</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <Card className="border-slate-200/60 rounded-2xl shadow-sm">
              <CardContent className="p-0">
                <motion.div className="divide-y divide-slate-100" layout>
                  <AnimatePresence mode="popLayout">
                    {filteredClients.map((client, index) => {
                      const isVIP = (client.total_appointments || 0) >= 5;
                      const isFrequent = (client.total_appointments || 0) >= 3 && !isVIP;
                      
                      return (
                        <motion.div
                          key={client.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                          onClick={() => setHistoryClient({ name: client.name, phone: client.phone })}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-sm">
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-semibold text-slate-900">{client.name}</h3>
                                {isVIP && (
                                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-1.5 py-0 h-4">VIP</Badge>
                                )}
                                {isFrequent && (
                                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-1.5 py-0 h-4">Frequente</Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">{client.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-5 text-sm">
                              <span className="flex items-center gap-1">
                                <span className="text-slate-500 text-xs">Conf:</span>
                                <span className="font-semibold text-emerald-600">{client.confirmed_appointments || 0}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-slate-500 text-xs">Pend:</span>
                                <span className="font-semibold text-amber-600">{client.pending_appointments || 0}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-slate-500 text-xs">Canc:</span>
                                <span className="font-semibold text-rose-600">{client.cancelled_appointments || 0}</span>
                              </span>
                            </div>
                            <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-slate-500 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-slate-100 hover:bg-opacity-80 dark:hover:bg-slate-800/60" 
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  openWhatsApp(client.phone, client.name);
                                }} className="cursor-pointer">
                                  <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(client);
                                }} className="cursor-pointer">
                                  <Edit2 className="w-4 h-4 mr-2 text-indigo-600" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(client);
                                  }}
                                  className="text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </CardContent>
            </Card>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="py-16 border-slate-200/60 rounded-2xl shadow-sm">
              <CardContent className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum cliente encontrado</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Você ainda não possui clientes cadastrados.'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar primeiro cliente
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Client History Sidebar */}
        <ClientHistory
          open={!!historyClient}
          onOpenChange={(open) => {
            if (!open) setHistoryClient(null);
          }}
          clientName={historyClient?.name || ''}
          clientPhone={historyClient?.phone || ''}
          professionalId={profile?.id || ''}
        />
      </div>
    </DashboardLayout>
  );
}

