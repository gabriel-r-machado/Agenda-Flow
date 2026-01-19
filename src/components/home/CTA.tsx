'use client';

import { useRouter } from 'next/navigation';
import { CtaCard } from '@/components/ui/cta-card';

export default function CTA() {
  const router = useRouter();

  return (
    <section className="py-20 lg:py-28" id="cta">
      <div className="max-w-6xl mx-auto px-4">
        <CtaCard
          imageSrc="/assets/hero-section.png"
          imageAlt="Dashboard do AgendaFlow"
          title="Comece Hoje Mesmo"
          subtitle={<>Pronto para simplificar <span className="text-primary">sua agenda?</span></>}
          description="Junte-se a milhares de profissionais que já usam o AgendaFlow para economizar tempo, reduzir faltas e oferecer a melhor experiência aos seus clientes."
          buttonText="Começar Gratuitamente"
          onButtonClick={() => router.push('/auth')}
        />
      </div>
    </section>
  );
}

