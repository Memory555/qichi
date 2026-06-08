'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MoodPoint } from '@/hooks/useEmotionTimeline';

interface Props {
  data: MoodPoint[];
}

const ANCHORS = [
  { y: 8, label: '雀跃' },
  { y: 5, label: '平静' },
  { y: 2, label: '低落' },
];

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: MoodPoint;
}) {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined) return null;
  // 波动大的日子（min/max 差 ≥ 3）画双圈，提示有起伏
  const volatile =
    payload && payload.count > 1 && payload.max - payload.min >= 3;
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#F5A65B" />
      {volatile && (
        <circle
          cx={cx}
          cy={cy}
          r={7}
          fill="none"
          stroke="#F5A65B"
          strokeWidth={1}
          opacity={0.5}
        />
      )}
    </g>
  );
}

function CustomTooltip(props: {
  active?: boolean;
  payload?: Array<{ payload: MoodPoint }>;
}) {
  if (!props.active || !props.payload?.length) return null;
  const d = props.payload[0].payload;
  return (
    <div className="rounded-card border border-line bg-card px-3 py-2 text-caption text-ink shadow-soft-md">
      <div className="font-medium">{d.label}</div>
      <div className="mt-0.5">心境分 {d.score.toFixed(1)}</div>
      {d.count > 1 && (
        <div className="text-mini text-ink-mute">
          {d.count} 条 · 这天在 {d.min.toFixed(1)} ~ {d.max.toFixed(1)} 之间起伏
        </div>
      )}
      {d.count === 1 && (
        <div className="text-mini text-ink-mute">仅 1 条记录</div>
      )}
    </div>
  );
}

export function MoodChart({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 16, right: 16, bottom: 16, left: 36 }}
        >
          <XAxis
            dataKey="label"
            tick={{ fill: '#C9BAA8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[2, 5, 8]}
            tick={(p: { x: number; y: number; payload: { value: number } }) => {
              const anchor = ANCHORS.find((a) => a.y === p.payload.value);
              return (
                <text
                  x={p.x}
                  y={p.y}
                  dx={-8}
                  dy={4}
                  textAnchor="end"
                  fill="#9C8472"
                  fontSize={11}
                >
                  {anchor?.label ?? ''}
                </text>
              );
            }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={6.5} stroke="#F0E2C9" strokeDasharray="3 3" />
          <ReferenceLine y={3.5} stroke="#F0E2C9" strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#F5A65B"
            strokeWidth={1.5}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#E8893A' }}
            connectNulls={false}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
