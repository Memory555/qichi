'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Message, type Review } from '@/lib/db';

interface Props {
  review: Review;
}

function dayRange(ts: number): [number, number] {
  const start = new Date(ts);
  start.setHours(0, 0, 0, 0);
  const end = new Date(ts);
  end.setHours(23, 59, 59, 999);
  return [start.getTime(), end.getTime()];
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
}

function MessageRow({ message }: { message: Message }) {
  const time = fmtTime(message.createdAt);

  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-mini text-ink-mute">{time}</span>
        <div className="max-w-[80%] rounded-bubble rounded-br-[4px] border border-line bg-card px-3 py-2 text-body-ui text-ink">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="text-mini text-ink-mute">{time}</span>
      <div className="max-w-[80%] rounded-bubble rounded-bl-[4px] bg-brand-soft px-3 py-2 text-body-ui text-ink">
        {message.text}
      </div>
      {message.translatedText && (
        <div className="ml-1 mt-1 max-w-[85%] rounded-bubble bg-brand-pale/70 px-3 py-2 text-body-em font-light text-ink">
          {message.translatedText}
        </div>
      )}
    </div>
  );
}

export function ReviewDetail({ review }: Props) {
  const [start, end] = dayRange(review.createdAt);

  const messages =
    useLiveQuery(
      () =>
        db.messages
          .where('createdAt')
          .between(start, end, true, true)
          .sortBy('createdAt'),
      [start, end],
      [],
    ) ?? [];

  return (
    <div className="flex max-h-[70vh] flex-col">
      <div className="mb-3 shrink-0">
        <h2 className="text-h3 text-ink">{fmtDate(review.createdAt)} · 全天</h2>
        <p className="mt-0.5 text-caption text-ink-mute">
          {messages.length > 0
            ? `${messages.length} 条记录 · 从 ${fmtTime(
                messages[0].createdAt,
              )} 到 ${fmtTime(messages[messages.length - 1].createdAt)}`
            : '这天没有聊天记录'}
        </p>
      </div>

      {messages.length === 0 ? (
        <p className="py-8 text-center text-body-em font-light text-ink-soft">
          这天没记录到对话。
        </p>
      ) : (
        <div className="scroll-soft flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
        </div>
      )}
    </div>
  );
}
