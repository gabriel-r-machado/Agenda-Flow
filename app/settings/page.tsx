'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, User, MapPin, Clock, Calendar, Check, Crown, CreditCard, Lock, ExternalLink, Settings as SettingsIcon, Save } from 'lucide-react';
import { AvatarUpload } from '@/components/settings/AvatarUpload';
import { BlockedDates } from '@/components/settings/BlockedDates';
import { RescheduleSettings } from '@/components/settings/RescheduleSettings';
import { CategorySelect } from '@/components/settings/CategorySelect';
import { RichProfileManager } from '@/components/settings/RichProfileManager';
// Stripe plans configuration
const PLANS = {
  basic: {
    name: 'Básico',
    priceId: 'price_1S6JQ7GgnTSDhFJSFTxI6mxm',
    productId: 'prod_T2OCpqWiEzCmsE',
    price: 14.90,
    features: [
      'Agendamentos ilimitados',
      'Gestão de clientes',
      'Gestão de serviços',
      'Página de agendamento',
      'Lembretes internos',
    ],
  },
  professional: {
    name: 'Profissional',
    priceId: 'price_1S6JRNGgnTSDhFJSSalULAqg',
    productId: 'prod_T2ODB3jKJSYfRe',
    price: 21.90,
    features: [
      'Tudo do Básico',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
  },
};

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
}

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const { profile, updateProfile, isTrialActive, getTrialDaysLeft, refetch } = useProfile();
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const hasCheckedSubscription = useRef(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'gallery' | 'rules'>('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialFormRef = useRef<typeof form | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    loading: true,
  });
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    profession: '',
    category: '',
    city: '',
    state: '',
    address: '',
    is_professional: false,
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const plansRef = useRef<HTMLDivElement | null>(null);

  const checkSubscription = useCallback(async (force = false) => {
    if (!user) return;
    if (hasCheckedSubscription.current && !force) return;
    
    // Verify we have a valid session before calling the edge function
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      setSubscription(prev => ({ ...prev, loading: false }));
      return;
    }
    
    hasCheckedSubscription.current = true;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        // If auth error, just set loading to false without throwing
        if (error.message?.includes('Auth') || error.message?.includes('session')) {
          console.log('Auth error during subscription check, session may have expired');
          setSubscription(prev => ({ ...prev, loading: false }));
          return;
        }
        throw error;
      }
      
      setSubscription({
        subscribed: data?.subscribed ?? false,
        subscription_tier: data?.subscription_tier ?? null,
        subscription_end: data?.subscription_end ?? null,
        loading: false,
      });
      
      // Refetch profile to update subscription status
      refetch();
    } catch (error) {
      logger.error('Error checking subscription', { context: 'Settings', metadata: { error } });
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  }, [user, refetch]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !hasCheckedSubscription.current) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  // Handle success/cancel from Stripe checkout
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Assinatura realizada com sucesso!');
      hasCheckedSubscription.current = false;
      checkSubscription(true);
      router.replace('/settings');
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelado');
      router.replace('/settings');
    }
  }, [searchParams, router, checkSubscription]);

  // Handle section query param to switch tabs
  useEffect(() => {
    const section = searchParams.get('section');
    if (section === 'subscription') {
      setActiveTab('subscription');
    } else if (section === 'gallery') {
      setActiveTab('gallery');
    } else if (section === 'rules') {
      setActiveTab('rules');
    } else if (section === 'profile') {
      setActiveTab('profile');
    }
  }, [searchParams]);

  // If the URL requests the plans section, scroll to it
  useEffect(() => {
    const section = searchParams.get('section');
    if (section === 'plans' && plansRef.current) {
      // small timeout to ensure layout rendered
      setTimeout(() => plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, [searchParams]);

  useEffect(() => {
    if (profile) {
      const formData = {
        name: profile.name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        profession: profile.profession || '',
        category: (profile as any).category || '',
        city: profile.city || '',
        state: profile.state || '',
        address: profile.address || '',
        is_professional: profile.is_professional || false,
      };
      setForm(formData);
      initialFormRef.current = formData;
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  useEffect(() => {
    if (!initialFormRef.current) return;
    const hasChanges = JSON.stringify(form) !== JSON.stringify(initialFormRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [form]);

  const persistProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await updateProfile({
      ...form,
      category: form.category,
    } as any);

    if (error) {
      toast.error('Erro ao salvar configurações');
    } else {
      toast.success('Configurações salvas!');
      initialFormRef.current = form;
      setHasUnsavedChanges(false);
    }

    setSaving(false);
  };

  const handleBlockedDatesUpdate = async (dates: string[]) => {
    if (!profile) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ blocked_dates: dates })
      .eq('id', profile.id);

    if (error) throw error;
    refetch();
  };

  const handleRescheduleHoursUpdate = async (hours: number) => {
    if (!profile) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ reschedule_hours_limit: hours })
      .eq('id', profile.id);

    if (error) throw error;
    refetch();
  };

  const handleCheckout = async (planKey: 'basic' | 'professional') => {
    setCheckoutLoading(planKey);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PLANS[planKey].priceId },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao iniciar checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      logger.error('Error opening portal', { context: 'Settings', metadata: { error } });
      toast.error('Erro ao abrir portal de gerenciamento');
    } finally {
      setPortalLoading(false);
    }
  };

  const trialDaysLeft = getTrialDaysLeft();
  const isCurrentPlan = (planKey: string) => subscription.subscription_tier === planKey;
  const hasActiveSubscription = subscription.subscribed && subscription.subscription_tier;
  const isProfessionalPlan = subscription.subscription_tier === 'professional' || isTrialActive();

  const tabs = [
    { id: 'profile' as const, label: 'Perfil', icon: User },
    { id: 'subscription' as const, label: 'Assinatura', icon: Crown },
    { id: 'rules' as const, label: 'Regras', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>
                <p className="text-sm text-slate-500">Gerencie seu perfil e preferências</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1 border-b border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Stats Overview */}
                        <div className="grid grid-cols-3 gap-4">
                  <Card className="text-center border-slate-200/60 shadow-sm">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
                      </div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Horários</p>
                      <p className="text-2xl font-bold text-slate-900">0</p>
                    </CardContent>
                  </Card>
                  <Card className="text-center border-slate-200/60 shadow-sm">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
                      </div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Bloqueados</p>
                      <p className="text-2xl font-bold text-slate-900">{(profile?.blocked_dates || []).length}</p>
                    </CardContent>
                  </Card>
                  <Card className="text-center border-emerald-200/60 bg-emerald-50/50 shadow-sm">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                      </div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {hasActiveSubscription ? 'Ativo' : isTrialActive() ? 'Trial' : 'Inativo'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Photo Upload */}
                <Card className="border-slate-200/60 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900">Foto de Perfil</CardTitle>
                    <CardDescription className="text-slate-500">Sua foto será exibida na página pública</CardDescription>
                  </CardHeader>
                  <CardContent className="py-6">
                    {user && (
                      <AvatarUpload
                        userId={user.id}
                        currentAvatarUrl={avatarUrl}
                        userName={form.name}
                        onAvatarUpdate={(url) => setAvatarUrl(url)}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Profile Settings */}
                <Card className="border-slate-200/60 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" strokeWidth={2} />
                      Informações Pessoais
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Dados exibidos na sua página pública
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={persistProfileChanges} className="space-y-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nome completo</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Endereço completo</Label>
                        <Input
                          id="address"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP"
                          className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Telefone de contato</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                        />
                      </div>

                      <CategorySelect
                        value={form.category}
                        onChange={(value) => setForm({ ...form, category: value })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cidade</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              id="city"
                              value={form.city}
                              onChange={(e) => setForm({ ...form, city: e.target.value })}
                              placeholder="São Paulo"
                              className="pl-10 rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="state" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</Label>
                          <Input
                            id="state"
                            value={form.state}
                            onChange={(e) => setForm({ ...form, state: e.target.value })}
                            placeholder="SP"
                            maxLength={2}
                            className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sobre você</Label>
                        <Textarea
                          id="bio"
                          value={form.bio}
                          onChange={(e) => setForm({ ...form, bio: e.target.value })}
                          placeholder="Conte um pouco sobre você e seus serviços..."
                          rows={4}
                          className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                        />
                      </div>

                      {/* Perfil Público removed: 'Aparecer no feed de profissionais' option intentionally omitted */}
                    </form>
                  </CardContent>
                </Card>

                {/* Link to Public Page */}
                {profile && (
                  <Card className="border-indigo-200/60 bg-indigo-50/50 shadow-sm">
                    <CardContent className="py-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">Sua Página de Agendamento</p>
                          <p className="text-sm text-slate-600 mt-0.5">
                            Compartilhe este link com seus clientes
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => window.open(`/p/${profile.id}`, '_blank')}
                          className="border-indigo-200 hover:bg-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-8">
        {/* Subscription Plans */}
        <div ref={plansRef}>
        <Card className="border-slate-200/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Planos de Assinatura
            </CardTitle>
            <CardDescription>
              {isTrialActive() 
                ? `${trialDaysLeft} dia${trialDaysLeft > 1 ? 's' : ''} restante${trialDaysLeft > 1 ? 's' : ''} no trial`
                : hasActiveSubscription 
                  ? 'Gerencie sua assinatura atual'
                  : 'Escolha o plano ideal para sua clínica'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription.loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Basic Plan */}
                  <Card className={`relative ${isCurrentPlan('basic') ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                    {isCurrentPlan('basic') && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                        Seu Plano
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <CardTitle>
                        {PLANS.basic.name}
                      </CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">R$ {PLANS.basic.price.toFixed(2).replace('.', ',')}</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {PLANS.basic.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {!isCurrentPlan('basic') && (
                        <Button 
                          className="w-full" 
                          variant={hasActiveSubscription ? "outline" : "default"}
                          onClick={() => handleCheckout('basic')}
                          disabled={checkoutLoading === 'basic'}
                        >
                          {checkoutLoading === 'basic' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Assinar Básico'
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Professional Plan */}
                  <Card className={`relative ${isCurrentPlan('professional') ? 'border-primary ring-2 ring-primary/20' : 'border-primary/50'}`}>
                    {isCurrentPlan('professional') ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                        Seu Plano
                      </div>
                    ) : (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-500 text-primary-foreground text-xs px-3 py-1 rounded-full">
                        Recomendado
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-primary" />
                        {PLANS.professional.name}
                      </CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">R$ {PLANS.professional.price.toFixed(2).replace('.', ',')}</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {PLANS.professional.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {!isCurrentPlan('professional') && (
                        <Button 
                          className="w-full gradient-primary" 
                          onClick={() => handleCheckout('professional')}
                          disabled={checkoutLoading === 'professional'}
                        >
                          {checkoutLoading === 'professional' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Assinar Profissional'
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Manage Subscription */}
                {hasActiveSubscription && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Gerenciar Assinatura</p>
                        <p className="text-sm text-muted-foreground">
                          Altere seu plano, método de pagamento ou cancele
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                      >
                        {portalLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Gerenciar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Refresh subscription status */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => checkSubscription(true)}
                  className="w-full text-muted-foreground"
                >
                  Atualizar status da assinatura
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        </div>

                {/* Profile Settings */}
                <Card className="border-slate-200/60 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" strokeWidth={2} />
                      Informações Pessoais
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Dados exibidos na sua página pública
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={persistProfileChanges} className="space-y-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nome completo</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Endereço completo</Label>
                        <Input
                          id="address"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP"
                          className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Telefone de contato</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                        />
                      </div>

                      <CategorySelect
                        value={form.category}
                        onChange={(value) => setForm({ ...form, category: value })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cidade</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              id="city"
                              value={form.city}
                              onChange={(e) => setForm({ ...form, city: e.target.value })}
                              placeholder="São Paulo"
                              className="pl-10 rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="state" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</Label>
                          <Input
                            id="state"
                            value={form.state}
                            onChange={(e) => setForm({ ...form, state: e.target.value })}
                            placeholder="SP"
                            maxLength={2}
                            className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sobre você</Label>
                        <Textarea
                          id="bio"
                          value={form.bio}
                          onChange={(e) => setForm({ ...form, bio: e.target.value })}
                          placeholder="Conte um pouco sobre você e seus serviços..."
                          rows={4}
                          className="rounded-xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                        />
                      </div>

                      {/* Perfil Público removed: 'Aparecer no feed de profissionais' option intentionally omitted */}
                    </form>
                  </CardContent>
                </Card>

                {/* Link to Public Page */}
                {profile && (
                  <Card className="border-indigo-200/60 bg-indigo-50/50 shadow-sm">
                    <CardContent className="py-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">Sua Página de Agendamento</p>
                          <p className="text-sm text-slate-600 mt-0.5">
                            Compartilhe este link com seus clientes
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => window.open(`/p/${profile.id}`, '_blank')}
                          className="border-indigo-200 hover:bg-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-8">

        <Separator />

        {/* Rich Profile Manager - Disponível para todos */}
        {profile && (
          <RichProfileManager
            profileId={profile.id}
            gallery={(profile as any).gallery || []}
            testimonials={(profile as any).testimonials || []}
            faq={(profile as any).faq || []}
            socialLinks={(profile as any).social_links || {}}
            onUpdate={refetch}
          />
        )}

        {/* Link to Public Page */}
        {profile && (
          <Card className="glass border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sua Página de Agendamento</p>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe este link com seus clientes
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/p/${profile.id}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
              </div>
            )}

            {/* Rules Tab */}
            {activeTab === 'rules' && (
              <div className="space-y-8">
                <BlockedDates
                  blockedDates={profile?.blocked_dates || []}
                  onUpdate={handleBlockedDatesUpdate}
                />

                <RescheduleSettings
                  currentHours={profile?.reschedule_hours_limit || 4}
                  onUpdate={handleRescheduleHoursUpdate}
                />

                <Card className="border-slate-200/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      Dicas de uso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-2xl">⏰</span>
                      <p className="text-slate-700"><strong className="text-slate-900">Dica de Horários:</strong> Configure horários em intervalos de 30 minutos para maior flexibilidade nos agendamentos.</p>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-2xl">📅</span>
                      <p className="text-slate-700"><strong className="text-slate-900">Dias Inativos:</strong> Bloqueie feriados e dias de folga com antecedência para evitar agendamentos indesejados.</p>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-2xl">🔔</span>
                      <p className="text-slate-700"><strong className="text-slate-900">Status da Clínica:</strong> Use o status "Inativo" temporariamente quando precisar pausar novos agendamentos.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Save Bar */}
      <AnimatePresence>
        {hasUnsavedChanges && activeTab === 'profile' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30"
          >
            <Card className="border-indigo-200 shadow-2xl bg-white">
              <CardContent className="py-4 px-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    <p className="text-sm font-medium text-slate-900">Você tem alterações não salvas</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (initialFormRef.current) {
                          setForm(initialFormRef.current);
                        }
                      }}
                      className="border-slate-200"
                    >
                      Descartar
                    </Button>
                    <Button
                      size="sm"
                      onClick={persistProfileChanges}
                      disabled={saving}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



