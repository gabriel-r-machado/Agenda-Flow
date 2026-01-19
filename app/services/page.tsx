'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Pencil, Trash2, Clock, DollarSign, Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export default function Services() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
  });
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      fetchServices();
    }
  }, [profile]);

  const fetchServices = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('professional_id', profile.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setServices(data);
    }
    setLoading(false);
  };

  const openDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setForm({
        name: service.name,
        description: service.description || '',
        duration_minutes: service.duration_minutes,
        price: service.price,
      });
    } else {
      setEditingService(null);
      setForm({ name: '', description: '', duration_minutes: 60, price: 0 });
    }
    setDialogOpen(true);
  };

  const createOrUpdateServiceOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);

    if (editingService) {
      const { error } = await supabase
        .from('services')
        .update({
          name: form.name,
          description: form.description || null,
          duration_minutes: form.duration_minutes,
          price: form.price,
        })
        .eq('id', editingService.id);

      if (error) {
        toast.error('Erro ao atualizar serviço');
      } else {
        toast.success('Serviço atualizado!');
        fetchServices();
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('services')
        .insert({
          professional_id: profile.id,
          name: form.name,
          description: form.description || null,
          duration_minutes: form.duration_minutes,
          price: form.price,
        });

      if (error) {
        toast.error('Erro ao criar serviço');
      } else {
        toast.success('Serviço criado!');
        fetchServices();
        setDialogOpen(false);
      }
    }

    setSaving(false);
  };

  const toggleService = async (service: Service) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id);

    if (!error) {
      fetchServices();
      toast.success(service.is_active ? 'Serviço desativado' : 'Serviço ativado');
    }
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchServices();
      toast.success('Serviço removido');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push('/dashboard')}
              className="hover:bg-slate-100 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Meus Serviços</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <p className="text-slate-600 font-medium">
            Gerencie os serviços que você oferece
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => openDialog()} 
                className="h-11 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 hover:scale-105 shadow-[0_4px_20px_rgb(99,102,241,0.25)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 gap-0 border-0 shadow-[0_20px_60px_rgb(0,0,0,0.15)] backdrop-blur-md">
              <div className="p-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                    {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={createOrUpdateServiceOffering} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Nome do serviço</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Corte de cabelo"
                      className="h-12 bg-slate-50 border-slate-200/60 rounded-xl focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Descreva o serviço..."
                      className="min-h-[100px] bg-slate-50 border-slate-200/60 rounded-xl focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 placeholder:text-slate-400 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-semibold text-slate-700">Duração (minutos)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={form.duration_minutes}
                        onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                        min={15}
                        step={15}
                        className="h-12 bg-slate-50 border-slate-200/60 rounded-xl focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-semibold text-slate-700">Preço (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                        min={0}
                        step={0.01}
                        className="h-12 bg-slate-50 border-slate-200/60 rounded-xl focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-[1.02] shadow-[0_4px_20px_rgb(16,185,129,0.25)] text-base font-medium" 
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingService ? 'Salvar Alterações' : 'Criar Serviço')}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse border border-slate-200/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <CardContent className="h-24" />
              </Card>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className={`border border-slate-200/50 bg-white shadow-[0_2px_15px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all duration-300 ${!service.is_active ? 'opacity-50' : ''}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="font-bold text-lg text-slate-900 truncate">{service.name}</h3>
                            <motion.div whileTap={{ scale: 0.95 }}>
                              <Switch
                                checked={service.is_active}
                                onCheckedChange={() => toggleService(service)}
                                className="data-[state=checked]:bg-emerald-500"
                              />
                            </motion.div>
                          </div>
                          {service.description && (
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{service.description}</p>
                          )}
                          <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2 text-sm font-medium">
                              <Clock className="w-4 h-4 text-slate-500" />
                              <span className="text-slate-700">{service.duration_minutes} min</span>
                            </span>
                            <span className="flex items-center gap-2 text-sm font-semibold">
                              <DollarSign className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-600">R$ {service.price.toFixed(2)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDialog(service)}
                            className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 hover:scale-110"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteService(service.id)}
                            className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border border-slate-200/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <CardContent className="py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 mx-auto mb-6 flex items-center justify-center shadow-inner">
                  <Plus className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum serviço cadastrado</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Adicione os serviços que você oferece para seus clientes começarem a agendar
                </p>
                <Button 
                  onClick={() => openDialog()} 
                  className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 hover:scale-105 shadow-[0_4px_20px_rgb(99,102,241,0.25)]"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar primeiro serviço
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}


