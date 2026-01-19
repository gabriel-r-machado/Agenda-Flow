'use client';

import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    title: 'Agendamento 24/7',
    description: 'Seus clientes agendam online a qualquer hora, mesmo quando você está ocupado.'
  },
  {
    title: 'Gestão de Clientes',
    description: 'Armazene dados e preferências dos seus clientes em um só lugar.'
  },
  {
    title: 'Página Profissional',
    description: 'Tenha sua própria página para compartilhar com clientes.'
  },
  {
    title: 'Fácil de Usar',
    description: 'Interface simples e intuitiva. Configure em minutos.'
  },
  {
    title: 'Controle Total',
    description: 'Gerencie horários, serviços e agendamentos em um lugar.'
  },
  {
    title: '3 Dias Grátis',
    description: 'Experimente todas as funcionalidades sem compromisso.'
  }
];

export default function Features() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"]
  });

  // Parallax effects for features mockup (inverted direction from hero)
  const featuresMockupY = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const featuresMockupRotate = useTransform(scrollYProgress, [0, 1], [-10, -25]);
  const featuresMockupScale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const featuresMockupOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.8]);

  return (
    <div ref={featuresRef} className="w-full py-20 lg:py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 py-20 lg:py-40 flex-col items-start relative z-10 lg:ml-auto lg:max-w-2xl">
          <div>
            <Badge className="shadow-sm">Recursos</Badge>
          </div>
          <div className="flex gap-2 flex-col text-left">
            <h2 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-bold">
              Tudo que você precisa
            </h2>
            <p className="text-lg max-w-xl leading-relaxed tracking-tight text-muted-foreground">
              Gerencie seus agendamentos e seus clientes de forma simples, fácil e profissional.
            </p>
          </div>
          <div className="flex gap-10 pt-12 flex-col w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-row gap-6 w-full items-start justify-start">
                  <Check className="w-4 h-4 mt-2 text-primary flex-shrink-0" />
                  <div className="flex flex-col gap-1 text-left">
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Left-side mockup image (visible only on lg+) with scroll effects */}
      <motion.div
        className="hidden lg:block absolute top-1/2 z-0 pointer-events-none -translate-y-1/2 transform lg:left-[-420px] xl:left-[-200px]"
        style={{
          y: featuresMockupY,
          rotate: featuresMockupRotate,
          scale: featuresMockupScale,
          opacity: featuresMockupOpacity,
        }}
      >
        <motion.div
          className="overflow-hidden rounded-3xl shadow-2xl bg-white w-[480px] lg:w-[720px] xl:w-[920px] h-[320px] lg:h-[480px] xl:h-[620px]"
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <img
            src="/assets/screenshot-clients-detail.png"
            alt="Clientes mockup"
            className="w-full h-full object-cover block"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

