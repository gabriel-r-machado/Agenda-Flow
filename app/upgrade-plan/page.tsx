'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
      'Perfil público no feed',
      'Relatórios avançados',
      'Suporte prioritário',
      'Notificações por email',
    ],
  },
};

export default function UpgradePlan() {
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState<'basic' | 'professional' | null>(null);

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
      toast.error('Erro ao iniciar checkout. Tente novamente.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="mb-4"
          >
            ← Voltar
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Sua Conta Está Inativa
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha um plano para ativar sua conta e começar a receber agendamentos
          </p>
        </div>
      </div>

      {/* Alert */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
              Acesso Limitado
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Sem um plano ativo, você não consegue acessar seu dashboard ou aparecer no feed de profissionais.
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Plan */}
          <Card className="flex flex-col relative border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl">{PLANS.basic.name}</CardTitle>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  R$ {PLANS.basic.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <CardDescription className="mt-2">
                Perfeito para começar a organizar seus agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
              <ul className="space-y-3">
                {PLANS.basic.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="w-full mt-auto"
                onClick={() => handleCheckout('basic')}
                disabled={checkoutLoading === 'basic'}
              >
                {checkoutLoading === 'basic' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Escolher Plano Básico'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="flex flex-col relative border-green-500 ring-2 ring-green-500/20 md:scale-105 md:-translate-y-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-4 py-1 rounded-full font-semibold">
              Recomendado
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  {PLANS.professional.name}
                  <Crown className="w-5 h-5 text-green-500" />
                </CardTitle>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  R$ {PLANS.professional.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <CardDescription className="mt-2">
                Máximo crescimento com recursos avançados
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
              <ul className="space-y-3">
                {PLANS.professional.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="w-full mt-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={() => handleCheckout('professional')}
                disabled={checkoutLoading === 'professional'}
              >
                {checkoutLoading === 'professional' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Escolher Plano Profissional'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Perguntas Frequentes</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Você pode cancelar ou fazer downgrade a qualquer momento. Não há penalidades.
          Seu acesso será imediatamente restaurado após o pagamento.
        </p>
      </div>
    </div>
  );
}



