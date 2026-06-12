'use client';

import { useMemo, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { ReviewCard } from './ReviewCard';
import { InterviewForm } from './InterviewForm';
import { deleteInterview, toggleInterviewDone } from '@/lib/interviews';
import { cn } from '@/lib/utils';
import type { Interview, Review } from '@/types';

/**
 * 日程日历视图（v2.1：从只读 ReviewCalendar 升级而来）。
 *
 * 一格一天，同时显示两类数据：
 * - **复盘**（reviews，brand 实心点）：聊天里 AI 自动抽取的"已发生"
 * - **日程**（interviews，brand-pale 空心圆环）：用户手动添加的"计划/未来"
 *
 * 点格子 → 抽屉：顶部"+ 添加面试日程"，中间日程列表，下部复盘列表。
 */

interface Props {
  reviews: Review[];
  interviews: Interview[];
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtMonth = (d: Date) =>
  `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;

interface Cell {
  date: Date;
  inMonth: boolean;
  key: string;
}

function buildCells(year: number, month0: number): Cell[] {
  const first = new Date(year, month0, 1);
  const weekday = (first.getDay() + 6) % 7;
  const start = new Date(year, month0, 1 - weekday);
  const cells: Cell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({
      date: d,
      inMonth: d.getMonth() === month0,
      key: dayKey(d),
    });
  }
  return cells;
}

/** 渲染 1-3 个点；>3 用数字代替 */
function DotRow({
  count,
  variant,
}: {
  count: number;
  variant: 'review' | 'interview';
}) {
  if (count === 0) return null;
  const dotCls =
    variant === 'review'
      ? 'h-1 w-1 rounded-full bg-brand'
      : 'h-1.5 w-1.5 rounded-full border-[1.5px] border-brand bg-transparent';
  const textCls =
    variant === 'review'
      ? 'text-mini font-medium text-brand'
      : 'text-mini font-medium text-brand-deep';

  return (
    <span className="inline-flex items-center gap-0.5">
      {count <= 3 ? (
        Array.from({ length: count }).map((_, i) => (
          <span key={i} className={dotCls} />
        ))
      ) : (
        <span className={textCls}>{count}</span>
      )}
    </span>
  );
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtHeader(it: Interview): string {
  const head = [it.company, it.jobPosition, it.interviewStage]
    .filter(Boolean)
    .join(' · ');
  return head || '一场面试';
}

function InterviewItem({
  it,
  onEdit,
}: {
  it: Interview;
  onEdit: (it: Interview) => void;
}) {
  const done = !!it.completedAt;
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-card border border-line bg-card p-3',
        done && 'opacity-60',
      )}
    >
      <button
        type="button"
        onClick={() => toggleInterviewDone(it.id!, !done)}
        aria-label={done ? '取消完成' : '标记完成'}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px]',
          done ? 'border-brand bg-brand text-ink-on' : 'border-line bg-card',
        )}
      >
        {done && <span className="text-mini leading-none">✓</span>}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className={cn('text-body-ui text-ink', done && 'line-through')}>
            {fmtHeader(it)}
          </h4>
          <span className="shrink-0 text-mini text-ink-soft">
            {fmtTime(it.scheduledAt)}
          </span>
        </div>
        {it.notes && (
          <p className="mt-1 line-clamp-2 text-caption text-ink-soft">
            {it.notes}
          </p>
        )}
        <div className="mt-1 flex gap-3 text-mini">
          <button
            type="button"
            onClick={() => onEdit(it)}
            className="text-brand hover:underline"
          >
            编辑
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm('删除这条日程？')) return;
              await deleteInterview(it.id!);
            }}
            className="text-danger hover:underline"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScheduleCalendar({ reviews, interviews }: Props) {
  const [anchor, setAnchor] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Interview | undefined>();

  const reviewsByDay = useMemo(() => {
    const m = new Map<string, Review[]>();
    for (const r of reviews) {
      const key = dayKey(new Date(r.createdAt));
      const arr = m.get(key) ?? [];
      arr.push(r);
      m.set(key, arr);
    }
    return m;
  }, [reviews]);

  const interviewsByDay = useMemo(() => {
    const m = new Map<string, Interview[]>();
    for (const it of interviews) {
      const key = dayKey(new Date(it.scheduledAt));
      const arr = m.get(key) ?? [];
      arr.push(it);
      m.set(key, arr);
    }
    // 同日按时间正序
    for (const arr of m.values()) {
      arr.sort((a, b) => a.scheduledAt - b.scheduledAt);
    }
    return m;
  }, [interviews]);

  const cells = useMemo(
    () => buildCells(anchor.getFullYear(), anchor.getMonth()),
    [anchor],
  );

  const today = dayKey(new Date());
  const openReviews = openKey ? reviewsByDay.get(openKey) ?? [] : [];
  const openInterviews = openKey ? interviewsByDay.get(openKey) ?? [] : [];

  const goPrev = () =>
    setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1));
  const goNext = () =>
    setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1));

  const handleAddClick = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const handleEdit = (it: Interview) => {
    setEditing(it);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* 月份切换条 */}
      <div className="flex items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={goPrev}
          aria-label="上个月"
          className="flex h-8 w-8 items-center justify-center rounded-pill text-ink-soft transition-colors hover:bg-subtle"
        >
          ‹
        </button>
        <span className="text-body-ui text-ink">{fmtMonth(anchor)}</span>
        <button
          type="button"
          onClick={goNext}
          aria-label="下个月"
          className="flex h-8 w-8 items-center justify-center rounded-pill text-ink-soft transition-colors hover:bg-subtle"
        >
          ›
        </button>
      </div>

      {/* 星期表头 */}
      <div className="grid grid-cols-7 px-3 text-center text-mini text-ink-mute">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1.5">
            {w}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="scroll-soft flex-1 overflow-y-auto px-3 pb-4">
        <div className="grid grid-cols-7 gap-1">
          {cells.map(({ date, inMonth, key }) => {
            const rCount = reviewsByDay.get(key)?.length ?? 0;
            const iCount = interviewsByDay.get(key)?.length ?? 0;
            const isToday = key === today;
            // 任何一类有数据 → 可点击；都没有 → 也允许点击进入空状态加日程
            const hasData = rCount + iCount > 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setOpenKey(key)}
                aria-label={`${date.getMonth() + 1}月${date.getDate()}日，复盘 ${rCount}，日程 ${iCount}`}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center rounded-card transition-colors',
                  inMonth ? 'text-ink' : 'text-ink-disabled',
                  isToday && 'ring-1 ring-brand',
                  hasData
                    ? 'cursor-pointer hover:bg-brand-pale'
                    : 'hover:bg-subtle',
                )}
              >
                <span className="text-caption leading-none">
                  {date.getDate()}
                </span>
                <div className="mt-1 flex h-3 flex-col items-center gap-0.5">
                  <DotRow count={rCount} variant="review" />
                  <DotRow count={iCount} variant="interview" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 当日详情抽屉 */}
      <BottomSheet open={!!openKey} onClose={() => setOpenKey(null)}>
        {openKey && (
          <div className="flex max-h-[75dvh] flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-h3 text-ink">
                {openKey.replace(/-/g, ' / ')}
              </h3>
              <Button size="md" onClick={handleAddClick}>
                + 添加面试
              </Button>
            </div>

            <div className="scroll-soft flex flex-col gap-4 overflow-y-auto pr-1">
              {/* 日程 */}
              {openInterviews.length > 0 && (
                <section>
                  <h4 className="mb-2 px-1 text-caption text-ink-soft">
                    日程（{openInterviews.length}）
                  </h4>
                  <div className="flex flex-col gap-2">
                    {openInterviews.map((it) => (
                      <InterviewItem
                        key={it.id}
                        it={it}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 复盘 */}
              {openReviews.length > 0 && (
                <section>
                  <h4 className="mb-2 px-1 text-caption text-ink-soft">
                    复盘（{openReviews.length}）
                  </h4>
                  <div className="flex flex-col gap-3">
                    {openReviews.map((r) => (
                      <ReviewCard key={r.id} review={r} />
                    ))}
                  </div>
                </section>
              )}

              {/* 空状态 */}
              {openInterviews.length === 0 && openReviews.length === 0 && (
                <p className="py-6 text-center text-caption text-ink-mute">
                  这天还没记录。点上面的「+ 添加面试」试试。
                </p>
              )}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* 添加 / 编辑表单 */}
      <InterviewForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        defaultDate={openKey ?? undefined}
      />
    </div>
  );
}
