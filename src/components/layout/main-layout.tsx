'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Sidebar />
      <div className="pl-64 min-w-0">
        <Header />
        <main className="p-6 min-w-0 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
