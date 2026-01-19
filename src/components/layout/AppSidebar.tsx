'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePlanAccess } from '@/components/PlanRestriction';
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarContent,
  useSidebarAnimated,
} from '@/components/ui/animated-sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  Crown,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const mainMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: <Calendar className="w-5 h-5" strokeWidth={1.5} /> },
  { title: 'Agendamentos', url: '/appointments', icon: <Calendar className="w-5 h-5" strokeWidth={1.5} /> },
];

const managementItems = [
  { title: 'Serviços', url: '/services', icon: <Briefcase className="w-5 h-5" strokeWidth={1.5} /> },
  { title: 'Horários', url: '/availability', icon: <Calendar className="w-5 h-5" strokeWidth={1.5} /> },
  { title: 'Clientes', url: '/clients', icon: <Users className="w-5 h-5" strokeWidth={1.5} /> },
  { title: 'Relatórios', url: '/reports', icon: <BarChart3 className="w-5 h-5" strokeWidth={1.5} /> },
];

const configItems = [
  { title: 'Meu perfil', url: '/settings', icon: <Settings className="w-5 h-5" strokeWidth={1.5} /> },
  { title: 'Planos', url: '/settings?section=subscription', icon: <Crown className="w-5 h-5" strokeWidth={1.5} /> },
];

const helpItems = [
  { title: 'Primeiros passos', url: '/getting-started', icon: <Sparkles className="w-5 h-5" strokeWidth={1.5} /> },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { hasFeature } = usePlanAccess();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useSidebarAnimated();

  const isActive = (url: string) => pathname === url.split('?')[0];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const renderMenuSection = (items: typeof mainMenuItems, title?: string) => {
    return (
      <div className="flex flex-col gap-1">
        <AnimatePresence mode="wait">
          {title && open && (
            <motion.div
              key={`title-${title}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-slate-400 dark:text-slate-500 overflow-hidden"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        {items.map((item) => {
          const active = isActive(item.url);
          const isGettingStarted = item.url === '/getting-started';

          return (
            <div key={item.title} className="relative px-2">
              {/* Active indicator bar */}
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-600 to-indigo-500 rounded-r-full" />
              )}

              <button
                onClick={() => {
                  if (isGettingStarted) {
                    window.dispatchEvent(new CustomEvent('open-getting-started-floating'));
                  } else {
                    router.push(item.url);
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm
                  transition-all duration-200 ease-out
                  ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                <span className={`transition-colors duration-200 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                  {item.icon}
                </span>
                <SidebarContent>
                  <span className="truncate">{item.title}</span>
                </SidebarContent>
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-6 bg-slate-50/50 dark:bg-slate-950 border-r border-slate-200/60 dark:border-slate-800">
        {/* Header & Menu */}
        <div className="flex flex-col gap-6">
          {(() => {
            return (
              <div
                className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity px-2"
                onClick={() => router.push('/dashboard')}
              >
                <div className="flex items-center justify-center flex-shrink-0">
                  {open ? (
                    <img src="/assets/brand-logo-horizontal.png" alt="AgendaFlow" className="h-10 object-contain" />
                  ) : (
                    <img src="/assets/brand-icon.png" alt="AgendaFlow" className="w-10 h-10" />
                  )}
                </div>
                <SidebarContent>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
                        AgendaFlow
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                      Beta
                    </span>
                  </div>
                </SidebarContent>
              </div>
            );
          })()}

          {/* Main Navigation */}
          {renderMenuSection(mainMenuItems)}

          {/* Management Section */}
          <div>
            <div className="h-px bg-slate-200/50 dark:bg-slate-800 my-2" />
            {renderMenuSection(managementItems, 'Gestão')}
          </div>

          {/* Configuration Section */}
          <div>
            <div className="h-px bg-slate-200/50 dark:bg-slate-800 my-2" />
            {renderMenuSection(configItems, 'Configuração')}
          </div>

          {/* Help Section */}
          <div>
            <div className="h-px bg-slate-200/50 dark:bg-slate-800 my-2" />
            {renderMenuSection(helpItems)}
          </div>
        </div>

        {/* Footer with Profile */}
        <div className="flex flex-col gap-3 px-2">
          {profile && (
            <button
              onClick={() => router.push('/settings')}
              className={`
                w-full flex items-center ${open ? 'gap-3 p-3 justify-start' : 'justify-center p-1'} rounded-lg
                transition-all duration-200 ease-out
                hover:bg-slate-100 dark:hover:bg-slate-800
                group
              `}
            >
              <Avatar className={`flex-shrink-0 ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-indigo-300 dark:group-hover:ring-indigo-600 transition-all ${open ? 'h-9 w-9' : 'h-8 w-8'}`}>
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-indigo-600 to-emerald-600 text-white">
                  {profile.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <SidebarContent>
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-semibold truncate text-slate-900 dark:text-slate-50">
                    {profile.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {profile.email}
                  </span>
                </div>
              </SidebarContent>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg font-medium text-sm
              transition-all duration-200 ease-out
              text-slate-500 dark:text-slate-400
              hover:text-red-600 dark:hover:text-red-400
              hover:bg-red-50 dark:hover:bg-red-950/20
              group
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <SidebarContent>
              <span>Sair</span>
            </SidebarContent>
          </button>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}


