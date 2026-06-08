/**
 * POST /api/extract
 * Body: { text: string }
 * Resp: { emotion: {...}, ner: {...} | null } | { error: string }
 *
 * 调用 P2（情绪标签）+ P3（NER 抽取）并行。
 * 失败兜底：emotion 用平静默认值；ner 返回 null。
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { silentExtract } from '@/lib/llm';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BodySchema = z.object({
  text: z.string().min(1).max(1000),
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
    return NextResponse.json(
      { error: 'invalid body', details: parsed.error.format() },
      { status: 400 },
    );
  }

  try {
    const result = await silentExtract(parsed.data.text);
    return NextResponse.json(result);
  } catch (e) {
    console.error('[api/extract] failed', e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: 'extract failed',
        detail: process.env.NODE_ENV === 'production' ? undefined : message,
      },
      { status: 500 },
    );
  }
}
