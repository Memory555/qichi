'use client';

import { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateReview } from '@/lib/reviews';
import type { Review } from '@/types';

/**
 * 复盘编辑表单（v2.2 新增）。
 *
 * 用 BottomSheet 而不是居中 Dialog —— 字段较多，底部抽屉更顺手。
 *
 * 数组字段（被问到的 / 卡住的点 / 答得不错）用 textarea + 一行一条：
 * - 提交时 `split('\n').map(trim).filter(Boolean)`
 * - 进入时 `arr.join('\n')`
 *
 * 保存后 `userEdited` 由 updateReview 自动置 true（见 lib/reviews.ts）。
 */

interface Props {
  open: boolean;
  onClose: () => void;
  review: Review;
}

const splitLines = (s: string): string[] =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

export function ReviewEditForm({ open, onClose, review }: Props) {
  const [company, setCompany] = useState('');
  const [jobPosition, setJobPosition] = useState('');
  const [stage, setStage] = useState('');
  const [questions, setQuestions] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [strengths, setStrengths] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCompany(review.company ?? '');
    setJobPosition(review.jobPosition ?? '');
    setStage(review.interviewStage ?? '');
    setQuestions(review.questions.join('\n'));
    setMistakes(review.mistakes.join('\n'));
    setStrengths(review.strengths.join('\n'));
  }, [open, review]);

  const handleSave = async () => {
    if (!review.id || saving) return;
    setSaving(true);
    try {
      await updateReview(review.id, {
        company: company.trim() || undefined,
        jobPosition: jobPosition.trim() || undefined,
        interviewStage: stage.trim() || undefined,
        questions: splitLines(questions),
        mistakes: splitLines(mistakes),
        strengths: splitLines(strengths),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const textareaClass =
    'w-full rounded-card border border-line bg-card px-3 py-2 text-body-ui text-ink outline-none placeholder:text-ink-mute focus:border-brand';

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex max-h-[80dvh] flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-h3 text-ink">编辑复盘</h3>
          <Button size="md" onClick={handleSave} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </Button>
        </div>

        <div className="scroll-soft flex flex-col gap-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-mini text-ink-soft">公司</label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value.slice(0, 30))}
                placeholder="可不填"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-mini text-ink-soft">岗位</label>
              <Input
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value.slice(0, 30))}
                placeholder="可不填"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-mini text-ink-soft">轮次</label>
            <Input
              list="review-stage-options"
              value={stage}
              onChange={(e) => setStage(e.target.value.slice(0, 20))}
              placeholder="一面 / 二面 / HR 面…"
            />
            <datalist id="review-stage-options">
              <option value="一面" />
              <option value="二面" />
              <option value="三面" />
              <option value="HR 面" />
              <option value="群面" />
              <option value="终面" />
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="block text-mini text-ink-soft">
              被问到的（一行一条）
            </label>
            <textarea
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              rows={3}
              placeholder="自我介绍&#10;Java 并发了解吗"
              className={textareaClass}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-mini text-ink-soft">
              卡住的点（一行一条）
            </label>
            <textarea
              value={mistakes}
              onChange={(e) => setMistakes(e.target.value)}
              rows={3}
              placeholder="反问环节没准备&#10;算法题超时"
              className={textareaClass}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-mini text-ink-soft">
              答得不错（一行一条）
            </label>
            <textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={3}
              placeholder="项目背景说得清&#10;手撕代码思路对"
              className={textareaClass}
            />
          </div>

          <p className="pb-2 text-mini text-ink-mute">
            保存后小本本里这条会标记为「我编辑过」。
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
