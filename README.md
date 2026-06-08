# 栖迟（qichi）· 项目说明

> **一句话**：栖迟 —— 给求职路上的人一个暂时停靠的地方。
>
> 一只小动物（栖栖橘猫 / 迟迟柴犬，二选一）陪你倾诉面试糟心事；它默默把你说的面经悄悄归档，但永远先共情你的情绪，不催促、不打分。

---

## 1. 项目性质

- **类型**：Vibe Coding 实践项目（自用 + 小范围朋友试用）
- **形态**：Web 端（移动端优先，PC 居中显示）
- **隐私**：本地优先（IndexedDB），数据不出本地

---

## 2. 技术栈

| 层 | 选型 |
|----|------|
| 框架 | **Next.js 15 + React 19 + TypeScript** |
| 样式 | **Tailwind CSS 3.4** + 自定义 Token |
| 动画 | **Framer Motion** |
| 图表 | **Recharts** |
| 存储 | **IndexedDB（Dexie.js）** |
| LLM | **OpenAI GPT（openai SDK，gpt-4o + gpt-4o-mini）** |
| 部署 | **Vercel** |
| 字体 | **OPPO Sans** + Quicksand / Comfortaa |

---

## 3. 目录总览

```
qichi/
├── public/                    ← 静态资产（部署）
│   ├── font/                  ← OPPO Sans 三档（TTF + WOFF2）
│   ├── pets/                  ← 8 张精灵图（猫狗 × 4 姿态）
│   ├── icons/
│   │   ├── tab/               ← Tab Bar 4 个 + active 态
│   │   ├── action/            ← 操作类 8 个（含 detail/hide/look）
│   │   ├── deco/              ← 装饰类 9 个（云/月/猫爪/狗爪）
│   │   └── pet/               ← 头像版 2 个
│   ├── brand/                 ← 「栖迟」艺术字
│   ├── background/            ← 整页背景图（欢迎/聊天/设置 3 张）✨
│   ├── favicon/               ← 全套切图 + webmanifest
│   └── design-refs/           ← 设计参考稿（不参与代码，仅供 AI 工具喂图）
│
├── src/
│   ├── app/                   ← Next.js App Router
│   │   ├── globals.css        ← 字体 + 全局样式 + 精灵/粒子/飘动 keyframes
│   │   ├── layout.tsx         ← 根布局（字体 + favicon）
│   │   ├── page.tsx           ← 主路由（DB dispatcher）
│   │   ├── onboarding/        ← 欢迎流（欢迎屏 + 选宠物屏）
│   │   ├── about/             ← 关于栖迟 + 彩蛋页 ✨
│   │   ├── reset/             ← 调试：清空数据回引导 ✨
│   │   ├── seed/              ← 调试：一键灌入示例数据 ✨
│   │   ├── (main)/            ← 带 TabBar 的路由组
│   │   │   ├── chat/          ← 聊天主页
│   │   │   ├── notebook/      ← 小本本
│   │   │   ├── curve/         ← 心境曲线
│   │   │   └── settings/      ← 我（设置页）
│   │   └── api/               ← /translate /extract /monthly
│   ├── components/
│   │   ├── layout/            ← AppShell/AppBar/TabBar/DecorBackground/Particles/BgImage ✨
│   │   ├── ui/                ← Button/Input/Card/Chip/Icon/BottomSheet/Dialog
│   │   ├── chat/              ← PetStage/MessageBubble/MessageList/MessageInput
│   │   ├── onboarding/        ← WelcomeScreen/PetSelectScreen
│   │   ├── notebook/          ← ReviewCard/ReviewDetail
│   │   └── curve/             ← MoodChart/MonthlySummaryCard
│   ├── hooks/
│   │   ├── useCurrentPet.ts
│   │   ├── useMessages.ts
│   │   ├── useReviews.ts      ← 支持 includeHidden
│   │   ├── useEmotionTimeline.ts  ← 返回 score/min/max/count
│   │   └── useRecentEmotion.ts    ← 5 分钟窗口驱动姿态
│   ├── lib/
│   │   ├── db.ts              ← IndexedDB schema（Dexie）+ 友好导出
│   │   ├── llm.ts             ← OpenAI 封装（AbortController 30s 超时）
│   │   ├── prompts.ts         ← 5 套 Prompt + memo 缓存
│   │   ├── pets.ts            ← 宠物配置中心
│   │   ├── assets.ts          ← 静态资源（icons/brand/favicon/backgrounds/fonts）
│   │   ├── messages.ts        ← addUserMessage/addPetMessage/setPetTranslation
│   │   ├── emotions.ts        ← addEmotion
│   │   ├── reviews.ts         ← addReview/setReviewHidden/deleteReview（级联）
│   │   ├── monthly.ts         ← 月度数据聚合 + localStorage 缓存
│   │   ├── seed.ts            ← 调试种子数据 ✨
│   │   └── utils.ts           ← cn() / random helpers
│   └── types/
│       └── index.ts           ← 共享类型 + resolvePetPose() 状态机
│
├── package.json
├── tailwind.config.ts         ← Design Token + 动画 keyframes
├── postcss.config.js
├── next.config.mjs
├── tsconfig.json
├── .env.example               ← OPENAI_API_KEY + OPENAI_BASE_URL（代理可选）
├── .gitignore
│
└── 文档/
    ├── 栖迟-阶段1-想法验证.md
    ├── 栖迟-阶段2-MVP定义.md
    ├── 栖迟-阶段3-设计总体.md
    ├── 栖迟-阶段3-Prompt设计.md
    ├── 栖迟-视觉风格说明.md
    ├── 栖迟-UI功能说明.md
    ├── 栖迟-界面生成提示词.md
    ├── 项目说明.md             ← 本文件
    ├── 技术方案.md
    ├── 开发步骤.md
    └── 阶段A-F验收说明.md      ← 实施验收清单 ✨
```

---

## 4. 文档索引（按阅读顺序）

| 顺序 | 文档 | 一句话定位 |
|------|------|----------|
| 1 | [栖迟-阶段1-想法验证.md](栖迟-阶段1-想法验证.md) | 这是个什么、给谁用、值不值得做 |
| 2 | [栖迟-阶段2-MVP定义.md](栖迟-阶段2-MVP定义.md) | MVP 范围、P0/P1/P2 功能优先级、6 阶段节奏 |
| 3 | [栖迟-阶段3-设计总体.md](栖迟-阶段3-设计总体.md) | IA、用户流程、关键页低保真、宠物 IP 规范 |
| 4 | [栖迟-视觉风格说明.md](栖迟-视觉风格说明.md) | 颜色 / 字体 / 圆角 / 阴影 / 图标 / 控件规范 |
| 5 | [栖迟-UI功能说明.md](栖迟-UI功能说明.md) | 每个页面的功能、布局、交互、数据来源、文案 |
| 6 | [栖迟-阶段3-Prompt设计.md](栖迟-阶段3-Prompt设计.md) | 5 套 LLM Prompt + 调用时序 + 失败兜底 |
| 7 | [栖迟-界面生成提示词.md](栖迟-界面生成提示词.md) | 5 张关键页 AI 出图 prompt（已用） |
| 8 | **[技术方案.md](技术方案.md)** | **架构、数据流、API、性能、安全** |
| 9 | **[开发步骤.md](开发步骤.md)** | **6 阶段 A-F 的逐步实施清单** |
| 10 | **[阶段A-F验收说明.md](阶段A-F验收说明.md)** | **每个阶段的验收清单 + 故障排查 + 综合冒烟** |

---

## 5. 启动命令

```bash
# 一次性
npm install
cp .env.example .env.local      # 填入 OPENAI_API_KEY

# 日常
npm run dev                      # 开发模式
npm run build                    # 生产构建
npm run start                    # 生产启动
npm run typecheck                # 类型检查
npm run lint                     # ESLint
```

---

## 6. 几个不变的约束

| 类型 | 约束 |
|------|------|
| **隐私** | 倾诉数据默认存本地，不上传 |
| **气质** | 文案不出现：加油 / 你可以的 / 必胜 / 上岸 / 振作 / 别难过 / 想开点 / 成功率 |
| **交互** | 宠物默认只发"喵～/汪～"，用户点翻译才看人话 |
| **复盘** | AI 抽取的面试信息不主动展示，进"小本本"才可见 |
| **宠物名字** | 橘猫固定 **栖栖**、柴犬固定 **迟迟**，不可改名 |

---

## 7. 当前进度

| 阶段 | 状态 |
|------|------|
| 阶段 1 想法验证 | ✅ |
| 阶段 2 MVP 定义 | ✅ |
| 阶段 3 设计 | ✅（所有素材就绪 + 3 张整页背景图） |
| 阶段 4 开发 | ✅ A → F 全通过 |
| 阶段 5 发布 | ⏳ 等 Vercel 部署 |
| 阶段 6 迭代 | ⏳ 等朋友试用反馈 |

详细开发步骤见 [开发步骤.md](开发步骤.md)，每阶段验收方法见 [阶段A-F验收说明.md](阶段A-F验收说明.md)。

### 已实现的能力快照

- ✅ 选宠物（橘猫栖栖 / 柴犬迟迟）+ 整页背景图欢迎流
- ✅ 跟宠物聊天 + 主动点翻译看共情人话（OpenAI gpt-4o，可走 chatanywhere 代理）
- ✅ 静默抽取情绪 + 面试要素到本地 IndexedDB
- ✅ 小本本：复盘卡列表 / 详情 / 隐藏-恢复 / 删除（删除级联到情绪曲线）
- ✅ 心境曲线：日均折线 + tooltip 显示 min/max/count + 双圈标记波动日 + 月度网友体总结
- ✅ 宠物姿态自动切换（打字→listen，情绪低→empathy）+ 200ms 平滑过渡
- ✅ 设置页：换宠物 / 导出 JSON / 输入"确认"清空 / 彩蛋页
- ✅ 视觉：背景图（welcome/chat/settings） + 动画装饰（notebook/curve） + 全局粒子层 + 气泡渐变 + backdrop-blur
- ✅ 调试入口：`/reset` 清空 / `/seed` 灌种子数据
