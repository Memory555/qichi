'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { currentMonthKey, readSummaryCache } from '@/lib/monthly';

/**
 * 当月"去看月度总结"提示条的显隐逻辑。
 *
 * 显示条件（同时满足）：
 *   1. 当月用户消息数 ≥ 5（避免新月份立刻就提）
 *   2. 当月 summary 缓存为空（没生成过）
 *   3. 用户本月没手动关掉
 *
 * 用户跳到 /curve 让 MonthlySummaryCard 把缓存写好之后再回到聊天页，
 * 通过 focus / storage 事件触发重算让 banner 自然消失。
 */
const DISMISS_KEY = (m: string) => `qichi:monthly-hint-dismissed:${m}`;
const MIN_MESSAGES = 5;

export function useMonthlyHint(): { show: boolean; dismiss: () => void } {
  const monthKey = currentMonthKey();

  const monthUserMsgCount = useLiveQuery(async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
    ).getTime();
    return db.messages
      .where('createdAt')
      .between(monthStart, monthEnd)
      .filter((m) => m.role === 'user')
      .count();
  }, []) ?? 0;

  const [show, setShow] = useState(false);

  useEffect(() => {
    const compute = () => {
      if (monthUserMsgCount < MIN_MESSAGES) {
        setShow(false);
        return;
      }
      if (readSummaryCache()) {
        setShow(false);
        return;
      }
      if (
        typeof window !== 'undefined' &&
        window.localStorage.getItem(DISMISS_KEY(monthKey))
      ) {
        setShow(false);
        return;
      }
      setShow(true);
    };

    compute();

    // 用户去曲线生成完总结再切回来，靠 focus / storage 重算
    const onChange = () => compute();
    window.addEventListener('focus', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('focus', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [monthKey, monthUserMsgCount]);

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY(monthKey), '1');
    }
    setShow(false);
  };

  return { show, dismiss };
}
