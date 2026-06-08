/**
 * 栖迟 · 宠物配置中心
 *
 * 所有"按宠物切换"的运行时数据（名字 / 叫声 / 精灵图 / 头像 / 爪印 /
 * system prompt / few-shot）集中在 PETS 一张表里。
 *
 * 加新宠物 = 在 PETS 加一行；无需散弹改 db/prompts/llm/assets。
 */

import type { PetType, PetName } from './db';
import type { PetPose } from '@/types';
import {
  buildCatSystemPrompt,
  buildDogSystemPrompt,
  CAT_FEW_SHOT,
  DOG_FEW_SHOT,
  type FewShotExample,
} from './prompts';

export interface PetProfile {
  /** 固定名字（不可改） */
  name: PetName;
  /** 默认叫声（聊天气泡首句） */
  call: string;
  /** 各姿态精灵图 URL */
  sprites: Record<PetPose, string>;
  /** 顶部条 / 设置页头像图标 URL */
  avatar: string;
  /** 聊天背景浮动爪印素材 URL 列表 */
  paws: readonly string[];
  /** P1 共情对话 system prompt 构建器 */
  buildSystemPrompt: (name: PetName) => string;
  /** P1 few-shot 示例 */
  fewShot: ReadonlyArray<FewShotExample>;
}

export const PETS: Record<PetType, PetProfile> = {
  cat: {
    name: '栖栖',
    call: '喵～',
    sprites: {
      sleep: '/pets/cat-sleep.png',
      idle: '/pets/cat-idle.png',
      listen: '/pets/cat-listen.png',
      empathy: '/pets/cat-empathy.png',
    },
    avatar: '/icons/pet/cat.svg',
    paws: [
      '/icons/deco/paw-cat-1.svg',
      '/icons/deco/paw-cat-2.svg',
      '/icons/deco/paw-cat-3.svg',
    ],
    buildSystemPrompt: buildCatSystemPrompt,
    fewShot: CAT_FEW_SHOT,
  },
  dog: {
    name: '迟迟',
    call: '汪～',
    sprites: {
      sleep: '/pets/dog-sleep.png',
      idle: '/pets/dog-idle.png',
      listen: '/pets/dog-listen.png',
      empathy: '/pets/dog-empathy.png',
    },
    avatar: '/icons/pet/dog.svg',
    paws: [
      '/icons/deco/paw-dog-1.svg',
      '/icons/deco/paw-dog-2.svg',
    ],
    buildSystemPrompt: buildDogSystemPrompt,
    fewShot: DOG_FEW_SHOT,
  },
};
