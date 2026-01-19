'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    question: 'Quanto custa AgendaFlow?',
    answer: 'AgendaFlow oferece um período de teste gratuito de 3 dias. Após isso, oferecemos planos mensais com diferentes funcionalidades. Consulte nossa página de Preços para mais detalhes.'
  },
  {
    question: 'Preciso de cartão de crédito para o teste gratuito?',
    answer: 'Não! Você pode experimentar completamente sem fornecer dados de cartão. Se quiser continuar após os 3 dias, aí sim você fornece seu cartão.'
  },
  {
    question: 'Como meus clientes agendam comigo?',
    answer: 'Seus clientes acessam sua página profissional (um link único) e veem seus horários disponíveis. Eles escolhem data, horário e preenchem seus dados. Você recebe confirmação automática.'
  },
  {
    question: 'Os clientes recebem confirmação do agendamento?',
    answer: 'Atualmente, os clientes não recebem confirmação automática por padrão; a pessoa responsável (ex.: recepção) pode confirmar ou cancelar agendamentos manualmente. Os clientes podem reagendar usando o mesmo link onde fizeram o agendamento, porém não podem cancelar pelo link.'
  },
  {
    question: 'Posso usar em múltiplos dispositivos?',
    answer: 'Sim! AgendaFlow funciona perfeitamente no celular, tablet e computador. Suas alterações sincronizam automaticamente entre dispositivos.'
  },
  {
    question: 'Como faço para cancelar minha assinatura?',
    answer: 'Você pode cancelar sua assinatura a qualquer momento em Configurações > Assinatura. Não há multa ou custo adicional. Seus dados são mantidos conforme nossa Política de Privacidade.'
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Absolutamente. Usamos encriptação de nível bancário (HTTPS/SSL), armazenamento seguro com Supabase, e seguimos rigorosamente a LGPD (Lei Geral de Proteção de Dados). Leia nossa Política de Privacidade para detalhes.'
  },
  {
    question: 'E se eu não souber como usar?',
    answer: 'Oferecemos suporte por email (contato@AgendaFlow.com) e documentação completa. Além disso, nossa interface é muito intuitiva e você consegue configurar tudo em menos de 10 minutos.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full py-20 lg:py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Badge className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 shadow-sm">
              Dúvidas
            </Badge>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Encontre respostas para as dúvidas mais comuns sobre AgendaFlow.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="border border-border rounded-lg overflow-hidden hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 bg-card hover:shadow-md"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
              >
                <span className="font-semibold text-foreground">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown className={`w-5 h-5 transition-colors ${openIndex === index ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                </motion.div>
              </button>

              {/* Answer */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-border"
              >
                <p className="px-6 py-4 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-900/20" />
          <div className="absolute inset-0 bg-grid-emerald/5 bg-[size:20px_20px]" />
          
          <div className="relative p-8 md:p-12 border border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl backdrop-blur-sm text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center mb-4"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20">
                <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-3"
            >
              Ainda tem dúvidas?
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-muted-foreground mb-6 max-w-lg mx-auto"
            >
              Estamos aqui para ajudar! Entre em contato conosco e responderemos suas dúvidas em até 24 horas.
            </motion.p>

            <motion.a
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              href="mailto:contato@AgendaFlow.com"
              className="inline-block"
            >
              <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-300/50 dark:hover:shadow-emerald-800/40">
                Enviar Email
              </Button>
            </motion.a>
            
            <p className="text-xs text-muted-foreground mt-4">
              contato@AgendaFlow.com
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

