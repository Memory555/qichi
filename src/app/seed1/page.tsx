'use client';

/**
 * 真实求职历程种子页：一键灌入 2025.10-2026.06 共 8 个月的面试经历数据
 *
 * 跟 /seed 的区别：
 * - /seed: 最近 7 天的简单 demo（4 家公司，相对时间）
 * - /seed1: 8 个月真实求职历程（25+ 家公司，绝对时间）
 *
 * 用法：浏览器开 /seed1 → 选只宠物 → 点「写入真实历程数据」
 *      然后到 /chat /notebook /curve 看完整数据
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { resetAllData, type PetType } from '@/lib/db';
import { seedDemoDataV1 } from '@/lib/seed1';
import { cn } from '@/lib/utils';

export default function Seed1Page() {
  const [pet, setPet] = useState<PetType>('cat');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleSeed = async () => {
    setBusy(true);
    setStatus('正在写入 8 个月历程…');
    try {
      const r = await seedDemoDataV1(pet);
      setStatus(
        `✅ 已写入 ${r.messages} 条对话 + ${r.emotions} 条情绪 + ${r.reviews} 张复盘\n📅 ${r.dateRange}` +
          (r.petCreated ? `\n🐾 已默认选中：${pet === 'cat' ? '栖栖' : '迟迟'}` : ''),
      );
    } catch (e) {
      setStatus('❌ 失败：' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('确认清空所有本地数据？')) return;
    setBusy(true);
    setStatus('正在清空…');
    try {
      await resetAllData();
      setStatus('✅ 已清空，下次进 / 会回到引导');
    } catch (e) {
      setStatus('❌ 失败：' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-shell flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-10">
      <h1 className="text-h1 text-ink">🎬 真实求职历程 · Demo 数据</h1>

      <div className="max-w-md space-y-3 text-center">
        <p className="text-body-em font-light leading-relaxed text-ink-soft">
          一键灌入一段真实求职者从 2025.10 到 2026.06 的完整历程
        </p>
        <div className="space-y-1 text-caption text-ink-mute">
          <p>📅 跨越 8 个月，共 25+ 家公司</p>
          <p>💬 ~80 条对话（含技术细节 + 情绪流）</p>
          <p>📊 29 条情绪记录（覆盖起步 → 并行 → 崩塌 → 自洽 全周期）</p>
          <p>📋 24 张复盘卡（含具体考点与失误点）</p>
        </div>
      </div>

      <div className="grid w-full max-w-md grid-cols-3 gap-2 rounded-card bg-bg-soft p-3 text-mini text-ink-soft">
        <div>
          <div className="text-caption text-brand">起步期</div>
          <div className="text-ink-mute">2025.10 - 2026.02</div>
          <div>创投 / 元芯 / ASML</div>
        </div>
        <div>
          <div className="text-caption text-brand">并行期</div>
          <div className="text-ink-mute">2026.02 - 2026.03</div>
          <div>TCL / 笃威尔 / 奥萨 / 极光矩阵</div>
        </div>
        <div>
          <div className="text-caption text-brand">崩塌期</div>
          <div className="text-ink-mute">2026.04 - 2026.06</div>
          <div>荣耀 / 蚂蚁 / 凡屿 / 编程猫…</div>
        </div>
      </div>

      {/* 选宠物 */}
      <div className="flex gap-2">
        {(['cat', 'dog'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPet(p)}
            aria-pressed={pet === p}
            className={cn(
              'inline-flex h-9 items-center rounded-pill px-4 text-body-ui transition-colors',
              pet === p
                ? 'bg-brand text-ink-on'
                : 'bg-brand-soft text-chip-warm',
            )}
          >
            {p === 'cat' ? '🐱 栖栖' : '🐶 迟迟'}
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Button onClick={handleSeed} disabled={busy} fullWidth>
          写入真实历程数据
        </Button>
        <Button
          onClick={handleReset}
          variant="secondary"
          disabled={busy}
          fullWidth
        >
          清空所有数据
        </Button>
      </div>

      {status && (
        <p className="whitespace-pre-line text-center text-caption text-ink-soft">
          {status}
        </p>
      )}

      <div className="flex gap-4 pt-2 text-caption">
        <Link href="/chat" className="text-brand hover:underline">
          → 聊天
        </Link>
        <Link href="/notebook" className="text-brand hover:underline">
          → 小本本
        </Link>
        <Link href="/curve" className="text-brand hover:underline">
          → 曲线
        </Link>
        <Link href="/settings" className="text-brand hover:underline">
          → 我
        </Link>
      </div>

      <p className="mt-2 max-w-md text-center text-mini text-ink-mute">
        提示：调用本页会清空消息 / 情绪 / 复盘 3 张表（settings 保留）。
        <br />
        正式使用前请到 <code>/reset</code> 完全清空再重新引导。
      </p>
    </main>
  );
}
