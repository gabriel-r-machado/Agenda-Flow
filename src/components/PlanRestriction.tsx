'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlanRestrictionProps {
  feature: 'feed_post' | 'rich_profile' | 'custom_intervals' | 'availability_exceptions' | 'reports';
  children: ReactNode;
  showUpgradeCard?: boolean;
}

// Features available on each plan
const PLAN_FEATURES: Record<string, string[]> = {
  trial: ['feed_post', 'rich_profile', 'custom_intervals', 'availability_exceptions', 'reports'],
  basic: ['custom_intervals'], // Basic plan: NO feed_post, NO reports
  professional: ['feed_post', 'rich_profile', 'custom_intervals', 'availability_exceptions', 'reports'],
};

const FEATURE_NAMES: Record<string, string> = {
  feed_post: 'Post no Feed',
  rich_profile: 'Página Pública Avançada',
  custom_intervals: 'Intervalos Customizados',
  availability_exceptions: 'Exceções de Horário',
  reports: 'Relatórios Avançados',
};

export function PlanRestriction({ feature, children, showUpgradeCard = true }: PlanRestrictionProps) {
  const { profile, isTrialActive, loading: profileLoading } = useProfile();
  const router = useRouter();

  const getPlan = (): string => {
    if (isTrialActive()) return 'trial';
    if (profile?.subscription_tier === 'professional') return 'professional';
    if (profile?.subscription_tier === 'basic') return 'basic';
    return 'expired';
  };

  // If profile is still loading, allow rendering children to avoid flicker
  if (profileLoading) return <>{children}</>;

  const currentPlan = getPlan();
  const hasAccess = PLAN_FEATURES[currentPlan]?.includes(feature) || false;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgradeCard) {
    return null;
  }

  return (
    <Card className="relative border-dashed border-2 border-muted-foreground/30 bg-muted/20">
      <CardContent className="py-8">
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <Badge variant="secondary" className="mb-3">
              <Crown className="w-3 h-3 mr-1" />
              Plano Profissional
            </Badge>
            <h3 className="font-semibold mb-2">{FEATURE_NAMES[feature]}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
              Este recurso está disponível apenas no plano Profissional
            </p>
            <Button 
              onClick={() => router.push('/settings')} 
              size="sm"
              className="gradient-primary"
            >
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade
            </Button>
          </div>
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function usePlanAccess() {
  const { profile, isTrialActive } = useProfile();

  const getPlan = (): 'trial' | 'basic' | 'professional' | 'expired' => {
    // Debug log to check plan detection
    console.log('[usePlanAccess] Profile:', profile?.email, 'subscription_tier:', profile?.subscription_tier, 'isTrialActive:', isTrialActive());
    
    if (isTrialActive()) return 'trial';
    if (profile?.subscription_tier === 'professional') return 'professional';
    if (profile?.subscription_tier === 'basic') return 'basic';
    return 'expired';
  };

  const hasFeature = (feature: string): boolean => {
    const plan = getPlan();
    const hasAccess = PLAN_FEATURES[plan]?.includes(feature) || false;
    console.log('[usePlanAccess] Feature:', feature, 'Plan:', plan, 'hasAccess:', hasAccess);
    return hasAccess;
  };

  return {
    plan: getPlan(),
    hasFeature,
    isProfessional: getPlan() === 'professional' || getPlan() === 'trial',
    isBasic: getPlan() === 'basic',
    isExpired: getPlan() === 'expired',
  };
}


