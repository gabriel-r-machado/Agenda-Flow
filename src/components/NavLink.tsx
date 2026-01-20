import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';

interface NavLinkProps extends LinkProps {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

export function NavLink({ href, className, activeClassName, pendingClassName, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = typeof href === 'string' ? pathname === href : false;

  return (
    <Link href={href} className={cn(className, isActive && activeClassName)} {...props} />
  );
}

