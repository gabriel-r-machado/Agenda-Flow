"use client";

import * as React from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lock, TrendingUp, Users, Calendar } from "lucide-react";

interface Event {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<{ className: string }>;
}

interface CalendarData {
  day: Date;
  events: Event[];
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

// Dados dos stats em dias específicos do mês atual
const today = startOfToday();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const statsData: CalendarData[] = [
  {
    day: new Date(currentYear, currentMonth, 15),
    events: [
      {
        id: 1,
        name: "5.000+",
        description: "Profissionais Ativos",
        icon: Users,
      },
    ],
  },
  {
    day: new Date(currentYear, currentMonth, 25),
    events: [
      {
        id: 2,
        name: "150.000+",
        description: "Agendamentos/Mês",
        icon: Calendar,
      },
    ],
  },
  {
    day: new Date(currentYear, currentMonth, 8),
    events: [
      {
        id: 3,
        name: "87%",
        description: "Redução de Faltas",
        icon: TrendingUp,
      },
    ],
  },
];

export default function StatsCalendar() {
  const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });

  return (
    <section className="w-full py-20 lg:py-40 bg-background relative overflow-hidden" id="stats">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div className="mb-6">
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 shadow-sm">
              Estatísticas
            </Badge>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl tracking-tighter font-bold mb-4 text-foreground">
            Números que Impactam
          </h2>
          <p className="text-lg max-w-2xl leading-relaxed tracking-tight text-muted-foreground mx-auto">
            AgendaFlow entrega resultados reais para profissionais que querem crescer sem limite.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16"
        >
          {statsData.map((stat, idx) => {
            const event = stat.events[0];
            const IconComponent = event.icon;
            
            return (
              <motion.div
                key={event.id}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 shadow-md hover:shadow-lg">
                  <div className="flex flex-col items-start gap-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20">
                      <IconComponent className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-5xl font-bold bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
                        {event.name}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Calendar Grid - Premium Version */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg mb-12"
        >
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-border text-center text-xs md:text-sm font-semibold bg-muted/50">
            <div className="border-r border-border py-4 text-muted-foreground">Dom</div>
            <div className="border-r border-border py-4 text-muted-foreground">Seg</div>
            <div className="border-r border-border py-4 text-muted-foreground">Ter</div>
            <div className="border-r border-border py-4 text-muted-foreground">Qua</div>
            <div className="border-r border-border py-4 text-muted-foreground">Qui</div>
            <div className="border-r border-border py-4 text-muted-foreground">Sex</div>
            <div className="py-4 text-muted-foreground">Sáb</div>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, dayIdx) => {
              const hasEvent = statsData.some((data) => isSameDay(data.day, day));
              const eventData = statsData.find((data) => isSameDay(data.day, day));
              const isCurrentMonth = isSameMonth(day, firstDayCurrentMonth);

              // No mobile, esconde dias de outros meses
              if (!isCurrentMonth) {
                return (
                  <div
                    key={dayIdx}
                    className="hidden md:block relative min-h-[120px] border-r border-b border-border last:border-r-0 p-3 bg-muted/30 text-muted-foreground"
                  >
                    <div className="h-full flex flex-col">
                      <time
                        dateTime={format(day, "yyyy-MM-dd")}
                        className="text-sm text-slate-400"
                      >
                        {format(day, "d")}
                      </time>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    "relative min-h-[80px] md:min-h-[140px] border-r border-b border-border last:border-r-0 p-2 md:p-3 bg-card",
                    hasEvent && "col-span-2 md:col-span-1",
                  )}
                >
                  <div className="h-full flex flex-col">
                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      className={cn(
                        "text-xs md:text-sm font-semibold",
                        isToday(day) &&
                          "w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold",
                        !isToday(day) &&
                          isSameMonth(day, firstDayCurrentMonth) &&
                          "text-foreground",
                        !isSameMonth(day, firstDayCurrentMonth) && "text-muted-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </time>

                    {hasEvent && eventData && (
                      <div className="mt-2 flex-1 flex flex-col justify-center">
                        {eventData.events.map((event) => {
                          const IconComponent = event.icon;
                          return (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.05 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                              className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-900/40 dark:to-emerald-800/30 border border-emerald-200/60 dark:border-emerald-700/40 p-2 md:p-3 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-emerald-300/80"
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                              </div>
                              <div className="text-xs md:text-sm font-bold text-emerald-700 dark:text-emerald-300 leading-tight tracking-tight">
                                {event.name}
                              </div>
                              <div className="text-[10px] md:text-[11px] text-emerald-600/70 dark:text-emerald-400/60 leading-tight">
                                {event.description}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Security Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center backdrop-blur-sm"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Segurança Garantida:</span> Dados protegidos com encriptação bancária. LGPD compliant.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
