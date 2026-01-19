"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

type Plan = "monthly" | "annually";

type PLAN = {
    id: string;
    title: string;
    desc: string;
    monthlyPrice: number;
    annuallyPrice: number;
    badge?: string;
    buttonText: string;
    features: string[];
    link: string;
};

export const PLANS: PLAN[] = [
  {
    id: "basic",
    title: "Básico",
    desc: "Ideal para quem está começando a organizar seus agendamentos.",
    monthlyPrice: 14.90,
    annuallyPrice: 149.00,
    buttonText: "COMEÇAR TESTE GRÁTIS",
    features: [
      "Agendamentos ilimitados",
      "Gestão de clientes",
      "Gestão de serviços",
      "Página de agendamento",
      "Lembretes internos"
    ],
    link: "/auth"
  },
  {
    id: "professional",
    title: "Profissional",
    desc: "Liberdade total para crescer sem limites nos seus agendamentos.",
    monthlyPrice: 21.90,
    annuallyPrice: 219.00,
    badge: "Mais popular",
    buttonText: "COMEÇAR TESTE GRÁTIS",
    features: [
      "Tudo do Básico",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
    link: "/auth"
  },
];

export default function Pricing() {
  const [billPlan, setBillPlan] = useState<Plan>("monthly");

  const handleSwitch = () => {
    setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
  };

  return (
    <section className="w-full py-20 lg:py-40 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-8 mb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 shadow-sm">
              Planos
            </Badge>
          </motion.div>

          {/* Title and Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 items-center max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold">
              Planos para todos os tamanhos
            </h2>
            <p className="text-lg max-w-2xl leading-relaxed tracking-tight text-muted-foreground">
              Escolha o plano ideal para o seu negócio e comece a transformar seus agendamentos.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mt-4"
          >
            <span className={cn("text-sm font-medium transition-colors", billPlan === "monthly" ? "text-foreground" : "text-muted-foreground")}>
              Mensal
            </span>
            <button 
              onClick={handleSwitch} 
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-emerald-600 transition-colors hover:bg-emerald-700 focus:outline-none"
            >
              <motion.div
                className="h-6 w-6 rounded-full bg-white shadow-md"
                animate={{ x: billPlan === "annually" ? 28 : 2 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </button>
            <span className={cn("text-sm font-medium transition-colors", billPlan === "annually" ? "text-foreground" : "text-muted-foreground")}>
              Anual
            </span>
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid w-full grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} billPlan={billPlan} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const PlanCard = ({ plan, billPlan }: { plan: PLAN, billPlan: Plan }) => {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={cn(
        "flex flex-col relative rounded-2xl transition-all items-start w-full border overflow-hidden h-full",
        plan.id === "professional" 
          ? "border-emerald-500 bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20 dark:to-background shadow-lg shadow-emerald-200/20 dark:shadow-emerald-950/20" 
          : "border-border bg-card hover:border-emerald-200 dark:hover:border-emerald-800 shadow-md"
      )}
    >
      {plan.id === "professional" && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
      )}

      <div className="flex flex-col items-start w-full p-6 md:p-8 relative">
        {/* Header with Badge */}
        <div className="flex items-start justify-between w-full mb-6">
          <h3 className="font-bold text-2xl text-foreground">
            {plan.title}
          </h3>
          {plan.badge && (
            <Badge className="bg-emerald-500 text-white dark:bg-emerald-600 shrink-0 ml-2">
              {plan.badge}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="w-full mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={billPlan}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-4xl md:text-5xl font-extrabold">
                <NumberFlow
                  value={billPlan === "monthly" ? plan.monthlyPrice : plan.annuallyPrice}
                  suffix={billPlan === "monthly" ? "/mês" : "/ano"}
                  format={{
                    currency: "BRL",
                    style: "currency",
                    currencySign: "standard",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    currencyDisplay: "symbol"
                  }}
                />
              </h4>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Description */}
        <p className="text-sm md:text-base text-muted-foreground mb-6">
          {plan.desc}
        </p>
      </div>

      {/* CTA Button */}
      <div className="flex flex-col items-start w-full px-6 md:px-8 mb-6">
        <Link href={plan.link} className="w-full">
          <Button 
            size="lg" 
            className={cn(
              "w-full transition-all duration-300",
              plan.id === "professional"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/30 dark:shadow-emerald-900/30"
                : "bg-foreground text-background hover:bg-foreground/90"
            )}
          >
            {plan.buttonText}
          </Button>
        </Link>
        <AnimatePresence mode="wait">
          <motion.div
            key={billPlan}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full text-center"
          >
            <p className="text-xs md:text-sm text-muted-foreground mt-3">
              {billPlan === "monthly" ? 
                'Cancele a qualquer momento' :
                'Observação: não oferecemos plano anual — o valor exibido é apenas para referência; cobramos mensalmente.'
              }
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Features List */}
      <div className="flex flex-col items-start w-full px-6 md:px-8 pb-6">
        <h5 className="text-sm font-semibold text-foreground mb-4">Inclui:</h5>
        <div className="flex flex-col gap-3 w-full">
          {plan.features.map((feature, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="flex items-start gap-3"
            >
              <CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground/80">{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
