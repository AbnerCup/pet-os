'use client';

import { Bell, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { NotificationsDropdown } from './NotificationsDropdown';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-sage-200 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
          <input
            type="text"
            placeholder="Buscar mascotas, registros, citas..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-sage-500/20"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Link href="/pets/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva Mascota</span>
        </Link>

        <NotificationsDropdown />
      </div>
    </header>
  );
}
