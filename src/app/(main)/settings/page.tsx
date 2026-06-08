'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppBar } from '@/components/layout/AppBar';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { useCurrentPet } from '@/hooks/useCurrentPet';
import { PETS } from '@/lib/pets';
import { exportAllData, resetAllData } from '@/lib/db';
import { clearAllSummaryCache } from '@/lib/monthly';

function SettingsRow({
  label,
  onClick,
  danger,
  serif,
  disabled,
  asLink,
}: {
  label: string;
  onClick?: () => void;
  danger?: boolean;
  serif?: boolean;
  disabled?: boolean;
  asLink?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-full items-center justify-between px-4 text-left transition-colors hover:bg-subtle disabled:hover:bg-transparent"
    >
      <span
        className={
          danger
            ? 'text-body-ui text-danger'
            : disabled
              ? 'text-body-ui text-ink-mute'
              : 'text-body-ui text-ink'
        }
        style={serif ? { fontFamily: 'serif' } : undefined}
      >
        {label}
      </span>
      <span className="text-ink-mute">{asLink ? '↗' : '›'}</span>
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-caption text-ink-soft">{title}</h3>
      <Card className="overflow-hidden p-0">
        <div className="divide-y divide-line">{children}</div>
      </Card>
    </section>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { pet } = useCurrentPet();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!pet) return null;
  const profile = PETS[pet.pet];

  const wipeAndGo = async () => {
    await resetAllData();
    clearAllSummaryCache();
    router.replace('/onboarding');
  };

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `栖迟-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearConfirm = async () => {
    if (confirmText !== '确认') return;
    setConfirmText('');
    await wipeAndGo();
  };

  return (
    <>
      <AppBar center={<span className="text-h3 text-ink">我</span>} />

      <div className="scroll-soft flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
        {/* 宠物身份 */}
        <div className="flex flex-col items-center gap-2 py-4">
          <Icon src={profile.avatar} size={80} alt={pet.name} />
          <h2 className="text-h2 text-ink">{pet.name}</h2>
          <p className="text-caption text-ink-mute">在这儿陪你</p>
        </div>

        <Section title={`我和${pet.name}`}>
          <SettingsRow
            label="换一只小动物"
            onClick={() => setSwitchOpen(true)}
          />
        </Section>

        <Section title="数据">
          <SettingsRow label="导出所有数据" onClick={handleExport} />
          <SettingsRow
            label="清除所有数据"
            danger
            onClick={() => {
              setConfirmText('');
              setClearOpen(true);
            }}
          />
        </Section>

        <Section title="关于栖迟">
          <Link href="/about" className="block">
            <SettingsRow label="这是个什么" asLink />
          </Link>
          <Link href="/about/easter-egg" className="block">
            <SettingsRow label="衡门之下，可以栖迟" serif asLink />
          </Link>
        </Section>

        <p className="mt-2 text-center text-mini text-ink-mute">
          数据只在你这台设备上 · 阶段 F
        </p>
      </div>

      {/* 换宠物确认 */}
      <Dialog
        open={switchOpen}
        onClose={() => setSwitchOpen(false)}
        title="换一只小动物？"
        body="换之后这只小动物以及你跟它说过的所有内容会一起清掉。要继续吗？"
        confirmLabel="换"
        onConfirm={wipeAndGo}
        danger
      />

      {/* 清除数据 · 输入"确认"才能执行 */}
      <Dialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="清除所有数据"
        body={
          <div className="space-y-3">
            <p>这会清掉所有的对话、情绪和复盘。不可恢复。</p>
            <p>输入「确认」继续：</p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="确认"
            />
          </div>
        }
        confirmLabel="清除"
        confirmDisabled={confirmText !== '确认'}
        onConfirm={handleClearConfirm}
        danger
      />
    </>
  );
}
