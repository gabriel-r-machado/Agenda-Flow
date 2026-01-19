'use client';

import Timeline from './Timeline';
import { UserPlus, Settings, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const timelineData = [
  {
    title: "Passo 1",
    content: (
      <div className="text-sm md:text-base text-muted-foreground space-y-4">
        <div className="flex items-start gap-4">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center flex-shrink-0 border border-emerald-200/50 dark:border-emerald-700/50"
          >
            <UserPlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 tracking-tight">
              Crie sua Conta
            </h3>
            <p className="leading-relaxed">
              Registre-se em segundos. <strong>Sem necessidade de cartão de crédito. Experimente gratuitamente por 3 dias.</strong>
            </p>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/40 dark:border-emerald-700/30 text-sm backdrop-blur-sm"
        >
          <p className="text-emerald-700 dark:text-emerald-300 font-semibold">✓ Registro instantâneo</p>
        </motion.div>
      </div>
    ),
  },
  {
    title: "Passo 2",
    content: (
      <div className="text-sm md:text-base text-muted-foreground space-y-4">
        <div className="flex items-start gap-4">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 flex items-center justify-center flex-shrink-0 border border-indigo-200/50 dark:border-indigo-700/50"
          >
            <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 tracking-tight">
              Configure Seus Horários
            </h3>
            <p className="leading-relaxed">
              Defina sua disponibilidade, serviços e preços. Pode ser 
              alterado a qualquer momento.
            </p>
          </div>
        </div>
        <motion.ul 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-2 text-sm"
        >
          <li className="flex items-center gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">→</span> Múltiplos calendários
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">→</span> Bloqueio de datas
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">→</span> Preços personalizados
          </li>
        </motion.ul>
      </div>
    ),
  },
  {
    title: "Passo 3",
    content: (
      <div className="text-sm md:text-base text-muted-foreground space-y-4">
        <div className="flex items-start gap-4">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 flex items-center justify-center flex-shrink-0 border border-purple-200/50 dark:border-purple-700/50"
          >
            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 tracking-tight">
              Comece a Receber Agendamentos
            </h3>
            <p className="leading-relaxed">
              Compartilhe seu link. Clientes agendarão 24/7. 
              Você gerencia tudo em um só lugar.
            </p>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-2 gap-3 text-xs"
        >
          <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200/40 dark:border-purple-700/30 backdrop-blur-sm">
            <p className="font-semibold text-purple-700 dark:text-purple-300">24/7</p>
            <p className="text-muted-foreground">Disponível</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200/40 dark:border-purple-700/30 backdrop-blur-sm">
            <p className="font-semibold text-purple-700 dark:text-purple-300">🔔</p>
            <p className="text-muted-foreground">Lembretes</p>
          </div>
        </motion.div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-10 lg:py-20 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-950/50 dark:to-slate-900/30 overflow-hidden" id="how">
      {/* Subtle Grid Background - Nearly Imperceptible */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 dark:opacity-20 pointer-events-none" />
      
      {/* Decorative Gradient Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-emerald-100/20 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-indigo-100/20 to-transparent rounded-full blur-3xl -z-10" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-10 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-4 text-foreground">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-slate-100 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent">
              Começar é Simples
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Em apenas 3 passos você estará pronto para receber agendamentos online.
          </p>
        </motion.div>
      </div>

      <Timeline data={timelineData} />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-10 mt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Pronto para começar? Experimente agora mesmo sem compromisso.
          </p>
          <motion.a 
            href="/auth"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all duration-300 border border-emerald-500/50"
          >
            Comece Gratuitamente
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

