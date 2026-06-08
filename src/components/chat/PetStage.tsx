'use client';

import { motion } from 'framer-motion';
import { PETS } from '@/lib/pets';
import type { PetType, PetPose } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  pet: PetType;
  pose: PetPose;
  className?: string;
}

const CYCLE_MS: Record<PetPose, number> = {
  sleep: 3200, // 趴睡呼吸节奏（慢于 idle，更深沉）
  idle: 2400,
  listen: 1500,
  empathy: 2000,
};

/**
 * 宠物舞台。
 *
 * - 精灵图本身用 CSS `.sprite-anim` 跳 6 帧（详见 globals.css）
 * - 姿态切换（sleep / idle / listen / empathy）由 Framer Motion 用 key 变化
 *   做交叉淡入（opacity 0.5 → 1，约 200ms），避免硬切
 */
export function PetStage({ pet, pose, className }: Props) {
  const profile = PETS[pet];
  const src = profile.sprites[pose];
  const cycleMs = CYCLE_MS[pose];

  return (
    <div className={cn('relative mx-auto h-56 w-56', className)}>
      <motion.div
        key={`${pet}-${pose}`}
        role="img"
        aria-label={profile.name}
        initial={{ opacity: 0.4, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="sprite-anim absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: '300% 200%',
          animationDuration: `${cycleMs}ms`,
        }}
      />
    </div>
  );
}
