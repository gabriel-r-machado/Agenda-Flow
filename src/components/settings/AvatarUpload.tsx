'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Camera, Loader2, User } from 'lucide-react';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  userName: string;
  onAvatarUpdate: (url: string) => void;
}

export function AvatarUpload({ userId, currentAvatarUrl, userName, onAvatarUpdate }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add timestamp to avoid cache
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithTimestamp })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      onAvatarUpdate(urlWithTimestamp);
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      logger.error('Error uploading avatar', { context: 'AvatarUpload', metadata: { error } });
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="w-24 h-24 border-4 border-primary/20">
          <AvatarImage src={currentAvatarUrl || undefined} alt={userName} />
          <AvatarFallback className="text-2xl gradient-primary text-primary-foreground">
            {userName ? userName.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full w-8 h-8 shadow-lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
      <p className="text-xs text-muted-foreground text-center">
        Clique no ícone para alterar sua foto
      </p>
    </div>
  );
}

