/**
 * 一次性脚本：把 public/pets/ 下的 3×2 精灵图切成 6 张独立 PNG。
 *
 * 用法：
 *   cd qichi
 *   npm install --save-dev sharp
 *   node scripts/split-sprites.mjs
 *
 * 输出文件命名：cat-idle-1.png ~ cat-idle-6.png（行优先：左上=1，右下=6）
 * 原文件保留，不删除。
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

const PETS_DIR = 'public/pets';
const OUT_DIR = 'public/pets/frames';

async function splitOne(file) {
  const input = join(PETS_DIR, file);
  const stem = basename(file, extname(file));

  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    console.warn(`  ⚠️  无法读取尺寸: ${file}`);
    return;
  }
  const frameW = Math.floor(meta.width / 3);
  const frameH = Math.floor(meta.height / 2);

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col + 1; // 1~6
      const outFile = join(OUT_DIR, `${stem}-${idx}.png`);
      await sharp(input)
        .extract({
          left: col * frameW,
          top: row * frameH,
          width: frameW,
          height: frameH,
        })
        .toFile(outFile);
      process.stdout.write(`  · ${outFile}\n`);
    }
  }
}

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });
  const all = await readdir(PETS_DIR);
  const sprites = all.filter(
    (f) => f.endsWith('.png') && !f.includes('-') === false, // cat-idle.png 等
  );
  console.log(`找到 ${sprites.length} 张精灵图，开始切分到 ${OUT_DIR}/`);
  for (const file of sprites) {
    if (file.startsWith('frames')) continue;
    console.log(`▶ ${file}`);
    await splitOne(file);
  }
  console.log('✅ 完成');
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
