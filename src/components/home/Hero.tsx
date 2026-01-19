'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-[90vh] bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Radial Gradients for Depth */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-emerald-100/40 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-indigo-100/30 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/20 shadow-sm">
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                A plataforma nº 1 para clínicas e barbearias
              </span>
            </div>
          </motion.div>

          {/* H1 - Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-snug md:leading-tight max-w-6xl"
          >
            <span className="bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-slate-100 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent whitespace-normal break-words">
              Seu sistema de agendamento <br className="hidden lg:block" />24/7 que nunca dorme
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed"
          >
            Deixe seus clientes agendarem online 24/7. Sistema completo para barbearias, clínicas e profissionais autônomos.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4"
          >
            {/* Primary CTA */}
            <Button
              onClick={() => router.push('/auth')}
              size="lg"
              className="group relative px-8 py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-300/50 dark:hover:shadow-emerald-800/40 text-lg font-semibold"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-slate-500 dark:text-slate-400"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>3 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Sem cartão de crédito</span>
            </div>
          </motion.div>

          {/* Browser Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5, type: "spring", bounce: 0.3 }}
            className="mt-16 w-full max-w-6xl perspective-1000"
          >
            <div className="relative transform hover:scale-[1.02] transition-transform duration-500">
              {/* Browser Chrome */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 dark:text-slate-500">
                      AgendaFlow.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard Preview */}
                <div className="relative w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
                  <img 
                    src="/assets/hero-section.png" 
                    alt="Dashboard AgendaFlow" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-contain"
                  />
                  {/* Overlay Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent dark:from-slate-900/30 pointer-events-none" />
                </div>
              </div>

              {/* Floating Elements for Extra Depth */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

