'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import {
  addInterview,
  updateInterview,
  type NewInterview,
} from '@/lib/interviews';
import type { Interview } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  /** 编辑模式传入；不传则是新增 */
  initial?: Interview;
  /** 新增时的默认日期 YYYY-MM-DD（一般是当前在日历选中的格子） */
  defaultDate?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toDateInput = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const toTimeInput = (ts: number) => {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const STAGE_OPTIONS = [
  '一面',
  '二面',
  '三面',
  'HR 面',
  '群面',
  '终面',
];

/**
 * 面试日程表单（v2.1）。
 *
 * 用同一个 Dialog 兼顾新增 / 编辑：
 * - 传 `initial` → 编辑模式，预填字段并调 updateInterview
 * - 不传 → 新增模式，调 addInterview
 *
 * 字段：日期（必填）/ 时间 / 公司 / 岗位 / 轮次 / 备注
 */
export function InterviewForm({ open, onClose, initial, defaultDate }: Props) {
  const isEdit = !!initial;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [company, setCompany] = useState('');
  const [jobPosition, setJobPosition] = useState('');
  const [stage, setStage] = useState('');
  const [notes, setNotes] = useState('');

  // open 跳变时同步表单：编辑→initial，新增→defaultDate
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setDate(toDateInput(initial.scheduledAt));
      setTime(toTimeInput(initial.scheduledAt));
      setCompany(initial.company ?? '');
      setJobPosition(initial.jobPosition ?? '');
      setStage(initial.interviewStage ?? '');
      setNotes(initial.notes ?? '');
    } else {
      setDate(defaultDate ?? toDateInput(Date.now()));
      setTime('');
      setCompany('');
      setJobPosition('');
      setStage('');
      setNotes('');
    }
  }, [open, initial, defaultDate]);

  const canSave = !!date;

  const handleConfirm = async () => {
    if (!canSave) return;
    // 组合 scheduledAt：date 必填，time 不填默认 09:00
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = (time || '09:00').split(':').map(Number);
    const scheduledAt = new Date(y, m - 1, d, hh, mm).getTime();

    const fields: NewInterview = {
      scheduledAt,
      company: company.trim() || undefined,
      jobPosition: jobPosition.trim() || undefined,
      interviewStage: stage.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (isEdit && initial?.id) {
      await updateInterview(initial.id, fields);
    } else {
      await addInterview(fields);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑面试日程' : '添加面试日程'}
      confirmLabel="保存"
      confirmDisabled={!canSave}
      onConfirm={handleConfirm}
      body={
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-mini text-ink-soft">日期</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-mini text-ink-soft">时间</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:00"
              />
            </div>
          </div>

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

          <div className="space-y-1">
            <label className="block text-mini text-ink-soft">轮次</label>
            <Input
              list="interview-stage-options"
              value={stage}
              onChange={(e) => setStage(e.target.value.slice(0, 20))}
              placeholder="一面 / 二面 / HR 面…"
            />
            <datalist id="interview-stage-options">
              {STAGE_OPTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="block text-mini text-ink-soft">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              rows={2}
              placeholder="想准备的方向、面试官信息…"
              className="w-full rounded-card border border-line bg-card px-3 py-2 text-body-ui text-ink outline-none placeholder:text-ink-mute focus:border-brand"
            />
          </div>
        </div>
      }
    />
  );
}
