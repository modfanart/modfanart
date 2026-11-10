import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Table, Folder, CheckSquare } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';

const links = [
  { to: '/tickets', label: 'Workbook', icon: Table, isActive: (p) => p === '/tickets' || p === '/tickets/workbook' },
  { to: '/tickets/projects', label: 'Projects', icon: Folder, isActive: (p) => p.startsWith('/tickets/projects') },
  { to: '/tickets/tasks', label: 'My Tasks', icon: CheckSquare, isActive: (p) => p.startsWith('/tickets/tasks') },
];

const AgendaNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-wrap items-center gap-1 mb-6 p-1 rounded-lg bg-zinc-900 border border-zinc-800 w-fit" aria-label="Agenda sections">
      {links.map(({ to, label, icon: Icon, isActive }) => {
        const active = isActive(pathname);
        return (
          <NavLink key={to} to={to} className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors', active ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60')}>
            <Icon className={cn('w-4 h-4', active ? 'text-emerald-400' : 'text-zinc-500')} />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default AgendaNav;
