/**
 * POST /api/translate
 * Body: { text: string, petType: 'cat'|'dog', petName: '栖栖'|'迟迟' }
 * Resp: { translated: string } | { error: string }
 *
 * 调用栖迟·阶段3-Prompt设计 §2/§3 中的 P1-CAT / P1-DOG 共情翻译。
 * 不流式输出（响应短，无需 stream）。
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { translateMessage } from '@/lib/llm';

export const runtime = 'nodejs';
export const maxDuration = 30;

const BodySchema = z.object({
  text: z.string().min(1).max(1000),
  petType: z.enum(['cat', 'dog']),
  petName: z.enum(['栖栖', '迟迟']),
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
    const { text, petType, petName } = parsed.data;
    const translated = await translateMessage({
      userMessage: text,
      petType,
      petName,
    });
    return NextResponse.json({ translated });
  } catch (e) {
    // 把真实错误打到终端 + 透传给前端，方便调试
    console.error('[api/translate] failed', e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: 'translation failed',
        // dev 环境暴露 detail；生产环境屏蔽避免泄露内部信息
        detail:
          process.env.NODE_ENV === 'production' ? undefined : message,
      },
      { status: 500 },
    );
  }
}
