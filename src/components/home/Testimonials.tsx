"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    text: "Economizei 2 horas por dia parando de responder WhatsApp pra marcar horário. Agora meus clientes agendam sozinhos e eu foco no atendimento.",
    name: "Rafael Costa",
    role: "Barbearia Elite - SP",
    image: "https://plus.unsplash.com/premium_photo-1678197937465-bdbc4ed95815?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    text: "Agora tenho controle total da minha agenda. Meus clientes amam poder agendar a hora que quiserem sem precisar me ligar. Isso aumentou minhas reservas em 40%.",
    name: "Júlia Mendes",
    role: "Studio JM Estética",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    text: "Minha agenda lotou depois que coloquei o link no Instagram. Os clientes marcam até de madrugada. Faturei 35% a mais no primeiro mês.",
    name: "Carlos Ferreira",
    role: "Personal Trainer",
    image: "https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    text: "O sistema agiliza agendamentos, confirmações e lembretes, mas ainda contamos com uma pessoa na recepção para revisar e ajustar casos específicos. Ainda assim reduzi custos em R$ 2.500 por mês.",
    name: "Dra. Sofia Almeida",
    role: "Clínica Odontológica",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=761&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    text: "Fechei 12 clientes novos só porque tenho um link profissional de agendamento. Parece que tenho uma empresa grande, mas sou autônomo.",
    name: "Leonardo Santos",
    role: "Consultor de Marketing",
    image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=40&h=40&fit=crop"
  },
  {
    text: "Deixei de usar 3 apps diferentes (agenda, WhatsApp Business e planilha). Agora é tudo em um lugar. Minha vida ficou muito mais simples.",
    name: "Amanda Oliveira",
    role: "Manicure e Designer de Sobrancelhas",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
];

const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background items-center md:items-start"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  className="p-6 rounded-2xl border border-border shadow-md hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all max-w-xs w-full bg-card"
                >
                  <div className="text-sm leading-relaxed text-foreground mb-4">
                    "{text}"
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="font-semibold text-sm tracking-tight">{name}</div>
                      <div className="text-xs opacity-70 tracking-tight">{role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

export default function Testimonials() {
  return (
    <section className="w-full py-20 lg:py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col gap-4 items-center text-center relative z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 shadow-sm">
                Depoimentos
              </Badge>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex gap-2 flex-col items-center"
            >
              <h2 className="text-4xl md:text-5xl tracking-tighter font-bold">
                Dezenas de clientes com resultados
              </h2>
              <p className="text-lg max-w-2xl leading-relaxed tracking-tight text-muted-foreground">
                Veja o que nossos clientes estão dizendo sobre o AgendaFlow.
              </p>
            </motion.div>
          </div>

          {/* Testimonials Grid with Columns */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full overflow-hidden flex justify-center"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min max-w-sm md:max-w-none">
              {/* Column 1 */}
              <TestimonialsColumn
                className="h-[33rem] overflow-hidden"
                testimonials={testimonials}
                duration={15}
              />

              {/* Column 2 */}
              <TestimonialsColumn
                className="hidden md:block h-[33rem] overflow-hidden"
                testimonials={testimonials.slice().reverse()}
                duration={18}
              />

              {/* Column 3 */}
              <TestimonialsColumn
                className="hidden lg:block h-[33rem] overflow-hidden"
                testimonials={testimonials}
                duration={20}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Top & bottom mist overlays */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-24 z-40 bg-gradient-to-b from-background/95 to-transparent backdrop-blur-sm" />
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-24 z-40 bg-gradient-to-t from-background/95 to-transparent backdrop-blur-sm" />
    </section>
  );
}
