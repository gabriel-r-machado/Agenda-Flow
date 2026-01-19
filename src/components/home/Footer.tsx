'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone, Github, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/assets/brand-logo-primary.png" alt="AgendaFlow" className="h-10 object-contain" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Simplifique seus agendamentos e foque no que importa: seus clientes.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://www.linkedin.com/in/gabrielmachado-se"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/gaahfrm"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Produto</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                  Depoimentos
                </a>
              </li>
              <li>
                <a href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Faça Login
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Serviço
                </Link>
              </li>
              <li>
                <a href="mailto:contato@AgendaFlow.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  Reportar Problema
                </a>
              </li>
              
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <a href="mailto:contato@AgendaFlow.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  contato@AgendaFlow.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Em breve</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} AgendaFlow. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacidade
            </a>
            <a href="/terms" className="hover:text-foreground transition-colors">
              Termos
            </a>
            <a href="mailto:contato@AgendaFlow.com" className="hover:text-foreground transition-colors">
              Suporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

