'use client';

import { Check, X, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const comparisons = [
  {
    feature: 'Agendamento 24/7',
    AgendaFlowText: 'Sempre disponível',
    whatsappText: 'Só quando você responde'
  },
  {
    feature: 'Histórico de Agendamentos',
    AgendaFlowText: 'Tudo salvo e organizado',
    whatsappText: 'Conversas perdidas'
  },
  {
    feature: 'Visualização de Agenda',
    AgendaFlowText: 'Calendário visual e claro',
    whatsappText: 'Confuso e desorganizado'
  },
  {
    feature: 'Tempo gasto por dia',
    AgendaFlowText: '0 min',
    whatsappText: '~2 horas',
    highlight: true
  }
];

export default function Comparison() {
  return (
    <div className="w-full py-20 lg:py-40 bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 flex-col items-center">
          <div>
            <Badge className="bg-white dark:bg-slate-800 shadow-sm">
              Comparativo
            </Badge>
          </div>
          <div className="flex gap-2 flex-col text-center">
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-2xl font-bold">
              Por que o AgendaFlow é a escolha inteligente, comparação com WhatsApp
            </h2>
            <p className="text-lg max-w-2xl leading-relaxed tracking-tight text-muted-foreground">
              Pare de perder tempo com WhatsApp e anotações. Veja a diferença:
            </p>
          </div>
          
          <div className="w-full max-w-6xl mt-12 opacity-100 pointer-events-auto">
            {/* Mobile: stacked per-feature comparison cards */}
            <div className="block md:hidden space-y-6">
              {comparisons.map((item, index) => (
                <motion.div
                  key={`mobile-${item.feature}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  viewport={{ once: true }}
                  className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold">{item.feature}</div>
                    {item.highlight ? (
                      <Badge className="bg-primary text-primary-foreground px-2 py-0.5">Destaque</Badge>
                    ) : null}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10 rounded-lg flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
                      </div>
                      <div className="font-semibold text-sm">{item.AgendaFlowText}</div>
                    </div>

                    <div className="flex-1 p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <X className="w-5 h-5 text-muted-foreground/60" />
                      </div>
                      <div className="text-sm text-muted-foreground/80">{item.whatsappText}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop / larger: original grid layout (hidden on small) */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 lg:gap-8">
              {/* Features Column */}
              <div className="space-y-4">
                <div className="h-32 flex items-center justify-center text-sm font-semibold text-muted-foreground md:justify-start md:pl-6">
                  Funcionalidade
                </div>
                {comparisons.map((item, index) => (
                  <motion.div
                    key={item.feature}
                    initial={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.01 }}
                    className={`flex items-center h-20 px-6 font-semibold text-sm md:text-base ${
                      item.highlight ? 'text-primary' : ''
                    }`}
                  >
                    {item.feature}
                  </motion.div>
                ))}
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WINNER CARD - AgendaFlow */}
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.01 }}
                  className="relative"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground shadow-lg gap-1 px-3 py-1">
                      <Crown className="w-3 h-3" />
                      Recomendado
                    </Badge>
                  </div>
                  
                  <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
                      <h3 className="text-2xl font-bold text-primary mb-1">AgendaFlow</h3>
                      <p className="text-xs text-muted-foreground">Sua melhor escolha</p>
                    </div>
                    
                    {/* Features */}
                    <div className="p-6 space-y-3">
                          {comparisons.map((item, index) => (
                            <motion.div
                              key={`plus-${index}`}
                              initial={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.01 }}
                              className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg h-20"
                            >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600 dark:text-green-500 stroke-[3]" />
                          </div>
                          <span className={`font-semibold ${
                            item.highlight 
                              ? 'text-primary text-xl' 
                              : 'text-foreground text-sm'
                          }`}>
                            {item.AgendaFlowText}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* LOSER CARD - WhatsApp/Manual */}
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.01 }}
                  className="relative mt-8 sm:mt-0"
                >
                  <div className="h-full rounded-2xl overflow-hidden opacity-75">
                    {/* Header */}
                    <div className="bg-transparent p-6 text-center">
                      <h3 className="text-xl font-semibold text-muted-foreground mb-1">
                        WhatsApp / Papel
                      </h3>
                      <p className="text-xs text-muted-foreground/60">Jeito antigo</p>
                    </div>
                    
                    {/* Features */}
                    <div className="p-6 space-y-3">
                      {comparisons.map((item, index) => (
                        <motion.div
                          key={`whatsapp-${index}`}
                          initial={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.01 }}
                          className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg h-20"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <X className="w-5 h-5 text-muted-foreground/60 stroke-[2.5]" />
                          </div>
                          <span className={`text-muted-foreground/80 ${
                            item.highlight 
                              ? 'text-lg font-semibold text-red-600 dark:text-red-500' 
                              : 'text-sm'
                          }`}>
                            {item.whatsappText}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="mt-12 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
              <div className="relative text-center p-8 md:p-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl">
                <div className="inline-flex items-center gap-2 mb-4">
                  <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Resultado
                  </p>
                </div>
                <h3 className="text-2xl md:text-4xl font-bold mb-3">
                  Economize até <span className="text-primary">2 horas por dia</span>
                </h3>
                <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                  Deixe o AgendaFlow cuidar dos seus agendamentos automaticamente enquanto você foca no que realmente importa: seus clientes
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
