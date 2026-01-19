'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { logger } from '@/lib/logger';
import { useReminders } from '@/hooks/useReminders';
import { SidebarProvider } from '@/components/ui/animated-sidebar';
import { AppSidebar } from './AppSidebar';
import NotificationPanel from '@/components/NotificationPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showTrialBanner?: boolean;
}

export function DashboardLayout({ 
  children, 
  title, 
  subtitle,
  showTrialBanner = true 
}: DashboardLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, getTrialDaysLeft, isTrialActive, isSubscriptionActive } = useProfile();
  const { notifications, removeNotification, markNotificationAsRead, toggleMute, isMuted, realtimeConnected } = useReminders();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  const trialDaysLeft = getTrialDaysLeft();
  const isTrialActiveResult = isTrialActive();
  const isSubscriptionActiveResult = isSubscriptionActive();
  const hasActiveAccess = isTrialActiveResult || isSubscriptionActiveResult;

  // Debug log
  console.log('DashboardLayout Debug:', {
    subscriptionStatus: profile?.subscription_status,
    trialEndsAt: profile?.trial_ends_at,
    isTrialActive: isTrialActiveResult,
    isSubscriptionActive: isSubscriptionActiveResult,
    hasActiveAccess,
    profileLoaded: !!profile,
  });

  // Backend enforces access; frontend will not show a banner for expired subscriptions.

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full pt-14 md:pt-0">
          {/* Trial Banner */}
          {showTrialBanner && isTrialActive() && trialDaysLeft <= 3 && (
            <div className="bg-success text-success-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>
                Você está no período de teste gratuito. Faltam <strong>{trialDaysLeft} dia{trialDaysLeft > 1 ? 's' : ''}</strong>.
              </span>
              <Button 
                size="sm" 
                variant="secondary" 
                className="ml-2 h-7"
                onClick={() => router.push('/settings?tab=plans')}
              >
                Assinar agora
              </Button>
            </div>
          )}

          {/* Header */}
          <header className="border-b bg-card sticky top-0 z-10 hidden md:block">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-4">
                {title && (
                  <div>
                    <h1 className="text-xl font-bold">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                  </div>
                )}
              </div>
              {/* No expired-subscription banner: backend enforces access. */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3">
                  <NotificationPanel
                    notifications={notifications}
                    onRemove={removeNotification}
                    onMarkAsRead={markNotificationAsRead}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1">
            {children}
            {/* Notifications are shown in the NotificationPanel (bell); pop-up center disabled */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


