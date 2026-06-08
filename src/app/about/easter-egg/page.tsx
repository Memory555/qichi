'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { BRAND } from '@/lib/assets';

export default function EasterEggPage() {
  return (
    <AppShell>
      <div className="flex min-h-dvh flex-col items-center justify-center px-8 py-12 text-center">
        <div className="relative h-32 w-64">
          <Image
            src={BRAND.wordmark}
            alt="栖迟"
            fill
            sizes="256px"
            priority
            className="object-contain"
          />
        </div>

        <div className="mt-10 space-y-2" style={{ fontFamily: 'serif' }}>
          <p className="text-body-em leading-loose text-ink">
            衡门之下，可以栖迟。
          </p>
          <p className="text-body-em leading-loose text-ink">
            泌之洋洋，可以乐饥。
          </p>
        </div>

        <p
          className="mt-4 text-caption text-ink-mute"
          style={{ fontFamily: 'serif' }}
        >
          —— 《诗经·陈风·衡门》
        </p>

        <p className="mt-10 max-w-xs text-caption leading-relaxed text-ink-soft">
          虽然只是简陋的门舍，
          <br />
          但依然可以暂时停留、安顿身心。
          <br />
          <br />
          你不一定马上变强，
          <br />
          但总该有个地方先待一会儿。
        </p>

        <Link
          href="/settings"
          className="mt-12 rounded-pill px-4 py-2 text-caption text-brand hover:bg-brand-pale"
        >
          ← 回到「我」
        </Link>
      </div>
    </AppShell>
  );
}
