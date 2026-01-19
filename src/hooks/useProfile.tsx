import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  profession: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  is_professional: boolean | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  status: string | null;
  blocked_dates: string[] | null;
  reschedule_hours_limit: number | null;
  price_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      // Cast to Profile type - database columns match our interface
      const profileData = data as unknown as Profile;
      
      // Auto-sync subscription_tier based on price_id if not already set
      if (!profileData.subscription_tier && profileData.subscription_status === 'active' && profileData.price_id) {
        const priceId = profileData.price_id;
        let tier = 'free';
        
        if (priceId === 'price_1S6JQ7GgnTSDhFJSFTxI6mxm') {
          tier = 'basic';
        } else if (priceId === 'price_1S6JRNGgnTSDhFJSSalULAqg') {
          tier = 'professional';
        }
        
        await supabase
          .from('profiles')
          .update({ subscription_tier: tier } as any)
          .eq('id', profileData.id);
        
        profileData.subscription_tier = tier;
      }
      
      // Also sync trial subscriptions to professional
      if (!profileData.subscription_tier && profileData.subscription_status === 'trial') {
        await supabase
          .from('profiles')
          .update({ subscription_tier: 'professional' } as any)
          .eq('id', profileData.id);
        
        profileData.subscription_tier = 'professional';
      }
      
      setProfile(profileData);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { error: new Error('No profile found') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const isTrialActive = () => {
    if (!profile?.trial_ends_at) return false;
    return new Date(profile.trial_ends_at) > new Date();
  };

  const isSubscriptionActive = () => {
    return profile?.subscription_status === 'active' || isTrialActive();
  };

  const getTrialDaysLeft = () => {
    if (!profile?.trial_ends_at) return 0;
    const diff = new Date(profile.trial_ends_at).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const isAccountActive = () => {
    // Account is active only if status is 'Ativo' AND has active subscription
    return profile?.status === 'Ativo' && (profile?.subscription_status === 'active' || isTrialActive());
  };

  return {
    profile,
    loading,
    updateProfile,
    isTrialActive,
    isSubscriptionActive,
    getTrialDaysLeft,
    isAccountActive,
    refetch: fetchProfile,
  };
}
