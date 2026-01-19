'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ImagePlus, Megaphone, Crown, X } from 'lucide-react';

interface FeedPost {
  id: string;
  professional_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}

interface FeedPostManagerProps {
  profileId: string;
  hasActiveProfessionalPlan: boolean;
}

export function FeedPostManager({ profileId, hasActiveProfessionalPlan }: FeedPostManagerProps) {
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPost();
  }, [profileId]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('professional_id', profileId)
      .maybeSingle();

    if (!error && data) {
      setPost(data);
      setForm({
        title: data.title || '',
        description: data.description || '',
        image_url: data.image_url || '',
        is_active: data.is_active ?? true,
      });
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${profileId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('feed-posts')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error('Erro ao fazer upload da imagem');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('feed-posts')
      .getPublicUrl(fileName);

    setForm({ ...form, image_url: urlData.publicUrl });
    setUploading(false);
    toast.success('Imagem carregada!');
  };

  const handleRemoveImage = () => {
    setForm({ ...form, image_url: '' });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setSaving(true);

    try {
      if (post) {
        const { error } = await supabase
          .from('feed_posts')
          .update({
            title: form.title.trim(),
            description: form.description.trim() || null,
            image_url: form.image_url || null,
            is_active: form.is_active,
          })
          .eq('id', post.id);

        if (error) throw error;
        toast.success('Post atualizado!');
      } else {
        const { error } = await supabase
          .from('feed_posts')
          .insert({
            professional_id: profileId,
            title: form.title.trim(),
            description: form.description.trim() || null,
            image_url: form.image_url || null,
            is_active: form.is_active,
          });

        if (error) throw error;
        toast.success('Post criado!');
      }

      fetchPost();
    } catch (error) {
      logger.error('Error saving post', { context: 'FeedPostManager', metadata: { error } });
      toast.error('Erro ao salvar post');
    } finally {
      setSaving(false);
    }
  };

  if (!hasActiveProfessionalPlan) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Meu Post no Feed
          </CardTitle>
          <CardDescription>
            Destaque seu negócio no feed de profissionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Recurso Exclusivo</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">
              Crie um post no feed para atrair mais clientes! Disponível apenas no plano Profissional.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          Meu Post no Feed
        </CardTitle>
        <CardDescription>
          Crie um destaque para aparecer no feed público
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Foto do Post</Label>
          {form.image_url ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={form.image_url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
              <div className="flex flex-col items-center justify-center py-8">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Clique para adicionar uma foto</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="post-title">Título *</Label>
          <Input
            id="post-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ex: Promoção de Inverno!"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground text-right">{form.title.length}/60</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="post-description">Descrição</Label>
          <Textarea
            id="post-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descreva seu serviço ou promoção..."
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">{form.description.length}/200</p>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="post-active">Ativo no Feed</Label>
            <p className="text-sm text-muted-foreground">
              Seu post aparecerá no feed público
            </p>
          </div>
          <Switch
            id="post-active"
            checked={form.is_active}
            onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
          />
        </div>

        <Button onClick={handleSave} className="w-full gradient-primary" disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : post ? (
            'Salvar Alterações'
          ) : (
            'Criar Post'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

