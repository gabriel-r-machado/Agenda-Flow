'use client';

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Trash2, Star, Image, MessageCircle, HelpCircle, Loader2, Instagram, Facebook, Linkedin } from 'lucide-react';

interface Testimonial {
  author: string;
  text: string;
  date: string;
  rating: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  linkedin?: string;
  website?: string;
}

interface RichProfileManagerProps {
  profileId: string;
  gallery: string[];
  testimonials: Testimonial[];
  faq: FAQItem[];
  socialLinks: SocialLinks;
  onUpdate: () => void;
}

export function RichProfileManager({
  profileId,
  gallery,
  testimonials,
  faq,
  socialLinks,
  onUpdate,
}: RichProfileManagerProps) {
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({
    author: '',
    text: '',
    date: new Date().toISOString().split('T')[0],
    rating: 5,
  });
  const [newFaq, setNewFaq] = useState<FAQItem>({ question: '', answer: '' });
  const [links, setLinks] = useState<SocialLinks>(socialLinks || {});

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast.error('Digite a URL da imagem');
      return;
    }

    setSaving(true);
    const updatedGallery = [...gallery, newImageUrl];
    
    const { error } = await supabase
      .from('profiles')
      .update({ gallery: updatedGallery } as any)
      .eq('id', profileId);

    if (error) {
      logger.error('Error adding image to gallery', { context: 'RichProfileManager', metadata: { error } });
      toast.error('Erro ao adicionar imagem');
    } else {
      toast.success('Imagem adicionada!');
      setNewImageUrl('');
      onUpdate();
    }
    setSaving(false);
  };

  const handleRemoveImage = async (index: number) => {
    setSaving(true);
    const updatedGallery = gallery.filter((_, i) => i !== index);
    
    const { error } = await supabase
      .from('profiles')
      .update({ gallery: updatedGallery } as any)
      .eq('id', profileId);

    if (error) {
      logger.error('Error removing image from gallery', { context: 'RichProfileManager', metadata: { error } });
      toast.error('Erro ao remover imagem');
    } else {
      toast.success('Imagem removida!');
      onUpdate();
    }
    setSaving(false);
  };

  const handleAddTestimonial = async () => {
    if (!newTestimonial.author.trim() || !newTestimonial.text.trim()) {
      toast.error('Preencha autor e texto do depoimento');
      return;
    }

    setSaving(true);
    const updatedTestimonials = [...testimonials, newTestimonial];
    
    const { error } = await supabase
      .from('profiles')
      .update({ testimonials: updatedTestimonials } as any)
      .eq('id', profileId);

    if (error) {
      logger.error('Error adding testimonial', { context: 'RichProfileManager', metadata: { error } });
      toast.error('Erro ao adicionar depoimento');
    } else {
      toast.success('Depoimento adicionado!');
      setNewTestimonial({
        author: '',
        text: '',
        date: new Date().toISOString().split('T')[0],
        rating: 5,
      });
      onUpdate();
    }
    setSaving(false);
  };

  const handleRemoveTestimonial = async (index: number) => {
    setSaving(true);
    const updatedTestimonials = testimonials.filter((_, i) => i !== index);
    
    const { error } = await supabase
      .from('profiles')
      .update({ testimonials: updatedTestimonials } as any)
      .eq('id', profileId);

    if (error) {
      logger.error('Error removing testimonial', { context: 'RichProfileManager', metadata: { error } });
      toast.error('Erro ao remover depoimento');
    } else {
      toast.success('Depoimento removido!');
      onUpdate();
    }
    setSaving(false);
  };

  const handleAddFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error('Preencha pergunta e resposta');
      return;
    }

    setSaving(true);
    const updatedFaq = [...faq, newFaq];
    
    const { error } = await supabase
      .from('profiles')
      .update({ faq: updatedFaq } as any)
      .eq('id', profileId);

    if (error) {
      logger.error('Error adding FAQ', { context: 'RichProfileManager', metadata: { error } });
      toast.error('Erro ao adicionar FAQ');
    } else {
      toast.success('FAQ adicionada!');
      setNewFaq({ question: '', answer: '' });
      onUpdate();
    }
    setSaving(false);
  };

  const handleRemoveFaq = async (index: number) => {
    setSaving(true);
    const updatedFaq = faq.filter((_, i) => i !== index);
    
    const { error } = await supabase
      .from('profiles')
      .update({ faq: updatedFaq } as any)
      .eq('id', profileId);

    if (error) {
      logger.error('Error removing FAQ', { context: 'RichProfileManager', metadata: { error } });
      toast.error('Erro ao remover FAQ');
    } else {
      toast.success('FAQ removida!');
      onUpdate();
    }
    setSaving(false);
  };

  const handleSaveSocialLinks = async () => {
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ social_links: links } as any)
      .eq('id', profileId);

    if (error) {
      logger.error('Error saving social links', { context: 'RichProfileManager', metadata: { error } });
      toast.error('Erro ao salvar links sociais');
    } else {
      toast.success('Links sociais salvos!');
      onUpdate();
    }
    setSaving(false);
  };

  return (
    <Tabs defaultValue="gallery" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="gallery">
          <Image className="w-4 h-4 mr-2" />
          Galeria
        </TabsTrigger>
        <TabsTrigger value="testimonials">
          <MessageCircle className="w-4 h-4 mr-2" />
          Depoimentos
        </TabsTrigger>
        <TabsTrigger value="faq">
          <HelpCircle className="w-4 h-4 mr-2" />
          FAQ
        </TabsTrigger>
        <TabsTrigger value="social">
          <Instagram className="w-4 h-4 mr-2" />
          Redes Sociais
        </TabsTrigger>
      </TabsList>

      {/* Gallery Tab */}
      <TabsContent value="gallery" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Galeria de Imagens</CardTitle>
            <CardDescription>Adicione fotos do seu trabalho ao perfil público</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="URL da imagem (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <Button onClick={handleAddImage} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                    disabled={saving}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {gallery.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma imagem na galeria</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Testimonials Tab */}
      <TabsContent value="testimonials" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Depoimentos de Clientes</CardTitle>
            <CardDescription>Adicione avaliações positivas ao seu perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="testimonial-author">Nome do cliente</Label>
                <Input
                  id="testimonial-author"
                  placeholder="João Silva"
                  value={newTestimonial.author}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, author: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testimonial-text">Depoimento</Label>
                <Textarea
                  id="testimonial-text"
                  placeholder="Excelente profissional, recomendo!"
                  value={newTestimonial.text}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testimonial-rating">Avaliação</Label>
                  <Input
                    id="testimonial-rating"
                    type="number"
                    min="1"
                    max="5"
                    value={newTestimonial.rating}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
                    className="w-20"
                  />
                </div>
                <Button onClick={handleAddTestimonial} disabled={saving} className="mt-6">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Adicionar</>}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveTestimonial(index)}
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {testimonials.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum depoimento adicionado</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* FAQ Tab */}
      <TabsContent value="faq" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes (FAQ)</CardTitle>
            <CardDescription>Responda dúvidas comuns dos seus clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="faq-question">Pergunta</Label>
                <Input
                  id="faq-question"
                  placeholder="Ex: Qual o tempo de duração do serviço?"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faq-answer">Resposta</Label>
                <Textarea
                  id="faq-answer"
                  placeholder="O serviço tem duração média de 1 hora..."
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleAddFaq} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Adicionar FAQ</>}
              </Button>
            </div>

            <div className="space-y-3">
              {faq.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-semibold mb-2">{item.question}</p>
                        <p className="text-sm text-muted-foreground">{item.answer}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveFaq(index)}
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {faq.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma FAQ adicionada</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Social Links Tab */}
      <TabsContent value="social" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Links de Redes Sociais</CardTitle>
            <CardDescription>Adicione seus perfis nas redes sociais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/seu.perfil"
                  value={links.instagram || ''}
                  onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" /> Facebook
                </Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/seu.perfil"
                  value={links.facebook || ''}
                  onChange={(e) => setLinks({ ...links, facebook: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/seu.perfil"
                  value={links.linkedin || ''}
                  onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site / Portfólio</Label>
                <Input
                  id="website"
                  placeholder="https://seussite.com.br"
                  value={links.website || ''}
                  onChange={(e) => setLinks({ ...links, website: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleSaveSocialLinks} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Links Sociais'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

