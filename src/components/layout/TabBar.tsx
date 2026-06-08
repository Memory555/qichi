'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { getTabIcon, type TabName } from '@/lib/assets';
import { cn } from '@/lib/utils';

interface TabConfig {
  name: TabName;
  href: string;
  label: string;
}

const TABS: readonly TabConfig[] = [
  { name: 'chat', href: '/chat', label: '聊天' },
  { name: 'notebook', href: '/notebook', label: '小本本' },
  { name: 'chart', href: '/curve', label: '曲线' },
  { name: 'me', href: '/settings', label: '我' },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex h-16 items-stretch border-t border-line bg-page"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href) ?? false;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-transform active:scale-95',
              active ? 'text-brand' : 'text-ink-soft',
            )}
          >
            <Icon src={getTabIcon(tab.name, active)} alt={tab.label} size={24} />
            <span className="text-mini">{tab.label}</span>
            {active && (
              <span className="absolute bottom-1 h-[3px] w-[3px] rounded-full bg-brand" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
