import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Props {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}

/** 包一层 next/image 的 SVG 图标，统一尺寸 + 默认占位 alt */
export function Icon({ src, alt = '', size = 24, className }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('inline-block select-none', className)}
      priority={false}
    />
  );
}
