'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { setCurrentPet, type PetType } from '@/lib/db';
import { PETS } from '@/lib/pets';
import { cn } from '@/lib/utils';

interface Props {
  onDone: () => void;
}

const OPTIONS: { type: PetType; tag: string }[] = [
  { type: 'cat', tag: '慵懒型' },
  { type: 'dog', tag: '陪伴型' },
];

export function PetSelectScreen({ onDone }: Props) {
  const [selected, setSelected] = useState<PetType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEnter = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      await setCurrentPet(selected);
      onDone();
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col px-5 py-10">
      <p className="mb-8 text-center text-body-ui text-ink-soft">
        选一只想暂时靠着的小动物
      </p>

      <div className="grid flex-1 grid-cols-2 gap-4 content-center">
        {OPTIONS.map(({ type, tag }) => {
          const profile = PETS[type];
          const isSelected = selected === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setSelected(type)}
              className={cn(
                'flex flex-col items-center gap-3 rounded-card bg-card p-4 transition-all duration-soft ease-soft',
                isSelected
                  ? 'border-[2px] border-brand shadow-soft-lg scale-[1.02]'
                  : 'border-[1.5px] border-line shadow-soft-md',
              )}
            >
              {/* 精灵动画：与聊天页 PetStage 同款 */}
              <div
                role="img"
                aria-label={profile.name}
                className="sprite-anim aspect-square w-full bg-no-repeat"
                style={{
                  backgroundImage: `url(${profile.sprites.idle})`,
                  backgroundSize: '300% 200%',
                  animationDuration: '2400ms',
                }}
              />
              <div className="text-h3 text-ink">{profile.name}</div>
              <span className="inline-block rounded-[12px] bg-brand-soft px-3 py-1 text-caption text-chip-warm">
                {tag}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <Button
          size="lg"
          fullWidth
          disabled={!selected || submitting}
          onClick={handleEnter}
        >
          {submitting ? '...' : '进入小窝'}
        </Button>
      </div>
    </div>
  );
}
