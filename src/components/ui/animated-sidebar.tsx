"use client";

import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebarAnimated = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarAnimated must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar className={className} {...props}>{children as React.ReactNode}</DesktopSidebar>
      <MobileSidebar className={className}>{children as React.ReactNode}</MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebarAnimated();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-white dark:bg-neutral-900 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "70px") : "280px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebarAnimated();
  return (
    <>
      <div
        className={cn(
          "h-0 md:hidden relative"
        )}
        {...props}
      >
        <div className="fixed top-0 left-0 right-0 h-14 px-4 py-3 flex flex-row items-center justify-between bg-white dark:bg-neutral-900 w-full border-b border-neutral-200 dark:border-neutral-800 z-40">
          <div className="flex justify-start z-20">
            <Menu
              className="text-neutral-900 dark:text-neutral-100 cursor-pointer hover:text-primary w-6 h-6"
              onClick={() => setOpen(!open)}
            />
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 !bg-white p-6 z-[100] flex flex-col justify-between overflow-y-auto",
                className
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 text-neutral-900 cursor-pointer hover:text-primary"
                onClick={() => setOpen(!open)}
              >
                <X className="w-6 h-6" />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  ...props
}: {
  link: Links;
  className?: string;
  onClick?: () => void;
  props?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
}) => {
  const { open, animate } = useSidebarAnimated();
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2.5 px-3 rounded-lg hover:bg-primary/5 hover:text-primary transition-all duration-200 cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center flex-shrink-0">
        {link.icon}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-300 text-sm font-medium group-hover/sidebar:translate-x-0.5 transition duration-150 whitespace-nowrap inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

export const SidebarContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open, animate } = useSidebarAnimated();
  return (
    <motion.div
      animate={{
        display: animate ? (open ? "flex" : "none") : "flex",
        opacity: animate ? (open ? 1 : 0) : 1,
      }}
      className={cn("flex-col items-start flex-1", className)}
    >
      {children}
    </motion.div>
  );
};
