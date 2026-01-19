'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Loader2, Clock, Calendar, Settings2 } from 'lucide-react';
import { AvailabilityExceptions } from '@/components/settings/AvailabilityExceptions';
import { IntervalSettings } from '@/components/settings/IntervalSettings';

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  interval_minutes?: number;
}

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

export default function Availability() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      fetchAvailability();
    }
  }, [profile]);

  const fetchAvailability = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('professional_id', profile.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (!error && data) {
      setSlots(data);
    }
    setLoading(false);
  };

  const addSlot = async (dayOfWeek: number) => {
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from('availability')
      .insert({
        professional_id: profile.id,
        day_of_week: dayOfWeek,
        start_time: '09:00',
        end_time: '18:00',
      });

    if (!error) {
      fetchAvailability();
      toast.success('Horário adicionado');
    }
    setSaving(false);
  };

  const updateSlot = async (id: string, updates: Partial<AvailabilitySlot>) => {
    const { error } = await supabase
      .from('availability')
      .update(updates)
      .eq('id', id);

    if (!error) {
      fetchAvailability();
    }
  };

  const deleteSlot = async (id: string) => {
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchAvailability();
      toast.success('Horário removido');
    }
  };

  const getSlotsForDay = (dayOfWeek: number) => {
    return slots.filter(s => s.day_of_week === dayOfWeek);
  };

  const currentInterval = slots[0]?.interval_minutes || 30;

  const TabButton = ({ value, label, icon: Icon }: { value: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
        activeTab === value
          ? 'text-foreground border-primary'
          : 'text-muted-foreground border-transparent hover:text-foreground'
      }`}
    >
      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-9 w-9 sm:h-10 sm:w-10">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">Horários de Atendimento</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Gerencie sua disponibilidade e exceções
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-3 sm:gap-6 border-b border-border overflow-x-auto">
              <TabButton value="schedule" label="Horários" icon={Clock} />
              <TabButton value="exceptions" label="Exceções" icon={Calendar} />
              <TabButton value="settings" label="Intervalos" icon={Settings2} />
            </div>

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                {/* Desktop Table - escondida em mobile */}
                <div className="hidden md:block rounded-lg border border-border overflow-hidden bg-card">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-muted/40 border-b border-border font-medium text-sm text-muted-foreground">
                    <div className="col-span-2">Dia</div>
                    <div className="col-span-3">Início</div>
                    <div className="col-span-3">Fim</div>
                    <div className="col-span-2">Ativo</div>
                    <div className="col-span-2">Ações</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-border">
                    {DAYS.map((day) => {
                      const daySlots = getSlotsForDay(day.value);
                      
                      return (
                        <div key={day.value} className="space-y-0">
                          {daySlots.length === 0 ? (
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors group">
                              <div className="col-span-2">
                                <p className="font-medium text-foreground text-sm">{day.label}</p>
                              </div>
                              <div className="col-span-10 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Não configurado</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addSlot(day.value)}
                                  disabled={saving}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Adicionar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            daySlots.map((slot, idx) => (
                              <div key={slot.id} className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-muted/30 transition-colors group">
                                <div className="col-span-2">
                                  {idx === 0 && <p className="font-medium text-foreground text-sm">{day.label}</p>}
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    type="time"
                                    value={slot.start_time.slice(0, 5)}
                                    onChange={(e) => updateSlot(slot.id, { start_time: e.target.value })}
                                    className="h-8 text-sm border-border focus:ring-primary"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    type="time"
                                    value={slot.end_time.slice(0, 5)}
                                    onChange={(e) => updateSlot(slot.id, { end_time: e.target.value })}
                                    className="h-8 text-sm border-border focus:ring-primary"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Switch
                                    checked={slot.is_active}
                                    onCheckedChange={(checked) => updateSlot(slot.id, { is_active: checked })}
                                  />
                                </div>
                                <div className="col-span-2 flex gap-2 justify-end">
                                  {idx === 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => addSlot(day.value)}
                                      disabled={saving}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteSlot(slot.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Card Layout */}
                <div className="block md:hidden space-y-3">
                  {DAYS.map((day) => {
                    const daySlots = getSlotsForDay(day.value);
                    
                    return (
                      <Card key={day.value} className="border border-border">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">{day.label}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addSlot(day.value)}
                              disabled={saving}
                              className="h-8 text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-4">
                          {daySlots.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Não configurado</p>
                          ) : (
                            daySlots.map((slot) => (
                              <div key={slot.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={slot.start_time.slice(0, 5)}
                                      onChange={(e) => updateSlot(slot.id, { start_time: e.target.value })}
                                      className="h-8 w-24 text-xs"
                                    />
                                    <span className="text-xs text-muted-foreground">até</span>
                                    <Input
                                      type="time"
                                      value={slot.end_time.slice(0, 5)}
                                      onChange={(e) => updateSlot(slot.id, { end_time: e.target.value })}
                                      className="h-8 w-24 text-xs"
                                    />
                                  </div>
                                  <Switch
                                    checked={slot.is_active}
                                    onCheckedChange={(checked) => updateSlot(slot.id, { is_active: checked })}
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteSlot(slot.id)}
                                    className="h-7 text-xs text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Exceptions Tab */}
            {activeTab === 'exceptions' && profile && (
              <AvailabilityExceptions professionalId={profile.id} />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && profile && (
              <IntervalSettings 
                professionalId={profile.id} 
                currentInterval={currentInterval}
                onUpdate={fetchAvailability}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}



