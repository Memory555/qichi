'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { AppBar } from '@/components/layout/AppBar';

export default function AboutPage() {
  return (
    <AppShell>
      <AppBar
        left={
          <Link
            href="/settings"
            className="rounded-pill px-2 py-1 text-caption text-brand hover:bg-brand-pale"
          >
            ← 返回
          </Link>
        }
      />

      <div className="scroll-soft flex-1 overflow-y-auto px-6 py-6">
        <h1 className="mb-6 text-h1 text-ink">这是个什么</h1>

        <div className="space-y-4 text-body-em font-light leading-relaxed text-ink">
          <p>
            栖迟是个 <strong className="text-brand">面试树洞 + 复盘</strong>{' '}
            合一的小工具。
          </p>
          <p>
            选一只小动物陪你聊面试糟心事 —— 你只管吐槽，复盘它替你默默记着。
          </p>
          <p>它不会说加油，不会催你振作。但它会在。</p>
        </div>

        <hr className="my-8 border-line" />

        <h2 className="mb-3 text-h2 text-ink">为什么叫栖迟</h2>
        <p className="text-body-em font-light leading-relaxed text-ink-soft">
          出自《诗经·陈风·衡门》：
          <span className="mx-1" style={{ fontFamily: 'serif' }}>
            「衡门之下，可以栖迟。」
          </span>
          意思是 —— 哪怕只是简陋的门舍，依然可以暂时停留、安顿身心。
        </p>

        <hr className="my-8 border-line" />

        <h2 className="mb-3 text-h2 text-ink">数据放哪里</h2>
        <p className="text-body-em font-light leading-relaxed text-ink-soft">
          所有对话、情绪、复盘只存在你浏览器的 IndexedDB
          里，不上传任何服务器。换浏览器或清缓存数据就没了，所以重要的话记得在「我 ·
          数据 · 导出所有数据」备份。
        </p>

        <div className="h-10" />
      </div>
    </AppShell>
  );
}
