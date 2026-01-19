"use client";

import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Navbar wrapper with scroll detection
const Navbar = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 80) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <>
      <motion.header
        ref={ref}
        className={cn("fixed inset-x-0 top-0 z-50 w-full", className)}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(
                child as React.ReactElement<{ visible?: boolean }>,
                { visible },
              )
            : child,
        )}
      </motion.header>

      {/* spacer to avoid content being overlapped by fixed header */}
      <div aria-hidden className="h-16 md:h-20" />
    </>
  );
};

// Main nav body with animation
const NavBody = ({ children, className, visible }: { children: React.ReactNode; className?: string; visible?: boolean }) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "95%" : "100%",
        paddingLeft: visible ? "16px" : "0px",
        paddingRight: visible ? "16px" : "0px",
        borderRadius: visible ? "20px" : "0px",
        y: visible ? 16 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
            "relative z-[60] mx-auto hidden lg:flex w-full max-w-7xl flex-row items-center justify-between self-start bg-transparent px-4 py-3 md:py-4 transition-all duration-300",
            visible && "bg-white/80 dark:bg-neutral-950/80",
            className,
          )}
    >
      {children}
    </motion.div>
  );
};

// Nav items with hover effect
const NavItems = ({
  items,
  className,
  onItemClick,
}: {
  items: { name: string; link: string }[];
  className?: string;
  onItemClick?: () => void;
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent, link: string) => {
    if (link.includes('#')) {
      // Let the browser handle hash navigation (will navigate to home and jump to anchor)
      // Do not prevent default so browser updates location and scrolls
      if (onItemClick) onItemClick();
      return;
    }

    // For normal routes, use react-router navigation to avoid full reload
    e.preventDefault();
    router.push(link);
    if (onItemClick) onItemClick();
  };

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "hidden lg:flex flex-row items-center justify-center gap-2",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a key={`link-${idx}`} href={item.link} onClick={(e) => handleClick(e, item.link)}>
          <motion.button
            onMouseEnter={() => setHovered(idx)}
            className="relative px-4 py-2 text-foreground dark:text-foreground text-sm font-medium rounded-full transition duration-200 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-emerald-50 dark:bg-emerald-950/20"
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </motion.button>
        </a>
      ))}
    </motion.div>
  );
};

// Mobile nav wrapper
const MobileNav = ({ children, className, visible }: { children: React.ReactNode; className?: string; visible?: boolean }) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "95%" : "100%",
        paddingLeft: visible ? "16px" : "0px",
        paddingRight: visible ? "16px" : "0px",
        borderRadius: visible ? "20px" : "0px",
        y: visible ? 16 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex lg:hidden w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-4 py-3 transition-all duration-300",
        visible && "bg-white/80 dark:bg-neutral-950/80",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

// Mobile nav header (logo + toggle)
const MobileNavHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between lg:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
};

// Mobile nav menu (dropdown)
const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "w-full flex flex-col items-start justify-start gap-3 rounded-lg px-0 py-4 lg:hidden",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Mobile toggle button
const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="lg:hidden p-2 rounded-md hover:bg-muted/50 transition"
    >
      {isOpen ? (
        <IconX className="w-6 h-6 text-black dark:text-white" />
      ) : (
        <IconMenu2 className="w-6 h-6 text-black dark:text-white" />
      )}
    </motion.button>
  );
};

// Logo component
const NavbarLogo = () => {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({}, '', '/');
  };

  return (
      <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 z-20">
      <motion.img
        src="/assets/brand-logo-primary.png"
        alt="AgendaFlow logo"
        className="h-8 md:h-10 object-contain"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      />
    </a>
  );
};

// CTA Button
const NavbarButton = ({
  href,
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
} & React.ComponentPropsWithoutRef<"a">) => {
  const variantStyles = {
    primary: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-300/50 dark:hover:shadow-emerald-800/40",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30",
  };

  return (
    <Link href={href || "#"} {...props}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300",
          variantStyles[variant],
          className,
        )}
      >
        {children}
      </motion.button>
    </Link>
  );
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Navbar>
      <NavBody>
        {/* Desktop & Mobile Logo */}
        <NavbarLogo />

        {/* Desktop Nav Items */}
        <NavItems
          items={[
            { name: "Recursos", link: "/#features" },
            { name: "Comparação", link: "/#comparison" },
            { name: "Como Começar", link: "/#how" },
            { name: "Resultados", link: "/#stats" },
            { name: "Planos", link: "/#pricing" },
            { name: "Depoimentos", link: "/#testimonials" },
            { name: "FAQ", link: "/#faq" },
          ]}
        />

        {/* Desktop CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/auth">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-foreground hover:text-emerald-600 transition-colors duration-200"
            >
              Entrar
            </motion.button>
          </Link>
          <NavbarButton href="/auth" variant="primary">
            Começar Grátis
          </NavbarButton>
        </div>

        {/* Mobile Menu Toggle */}
        <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
      </NavBody>

      {/* Mobile Menu */}
      <MobileNav visible={mobileOpen}>
        <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
          </MobileNavHeader>
        <MobileNavMenu isOpen={mobileOpen}>
          <a href="/#features" onClick={() => setMobileOpen(false)} className="w-full">
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
              Recursos
            </Button>
          </a>
          <a href="/#comparison" onClick={() => setMobileOpen(false)} className="w-full">
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
              Comparação
            </Button>
          </a>
          <a href="/#how" onClick={() => setMobileOpen(false)} className="w-full">
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
              Como Começar
            </Button>
          </a>
          <a href="/#stats" onClick={() => setMobileOpen(false)} className="w-full">
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
              Resultados
            </Button>
          </a>
          <a href="/#pricing" onClick={() => setMobileOpen(false)} className="w-full">
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
              Planos
            </Button>
          </a>
          <a href="/#testimonials" onClick={() => setMobileOpen(false)} className="w-full">
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
              Depoimentos
            </Button>
          </a>
          <a href="/#faq" onClick={() => setMobileOpen(false)} className="w-full">
            <Button variant="ghost" className="w-full text-left text-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
              FAQ
            </Button>
          </a>
          <div className="w-full border-t border-border pt-3 mt-3">
            <Link href="/auth" onClick={() => setMobileOpen(false)} className="w-full">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
