'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface UserLayoutProps {
  children: ReactNode;
  className?: string;
}

export function UserLayout({ children, className = "min-h-screen bg-primary-50" }: UserLayoutProps) {
  return (
    <div className={className}>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}