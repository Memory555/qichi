'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Icon } from '@/components/ui/Icon';
import { ICONS } from '@/lib/assets';
import { deleteReview, setReviewHidden } from '@/lib/reviews';
import { ReviewDetail } from './ReviewDetail';
import { ReviewEditForm } from './ReviewEditForm';
import type { Review } from '@/types';

interface Props {
  review: Review;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

function headerLine(r: Review): string {
  const parts = [r.company, r.jobPosition, r.interviewStage].filter(Boolean);
  return parts.length > 0 ? parts.join('·') : '一段聊天';
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      <h4 className="text-caption text-ink-soft">{title}</h4>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-body-ui text-ink">
            · {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReviewCard({ review }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const isHidden = review.hidden;

  const handleDetail = () => {
    setMenuOpen(false);
    setDetailOpen(true);
  };
  const handleEdit = () => {
    setMenuOpen(false);
    setEditOpen(true);
  };
  const handleHide = async () => {
    await setReviewHidden(review.id!, true);
    setMenuOpen(false);
  };
  const handleRestore = async () => {
    await setReviewHidden(review.id!, false);
    setMenuOpen(false);
  };
  const handleDelete = async () => {
    if (!confirm('删除后小本本和心境曲线对应的记录都会消失，确认？')) return;
    await deleteReview(review.id!);
    setMenuOpen(false);
  };

  return (
    <>
      <Card className={isHidden ? 'opacity-60' : ''}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-body-ui font-medium text-ink">
              {formatDate(review.createdAt)} · {headerLine(review)}
            </h3>
            {isHidden && (
              <p className="mt-0.5 text-mini text-ink-mute">已隐藏</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="操作"
            className="-mt-1 -mr-2 rounded-pill px-2 py-1 text-ink-soft hover:bg-subtle"
          >
            ⋯
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <Section title="被问到的" items={review.questions} />
          <Section title="卡住的点" items={review.mistakes} />
          <Section title="答得不错" items={review.strengths} />

          {review.questions.length === 0 &&
            review.mistakes.length === 0 &&
            review.strengths.length === 0 && (
              <p className="text-caption text-ink-mute">
                还没记到什么细节。聊得更具体一些，我会自动整理。
              </p>
            )}
        </div>
      </Card>

      {/* 操作菜单 */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="space-y-1">
          <button
            type="button"
            onClick={handleDetail}
            className="flex h-12 w-full items-center rounded-card px-4 text-body-ui text-ink hover:bg-subtle"
          >
            <Icon src={ICONS.action.detail} size={20} alt="" />
            <span className="ml-3">详情（看这天的全部聊天）</span>
          </button>

          <button
            type="button"
            onClick={handleEdit}
            className="flex h-12 w-full items-center rounded-card px-4 text-body-ui text-ink hover:bg-subtle"
          >
            <Icon src={ICONS.action.edit} size={20} alt="" />
            <span className="ml-3">编辑</span>
          </button>

          {isHidden ? (
            <button
              type="button"
              onClick={handleRestore}
              className="flex h-12 w-full items-center rounded-card px-4 text-body-ui text-brand hover:bg-subtle"
            >
              <Icon src={ICONS.action.look} size={20} alt="" />
              <span className="ml-3">恢复显示</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleHide}
              className="flex h-12 w-full items-center rounded-card px-4 text-body-ui text-ink hover:bg-subtle"
            >
              <Icon src={ICONS.action.hide} size={20} alt="" />
              <span className="ml-3">这条不算（隐藏）</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="flex h-12 w-full items-center rounded-card px-4 text-body-ui text-danger hover:bg-subtle"
          >
            <Icon src={ICONS.action.delete} size={20} alt="" />
            <span className="ml-3">删除（同步从曲线移除）</span>
          </button>
        </div>
      </BottomSheet>

      {/* 详情：当天全程聊天 */}
      <BottomSheet open={detailOpen} onClose={() => setDetailOpen(false)}>
        <ReviewDetail review={review} />
      </BottomSheet>

      {/* 编辑：可改公司 / 岗位 / 轮次 + 三个数组字段 */}
      <ReviewEditForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        review={review}
      />
    </>
  );
}
