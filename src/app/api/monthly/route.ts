/**
 * POST /api/monthly
 * Body: { petType, petName, emotionTimeline, interviewDigest, totalDays, totalMessages }
 * Resp: { summary: string }
 *
 * 调用 P5 月度总结。客户端先从本地聚合数据再 POST。
 * 失败兜底走 lib/llm.ts 的 generateMonthlySummary 内部。
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateMonthlySummary } from '@/lib/llm';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BodySchema = z.object({
  petType: z.enum(['cat', 'dog']),
  petName: z.enum(['栖栖', '迟迟']),
  emotionTimeline: z.string().max(2000),
  interviewDigest: z.string().max(2000),
  totalDays: z.number().int().min(0),
  totalMessages: z.number().int().min(0),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  try {
    const summary = await generateMonthlySummary(parsed.data);
    return NextResponse.json({ summary });
  } catch (e) {
    console.error('[api/monthly] failed', e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: 'monthly failed',
        detail: process.env.NODE_ENV === 'production' ? undefined : message,
      },
      { status: 500 },
    );
  }
}
