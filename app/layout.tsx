'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import GettingStartedAssistant from '@/components/GettingStartedAssistant';
import GettingStartedAssistantFloating from '@/components/GettingStartedAssistantFloating';
import "./globals.css";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>AgendaFlow - Your Schedule Perfected</title>
        <meta name="description" content="Sistema completo de agendamento online para profissionais. Gerencie clientes, horários e serviços em um só lugar." />
        <link rel="icon" type="image/png" href="/assets/brand-icon.png" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <AuthProvider>
                <Toaster />
                <Sonner />
                {children}
                <GettingStartedAssistant />
                <GettingStartedAssistantFloating />
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
