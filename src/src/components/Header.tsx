'use client';

import { formatDate } from '@/lib/utils';
import { ThemeSwitcher } from './ThemeSwitcher';
import Link from 'next/link';

interface HeaderProps {
  lastUpdatedDate: string;
}

export default function Header({ lastUpdatedDate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-b dark:border-zinc-800">
      <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8">
        <div className="mr-auto flex items-center space-x-2">
          <Link className="flex items-center space-x-2" href="/">
            <span className="font-bold text-lg">Price Tracker</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <p className="hidden text-sm text-muted-foreground font-mono sm:block">
            Last Updated: {formatDate(lastUpdatedDate)}
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
} 