'use client';

import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';


export function DebugPage() {
  const { profile, loading, isTrialActive, isSubscriptionActive, getTrialDaysLeft } = useProfile();
  const { user } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  const isTrialActiveResult = isTrialActive();
  const isSubscriptionActiveResult = isSubscriptionActive();
  const hasActiveAccess = isTrialActiveResult || isSubscriptionActiveResult;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          ← Voltar ao Dashboard
        </Button>

        <Card className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">Debug - Status da Conta</h1>

          <div className="space-y-4 text-sm">
            <div className="border-b pb-4">
              <h2 className="font-bold mb-2">Dados do Usuário</h2>
              <div className="space-y-2 text-xs font-mono bg-slate-50 p-3 rounded">
                <p>User ID: {user?.id}</p>
                <p>Email: {user?.email}</p>
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="font-bold mb-2">Dados do Perfil</h2>
              <div className="space-y-2 text-xs font-mono bg-slate-50 p-3 rounded">
                <p>Nome: {profile?.name || 'N/A'}</p>
                <p>Profile ID: {profile?.id || 'N/A'}</p>
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="font-bold mb-2">Status de Assinatura</h2>
              <div className="space-y-2 text-xs font-mono bg-slate-50 p-3 rounded">
                <p>subscription_status: <span className="font-bold text-blue-600">{profile?.subscription_status || 'null'}</span></p>
                <p>trial_ends_at: <span className="font-bold text-blue-600">{profile?.trial_ends_at || 'null'}</span></p>
                <p>trial_started_at: <span className="font-bold text-blue-600">{profile?.trial_started_at || 'null'}</span></p>
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="font-bold mb-2">Análise de Acesso</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span>isTrialActive():</span>
                  <span className={`font-bold ${isTrialActiveResult ? 'text-green-600' : 'text-red-600'}`}>
                    {isTrialActiveResult ? '✓ SIM' : '✗ NÃO'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span>isSubscriptionActive():</span>
                  <span className={`font-bold ${isSubscriptionActiveResult ? 'text-green-600' : 'text-red-600'}`}>
                    {isSubscriptionActiveResult ? '✓ SIM' : '✗ NÃO'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded border-2 border-blue-200">
                  <span className="font-bold">hasActiveAccess (Trial OR Assinatura):</span>
                  <span className={`font-bold text-lg ${hasActiveAccess ? 'text-green-600' : 'text-red-600'}`}>
                    {hasActiveAccess ? '✓ ACESSO LIBERADO' : '✗ ACESSO BLOQUEADO'}
                  </span>
                </div>
                {isTrialActiveResult && (
                  <div className="p-2 bg-green-50 rounded">
                    <p>Dias de teste restantes: <span className="font-bold">{getTrialDaysLeft()} dias</span></p>
                  </div>
                )}
              </div>
            </div>

            <div className="pb-4">
              <h2 className="font-bold mb-2">Lógica de Bloqueio</h2>
              <div className="text-xs space-y-2">
                <p>Se <strong>subscription_status !== 'active'</strong> E <strong>trial_ends_at estiver no passado</strong>:</p>
                <p className="text-red-600 font-bold">→ Dashboard será BLOQUEADO com tela de assinatura expirada</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-xs text-gray-500 p-4 bg-slate-50 rounded">
          <p>Abra o Console do Navegador (F12 → Console) para ver logs detalhados ao carregar o Dashboard</p>
        </div>
      </div>
    </div>
  );
}



