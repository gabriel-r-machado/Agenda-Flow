'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: Users,
    number: '5.000+',
    label: 'Profissionais',
    description: 'Estimativa interna'
  },
  {
    icon: Calendar,
    number: '150.000+',
    label: 'Agendamentos/Mês',
    description: 'Estimativa interna'
  },
  {
    icon: TrendingUp,
    number: '87%',
    label: 'Redução de Faltas',
    description: 'Em casos selecionados; resultados individuais variam'
  }
];

export default function Stats() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 shadow-sm">Confiado por Profissionais</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Números que Falam
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AgendaFlow é a escolha de profissionais que querem simplificar seus agendamentos.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.number}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all duration-300 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>

                  {/* Number */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                    className="text-4xl md:text-5xl font-bold text-primary mb-2"
                  >
                    {stat.number}
                  </motion.div>

                  {/* Label */}
                  <p className="font-semibold text-foreground mb-2">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Small footnote about estimates */}
        <div className="text-xs text-muted-foreground text-center mb-6">
          Estimativas internas; resultados individuais podem variar.
        </div>

        {/* Trust Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-8 text-center"
        >
          <p className="text-muted-foreground max-w-2xl mx-auto">
            <span className="font-semibold text-foreground">Segurança Garantida:</span> Seus dados estão protegidos com encriptação de nível bancário. 
            Conforme LGPD e padrões internacionais de privacidade.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

