'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Header from '@/components/home/Header';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Search, Loader2, ArrowRight, Filter, MoreHorizontal } from 'lucide-react';
import { BUSINESS_CATEGORIES, getCategoryLabel } from '@/lib/categories';

interface FeedPost {
  id: string;
  professional_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
  professional: {
    id: string;
    name: string;
    category: string | null;
    city: string | null;
    state: string | null;
    avatar_url: string | null;
  };
}

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    // Fetch active posts from professional subscribers
    const { data, error } = await supabase
      .from('feed_posts')
      .select(`
        id,
        professional_id,
        title,
        description,
        image_url,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // Fetch professional data for each post - exclude basic plan (only professional tier)
    const professionalIds = data.map(p => p.professional_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, category, city, state, avatar_url, subscription_status, subscription_tier')
      .in('id', professionalIds)
      .eq('subscription_status', 'active')
      .eq('subscription_tier', 'professional');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoading(false);
      return;
    }

    // Combine posts with professional data
    const postsWithProfiles = data
      .map(post => {
        const professional = profiles?.find(p => p.id === post.professional_id);
        if (!professional) return null;
        return {
          ...post,
          professional: {
            id: professional.id,
            name: professional.name,
            category: professional.category,
            city: professional.city,
            state: professional.state,
            avatar_url: professional.avatar_url,
          },
        };
      })
      .filter(Boolean) as FeedPost[];

    setPosts(postsWithProfiles);

    // Extract unique cities for filter
    const cities = [...new Set(postsWithProfiles.map(p => p.professional.city).filter(Boolean))] as string[];
    setAvailableCities(cities.sort());

    setLoading(false);
  };

  const filteredPosts = posts.filter(post => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchLower) ||
      post.description?.toLowerCase().includes(searchLower) ||
      post.professional.name.toLowerCase().includes(searchLower) ||
      post.professional.city?.toLowerCase().includes(searchLower);

    const matchesCategory =
      categoryFilter === 'all' || post.professional.category === categoryFilter;

    const matchesCity =
      cityFilter === 'all' || post.professional.city === cityFilter;

    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Encontre o serviço ideal</h1>
          <p className="text-muted-foreground mb-6">
            Explore nossos profissionais e agende online
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, nome ou cidade..."
                className="pl-10 h-12"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px] h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todas categorias</SelectItem>
                {BUSINESS_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* City Filter */}
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-12">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todas cidades</SelectItem>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="flex flex-col items-center gap-8 w-full">
            {filteredPosts.map((post) => (
              <article key={post.id} className="w-full max-w-3xl">
                <Card className="overflow-hidden shadow-lg">
                  {/* Image / Media (full, centered, show entire image) */}
                  <div className="w-full bg-black flex items-center justify-center">
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} className="w-full max-h-[90vh] object-contain" />
                    ) : (
                      <div className="w-full h-[320px] flex items-center justify-center bg-primary/10">
                          <Avatar className="w-28 h-28">
                            <AvatarImage src={post.professional.avatar_url || undefined} alt={post.professional.name} />
                            <AvatarFallback className="text-6xl font-bold text-primary">
                              {post.professional.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                      </div>
                    )}
                  </div>

                  {/* Professional header and meta BELOW the image (Instagram-like) */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/p/${post.professional.id}`} className="flex items-center gap-3">
                        <Avatar className="w-11 h-11">
                          <AvatarImage src={post.professional.avatar_url || undefined} alt={post.professional.name} />
                          <AvatarFallback className="text-sm font-bold gradient-primary text-white">
                            {post.professional.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm text-foreground">
                          <div className="font-semibold">{post.professional.name}</div>
                          <div className="text-xs text-muted-foreground">{post.professional.city ? `${post.professional.city}` : ''}</div>
                        </div>
                      </Link>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="text-xs">{post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>

                  <CardContent className="py-4">
                    {/* Optional compact actions and collapsed description */}
                    <div className="flex items-center justify-end mb-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="gradient-primary" onClick={() => window.location.href = `/p/${post.professional.id}`}>
                          Agende agora
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <MoreHorizontal className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </div>

                    {post.title && <h2 className="text-lg font-semibold mb-2">{post.title}</h2>}
                    {post.professional.category && (
                      <Badge className="mb-3">{getCategoryLabel(post.professional.category)}</Badge>
                    )}

                    {post.description && (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{post.description}</p>
                    )}
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground">
                {search || categoryFilter !== 'all' || cityFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Ainda não há profissionais com posts ativos'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}



