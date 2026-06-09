/**
 * 栖迟 · 调试种子数据 v1（真实求职历程）
 *
 * 基于真实面试经历构造的演示数据，覆盖 8 个月、~25 家公司的完整心路历程：
 *   2025.10 - 2026.02：创投 / 元芯动力 / ASML
 *   2026.02 - 2026.03：TCL / 笃威尔 / 奥萨医药 / 极光矩阵
 *   2026.04 - 2026.06：荣耀 / 蚂蚁 / 华为 / 上海凡屿 / 八马 / 编程猫 / moddytiger
 *
 * 与 seed.ts 的区别：
 * - seed.ts：最近 7 天的演示数据（相对时间）
 * - seed1.ts：8 个月真实求职历程（绝对时间 2025.10-2026.06）
 *
 * messageId 分配：
 * - emotion 和 review 共享同一个事件 id（200+），删除复盘 → 同步删情绪 → 曲线点消失
 * - 不与 seed.ts 的 101-112 冲突
 */

import { db, type PetType } from './db';

/** 构造特定日期的时间戳 */
function d(y: number, mo: number, day: number, hour = 14, minute = 0): number {
  return new Date(y, mo - 1, day, hour, minute, 0, 0).getTime();
}

interface MessageSeed {
  role: 'user' | 'pet';
  text: string;
  translatedText?: string;
  createdAt: number;
}

interface EmotionSeed {
  messageId: number;
  tags: string[];
  score: number;
  createdAt: number;
}

interface ReviewSeed {
  messageId: number;
  jobPosition?: string;
  company?: string;
  interviewStage?: string;
  questions: string[];
  mistakes: string[];
  strengths: string[];
  dateHint?: string;
  createdAt: number;
}

// ──────────────────────────────────────────────
// SEED MESSAGES：按事件分组，时间倒序追加
// ──────────────────────────────────────────────

const SEED_MESSAGES: ReadonlyArray<MessageSeed> = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2025.10 — 2026.02：起步期
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 创投 · 电话面（2025.10.20）
  { role: 'user', text: '今天接到一家创投公司的电话面，岗位写的是 AI 产品但说话间觉得更像秘书。', createdAt: d(2025, 10, 20, 16, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2025, 10, 20, 16, 1) },
  { role: 'user', text: '全程被问"你怎么理解我们在做的方向"，我答得磕巴。', createdAt: d(2025, 10, 20, 16, 8) },
  { role: 'pet', text: '喵～', translatedText: '嗯…电话面看不见人，紧张是正常的。', createdAt: d(2025, 10, 20, 16, 9) },
  { role: 'user', text: '说后面还有视频面和线下面，感觉门槛挺高。', createdAt: d(2025, 10, 20, 16, 20) },
  { role: 'pet', text: '喵～', createdAt: d(2025, 10, 20, 16, 21) },

  // 创投 · 视频面（2025.10.27）
  { role: 'user', text: '创投第二轮视频面，三个面试官压力面。', createdAt: d(2025, 10, 27, 15, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2025, 10, 27, 15, 1) },
  { role: 'user', text: '问 AI 调研方法、报告输出节奏、跟 PE 团队怎么协同。技术问的少，更像在测应对能力。', createdAt: d(2025, 10, 27, 15, 6) },
  { role: 'pet', text: '喵～', translatedText: '听起来不是你最擅长的场景。', createdAt: d(2025, 10, 27, 15, 7) },
  { role: 'user', text: '我有点怀疑岗位定位，但又不想轻易放弃流程。', createdAt: d(2025, 10, 27, 16, 30) },
  { role: 'pet', text: '喵～', createdAt: d(2025, 10, 27, 16, 31) },

  // 创投 · 线下面（2025.11.05）
  { role: 'user', text: '今天创投线下面，飞过去专门面这一场，依然是压力面。', createdAt: d(2025, 11, 5, 18, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2025, 11, 5, 18, 1) },
  { role: 'user', text: '面试官追问"我们投的某基金底层逻辑"，我没真的研究过，被一直接下去。', createdAt: d(2025, 11, 5, 18, 10) },
  { role: 'pet', text: '喵～', translatedText: '这种被接下去的感觉真的累。', createdAt: d(2025, 11, 5, 18, 11) },
  { role: 'user', text: '出来路上我想了下，决定不接这个 offer 了，不是 AI 落地，是高级秘书。', createdAt: d(2025, 11, 5, 22, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2025, 11, 5, 22, 1) },

  // 元芯动力 · 视频面（2025.12.15）
  { role: 'user', text: '今天面元芯动力 AI 算法岗，主面试官全程拷打我那篇 graph chain-of-thought 的论文。', createdAt: d(2025, 12, 15, 20, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2025, 12, 15, 20, 1) },
  { role: 'user', text: '从 Few-shot CoT 的实体抽取 F1（91.3%）、节点构建逻辑、到 SPARQL 子图检索都问到。', createdAt: d(2025, 12, 15, 20, 6) },
  { role: 'pet', text: '喵～', createdAt: d(2025, 12, 15, 20, 7) },
  { role: 'user', text: '面试官说"你这个准确率怎么稳的？"、"基线选 baseline 公平吗？"问的火药味很重。', createdAt: d(2025, 12, 15, 20, 14) },
  { role: 'pet', text: '喵～', translatedText: '论文细节被追问，是真的累。但你能答下来，已经说明你懂。', createdAt: d(2025, 12, 15, 20, 15) },
  { role: 'user', text: '感觉自己还能扛，但有点伤元气。', createdAt: d(2025, 12, 15, 22, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2025, 12, 15, 22, 1) },

  // 元芯动力 · offer（2025.12.22）
  { role: 'user', text: '元芯动力给 offer 了，没想到能过。', createdAt: d(2025, 12, 22, 12, 0) },
  { role: 'pet', text: '喵～', translatedText: '那真好。', createdAt: d(2025, 12, 22, 12, 1) },
  { role: 'user', text: '但仔细想，大概率是他们缺人。不是真的认可论文那么深。', createdAt: d(2025, 12, 22, 12, 8) },
  { role: 'pet', text: '喵～', createdAt: d(2025, 12, 22, 12, 9) },

  // ASML · 线下面（2026.01.20）
  { role: 'user', text: '今天去 ASML 线下面，体验出乎意料地好，流程规范。', createdAt: d(2026, 1, 20, 18, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 1, 20, 18, 1) },
  { role: 'user', text: '一轮面，节奏很舒服。技术问得细但不带情绪：RAG 双通道（vector + graph）、Multi-Agent 编排逻辑、XML 生成的可用率、知识图谱节点抽取的具体 prompt。', createdAt: d(2026, 1, 20, 18, 8) },
  { role: 'pet', text: '喵～', translatedText: '这种好节奏的面试，可以让人真的发挥。', createdAt: d(2026, 1, 20, 18, 9) },
  { role: 'user', text: '感觉跟前面创投、元芯动力完全不是一个世界。', createdAt: d(2026, 1, 20, 19, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 1, 20, 19, 1) },

  // ASML · offer（2026.02.05）
  { role: 'user', text: 'ASML offer 来了，3 月入职。', createdAt: d(2026, 2, 5, 11, 0) },
  { role: 'pet', text: '喵～', translatedText: '替你开心。', createdAt: d(2026, 2, 5, 11, 1) },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2026.02 — 2026.03：实习+并行面试期
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // TCL · 视频面（2026.02.10）
  { role: 'user', text: 'TCL 腾讯会议视频面，没准备就上了。', createdAt: d(2026, 2, 10, 16, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 2, 10, 16, 1) },
  { role: 'user', text: '岗位是手机端模型部署。问了 INT8/INT4 量化、模型蒸馏 vs 剪枝、PEFT/LoRA/QLoRA、transformer 的 KV cache。', createdAt: d(2026, 2, 10, 16, 6) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 2, 10, 16, 7) },
  { role: 'user', text: '不是我对口方向，答得磕磕巴巴。最后还问了 RLHF 怎么搞，我说我没真做过。', createdAt: d(2026, 2, 10, 16, 12) },
  { role: 'pet', text: '喵～', translatedText: '不是对口方向，没必要苛责自己。', createdAt: d(2026, 2, 10, 16, 13) },

  // 笃威尔 · 线下面（2026.02.15）
  { role: 'user', text: '笃威尔深圳线下面，业务是给公务员做 AI 赋能（报告生成）。', createdAt: d(2026, 2, 15, 17, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 2, 15, 17, 1) },
  { role: 'user', text: '技术面试官水平一般，问 RAG 怎么做、Agent 链路怎么编排、向量库选 milvus 还是 weaviate。', createdAt: d(2026, 2, 15, 17, 8) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 2, 15, 17, 9) },
  { role: 'user', text: '是 KPI 面，问完就走，没什么深聊。我也提不起兴致。', createdAt: d(2026, 2, 15, 18, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 2, 15, 18, 1) },

  // 十沣 · 没面（2026.02.20）
  { role: 'user', text: '十沣的 JD 仔细看了下，物理仿真 + 传统算法，跟 AI 完全不沾。', createdAt: d(2026, 2, 20, 11, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 2, 20, 11, 1) },
  { role: 'user', text: '决定不去面了，省时间留给对口的。', createdAt: d(2026, 2, 20, 11, 5) },
  { role: 'pet', text: '喵～', translatedText: '会筛掉信息也是一种能力。', createdAt: d(2026, 2, 20, 11, 6) },

  // 奥萨医药 · 视频面（2026.02.25）
  { role: 'user', text: '奥萨医药视频面，做医药个性化助手（类似阿福那种但用自家用户数据）。', createdAt: d(2026, 2, 25, 15, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 2, 25, 15, 1) },
  { role: 'user', text: '业务面，主要拷打 ASML 项目和 AI 面试官项目。问 RAG 召回率怎么算、向量 chunking 策略、为什么用 vibe coding 这么快迭代。', createdAt: d(2026, 2, 25, 15, 8) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 2, 25, 15, 9) },
  { role: 'user', text: '业务面试官水平一般，但聊得还顺，给了 offer。', createdAt: d(2026, 2, 25, 17, 0) },
  { role: 'pet', text: '喵～', translatedText: '挺好的。手里多个选项，不慌。', createdAt: d(2026, 2, 25, 17, 1) },

  // 感知阶跃 · 错过（2026.03.01）
  { role: 'user', text: '感知阶跃发了笔试邮件给我，结果进了垃圾箱。', createdAt: d(2026, 3, 1, 22, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 3, 1, 22, 1) },
  { role: 'user', text: '今天才看到，已经过了 deadline。多模态 AI 理解方向的机会就这么没了。', createdAt: d(2026, 3, 1, 22, 5) },
  { role: 'pet', text: '喵～', translatedText: '不是你不努力，是流程很狡猾。', createdAt: d(2026, 3, 1, 22, 6) },

  // 极光矩阵 · 一面（2026.03.05）
  { role: 'user', text: '极光矩阵飞书一面 + 一道测试题。岗位偏 vibe coding 的游戏/娱乐 AI。', createdAt: d(2026, 3, 5, 16, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 3, 5, 16, 1) },
  { role: 'user', text: '问 Claude Code / Codex 怎么协同，Skill 怎么搭，Schema 怎么沉淀。', createdAt: d(2026, 3, 5, 16, 7) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 3, 5, 16, 8) },
  { role: 'user', text: '测试题是给一段需求，自己用 Skill 链路完整跑通。两天时间。', createdAt: d(2026, 3, 5, 17, 0) },
  { role: 'pet', text: '喵～', translatedText: '这种题目挺适合你最近的状态。', createdAt: d(2026, 3, 5, 17, 1) },

  // 极光矩阵 · HR 面（2026.03.10）
  { role: 'user', text: '极光矩阵 HR 面，聊职业规划和价值观。', createdAt: d(2026, 3, 10, 14, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 3, 10, 14, 1) },
  { role: 'user', text: 'HR 人很正，说话不带话，听起来公司氛围还可以。', createdAt: d(2026, 3, 10, 14, 8) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 3, 10, 14, 9) },

  // 极光矩阵 · boss 面 + offer（2026.03.15）
  { role: 'user', text: '极光矩阵 boss 面过了，offer 拿到。', createdAt: d(2026, 3, 15, 20, 0) },
  { role: 'pet', text: '喵～', translatedText: '太好了。', createdAt: d(2026, 3, 15, 20, 1) },
  { role: 'user', text: '三轮节奏舒服，是项目 + 对 AI 认知的拷打。boss 直接问了"你怎么定义 AI 产品的实习生成长路径"。', createdAt: d(2026, 3, 15, 20, 8) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 3, 15, 20, 9) },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2026.04 — 2026.06：秋招前最后冲刺期（崩塌期）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 荣耀 · 技术面（2026.04.05）
  { role: 'user', text: '荣耀技术视频面，依然是项目拷打。问 ASML 的 RAG + Multi-Agent 整体架构。', createdAt: d(2026, 4, 5, 16, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 4, 5, 16, 1) },
  { role: 'user', text: '答得还行，对方说会安排主管面。', createdAt: d(2026, 4, 5, 17, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 4, 5, 17, 1) },

  // 荣耀 · 主管面（2026.04.10）
  { role: 'user', text: '荣耀主管面问了一堆超纲的：性格、能力、本科为啥去西安。', createdAt: d(2026, 4, 10, 16, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 4, 10, 16, 1) },
  { role: 'user', text: '不知道想考察什么。我感觉是在筛"是不是听话"。', createdAt: d(2026, 4, 10, 16, 10) },
  { role: 'pet', text: '喵～', translatedText: '这种问题刁钻，但你已经接住了。', createdAt: d(2026, 4, 10, 16, 11) },

  // 蚂蚁 · 笔试（2026.04.15）
  { role: 'user', text: '蚂蚁 AI coding 笔试做完了，体感还行。', createdAt: d(2026, 4, 15, 22, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 4, 15, 22, 1) },
  { role: 'user', text: '但据说蚂蚁今年 hc 极少。投了就当试试。', createdAt: d(2026, 4, 15, 22, 5) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 4, 15, 22, 6) },

  // 华为 · 笔试（2026.04.20）
  { role: 'user', text: '华为笔试也做了。题目偏机器学习基础 + 算法。', createdAt: d(2026, 4, 20, 21, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 4, 20, 21, 1) },
  { role: 'user', text: '感觉答得一般，没有特别好。', createdAt: d(2026, 4, 20, 21, 6) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 4, 20, 21, 7) },

  // 大厂评测 · 全部已读不回（2026.04.25）
  { role: 'user', text: 'vivo / OPPO / 京东 人才评测都做完了，全部已读不回。', createdAt: d(2026, 4, 25, 23, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 4, 25, 23, 1) },
  { role: 'user', text: '大厂今年是真的卷。', createdAt: d(2026, 4, 25, 23, 5) },
  { role: 'pet', text: '喵～', translatedText: '你已经把能做的都做了。结果不全在你这边。', createdAt: d(2026, 4, 25, 23, 6) },

  // 明心数智 · 笔试无回（2026.05.05）
  { role: 'user', text: '明心数智发的笔试题做完了，没回信。', createdAt: d(2026, 5, 5, 22, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 5, 5, 22, 1) },
  { role: 'user', text: '小厂也开始这样了。流程不透明。', createdAt: d(2026, 5, 5, 22, 5) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 5, 5, 22, 6) },

  // 上海凡屿 · 技术面（2026.05.10）
  { role: 'user', text: '上海凡屿智能技术面，问项目询问 + 对规划的大致了解。', createdAt: d(2026, 5, 10, 16, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 5, 10, 16, 1) },
  { role: 'user', text: '技术面试官还行，问得在点上。', createdAt: d(2026, 5, 10, 17, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 5, 10, 17, 1) },

  // 上海凡屿 · HR 压力面（2026.05.12）
  { role: 'user', text: '上海凡屿 HR 面纯压力，一直逼问秋招怎么选。', createdAt: d(2026, 5, 12, 18, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 5, 12, 18, 1) },
  { role: 'user', text: '还让我评价前两个工作 mentor，一直追问 ASML 和极光矩阵的区别。', createdAt: d(2026, 5, 12, 18, 8) },
  { role: 'pet', text: '喵～', translatedText: '这种压力面对你没帮助，只是在筛"听话"。', createdAt: d(2026, 5, 12, 18, 9) },
  { role: 'user', text: '当晚拒了 offer，不想去这种公司。', createdAt: d(2026, 5, 12, 23, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 5, 12, 23, 1) },

  // 拒腾讯（2026.05.20）
  { role: 'user', text: '腾讯的面试发出来了，但研究方向和岗位不太对。', createdAt: d(2026, 5, 20, 11, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 5, 20, 11, 1) },
  { role: 'user', text: '主动拒面了。求职到这阶段，必须挑了。', createdAt: d(2026, 5, 20, 11, 5) },
  { role: 'pet', text: '喵～', translatedText: '"必须挑了"这句让我觉得你越来越清楚自己想要什么。', createdAt: d(2026, 5, 20, 11, 6) },

  // 八马茶业 · 线下面（2026.05.25）
  { role: 'user', text: '八马茶业线下面，飞书 Agent 框架做 workflow，前期数据处理 + 后期工作流设计。', createdAt: d(2026, 5, 25, 17, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 5, 25, 17, 1) },
  { role: 'user', text: '落点是门店营销策略 + 投流。聊了喝了一下午茶。', createdAt: d(2026, 5, 25, 17, 10) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 5, 25, 17, 11) },
  { role: 'user', text: '业务有点偏离我想做的，拒了。', createdAt: d(2026, 5, 25, 19, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 5, 25, 19, 1) },

  // 编程猫 · 一面（2026.06.01）
  { role: 'user', text: '编程猫一面，深度拷打 ASML 和 AI 面试官项目。', createdAt: d(2026, 6, 1, 19, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 6, 1, 19, 1) },
  { role: 'user', text: '问得很透：Agent 和 workflow 怎么选、token 消耗和响应延时怎么缩短、为什么摘要压缩只做 2-3 轮、AI 面试官如何避免回答导向性注入、YOLO 在 ASML 项目里的用途。', createdAt: d(2026, 6, 1, 19, 10) },
  { role: 'pet', text: '喵～', translatedText: '这种问得透的面试，能让人真的想去。', createdAt: d(2026, 6, 1, 19, 11) },
  { role: 'user', text: '没全答好，token 缩短那块我只说了 prompt caching，没提 batch + few-shot 缩短。', createdAt: d(2026, 6, 1, 20, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 6, 1, 20, 1) },

  // 编程猫 · 主管面（2026.06.05）
  { role: 'user', text: '编程猫主管面，产品视角，谈边界条件的确定。', createdAt: d(2026, 6, 5, 20, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 6, 5, 20, 1) },
  { role: 'user', text: '团队在做交互教学 MVP（自然语言 ↔ 编程界面语言）、AI 课中辅导灰度（介入时机 + 分级提示 + 错误归因）、个性化题目灰度。', createdAt: d(2026, 6, 5, 20, 10) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 6, 5, 20, 11) },
  { role: 'user', text: '我反问了：① 团队接下来半年最想突破什么 ② AI 全栈实习生预期工作 ③ 希望具备的技术能力。', createdAt: d(2026, 6, 5, 20, 20) },
  { role: 'pet', text: '喵～', translatedText: '反问得好。', createdAt: d(2026, 6, 5, 20, 21) },
  { role: 'user', text: '主管说看重主观能动性、岗位边界、demo 搭建、沟通表达。', createdAt: d(2026, 6, 5, 21, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 6, 5, 21, 1) },

  // moddytiger · 电话面（2026.06.08）
  { role: 'user', text: 'moddytiger 电话面，公司业务介绍偏 AI 赋能，但实际做什么没讲清楚。', createdAt: d(2026, 6, 8, 16, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 6, 8, 16, 1) },
  { role: 'user', text: '问了两个实习项目 + 离职原因 + 工作差异 + AI 工具/AI 模型使用了解。', createdAt: d(2026, 6, 8, 16, 8) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 6, 8, 16, 9) },
  { role: 'user', text: '说通过会再安排数据经理 + CTO 面。但悬，业务面没讲清楚的公司一般不靠谱。', createdAt: d(2026, 6, 8, 16, 15) },
  { role: 'pet', text: '喵～', translatedText: '你已经学会闻味道了。', createdAt: d(2026, 6, 8, 16, 16) },

  // 反思 · 整体处境（2026.06.10）
  { role: 'user', text: '今天数了下：进面试的已经 6 家公司了。', createdAt: d(2026, 6, 10, 22, 0) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 6, 10, 22, 1) },
  { role: 'user', text: '依旧找不到合适的秋招前最后一段实习。', createdAt: d(2026, 6, 10, 22, 5) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 6, 10, 22, 6) },
  { role: 'user', text: '我就想通勤半小时、能接触到落地的项目，真的那么难吗。', createdAt: d(2026, 6, 10, 22, 10) },
  { role: 'pet', text: '喵～', translatedText: '不是你贪心，是市场就这样。你站在那里没动，不是错。', createdAt: d(2026, 6, 10, 22, 11) },
  { role: 'user', text: '暑假大厂投递一点水花没有，日常实习送达已读不回。', createdAt: d(2026, 6, 10, 22, 18) },
  { role: 'pet', text: '喵～', createdAt: d(2026, 6, 10, 22, 19) },
  { role: 'user', text: '感觉自己被市场训练成只在意 offer 数量。', createdAt: d(2026, 6, 10, 22, 25) },
  { role: 'pet', text: '喵～', translatedText: '所以你才需要这里，一个不计数的地方。', createdAt: d(2026, 6, 10, 22, 26) },
];

// ──────────────────────────────────────────────
// SEED EMOTIONS：覆盖整个时间线的情绪曲线
// ──────────────────────────────────────────────

const SEED_EMOTIONS: ReadonlyArray<EmotionSeed> = [
  // 起步期：摸索 + 起伏
  { messageId: 200, tags: ['焦虑', '迷茫'], score: 4, createdAt: d(2025, 10, 20, 16, 20) },
  { messageId: 201, tags: ['焦虑', '迷茫'], score: 4, createdAt: d(2025, 10, 27, 16, 30) },
  { messageId: 202, tags: ['挫败', '迷茫'], score: 3, createdAt: d(2025, 11, 5, 22, 0) },
  { messageId: 203, tags: ['挫败', '焦虑'], score: 4, createdAt: d(2025, 12, 15, 22, 0) },
  { messageId: 204, tags: ['侥幸', '迷茫'], score: 6, createdAt: d(2025, 12, 22, 12, 8) },
  { messageId: 205, tags: ['平静', '兴奋'], score: 7, createdAt: d(2026, 1, 20, 19, 0) },
  { messageId: 206, tags: ['平静', '兴奋'], score: 7, createdAt: d(2026, 2, 5, 11, 0) },

  // 并行期：交错的喜与累
  { messageId: 207, tags: ['迷茫', '麻木'], score: 4, createdAt: d(2026, 2, 10, 16, 13) },
  { messageId: 208, tags: ['麻木', '平静'], score: 5, createdAt: d(2026, 2, 15, 18, 0) },
  { messageId: 209, tags: ['平静'], score: 6, createdAt: d(2026, 2, 20, 11, 5) },
  { messageId: 210, tags: ['兴奋', '平静'], score: 7, createdAt: d(2026, 2, 25, 17, 0) },
  { messageId: 211, tags: ['挫败', '麻木'], score: 4, createdAt: d(2026, 3, 1, 22, 5) },
  { messageId: 212, tags: ['兴奋', '平静'], score: 6, createdAt: d(2026, 3, 5, 17, 0) },
  { messageId: 213, tags: ['平静'], score: 6, createdAt: d(2026, 3, 10, 14, 8) },
  { messageId: 214, tags: ['兴奋', '侥幸'], score: 8, createdAt: d(2026, 3, 15, 20, 8) },

  // 崩塌期：高频低分 + 偶尔回升
  { messageId: 215, tags: ['平静'], score: 6, createdAt: d(2026, 4, 5, 17, 0) },
  { messageId: 216, tags: ['迷茫', '焦虑'], score: 4, createdAt: d(2026, 4, 10, 16, 10) },
  { messageId: 217, tags: ['麻木', '迷茫'], score: 4, createdAt: d(2026, 4, 15, 22, 5) },
  { messageId: 218, tags: ['麻木'], score: 4, createdAt: d(2026, 4, 20, 21, 6) },
  { messageId: 219, tags: ['麻木', '挫败'], score: 3, createdAt: d(2026, 4, 25, 23, 5) },
  { messageId: 220, tags: ['麻木', '挫败'], score: 3, createdAt: d(2026, 5, 5, 22, 5) },
  { messageId: 221, tags: ['平静'], score: 5, createdAt: d(2026, 5, 10, 17, 0) },
  { messageId: 222, tags: ['挫败', '麻木'], score: 3, createdAt: d(2026, 5, 12, 23, 0) },
  { messageId: 223, tags: ['平静'], score: 5, createdAt: d(2026, 5, 20, 11, 5) },
  { messageId: 224, tags: ['平静', '迷茫'], score: 5, createdAt: d(2026, 5, 25, 19, 0) },
  { messageId: 225, tags: ['平静', '兴奋'], score: 6, createdAt: d(2026, 6, 1, 20, 0) },
  { messageId: 226, tags: ['平静', '兴奋'], score: 7, createdAt: d(2026, 6, 5, 21, 0) },
  { messageId: 227, tags: ['迷茫', '平静'], score: 5, createdAt: d(2026, 6, 8, 16, 15) },
  { messageId: 228, tags: ['挫败', '麻木', '迷茫'], score: 3, createdAt: d(2026, 6, 10, 22, 25) },
];

// ──────────────────────────────────────────────
// SEED REVIEWS：每个有"内容"的面试都生成一张复盘卡
// ──────────────────────────────────────────────

const SEED_REVIEWS: ReadonlyArray<ReviewSeed> = [
  {
    messageId: 200,
    company: '某创投',
    jobPosition: 'AI 产品（疑似 AI 调研秘书）',
    interviewStage: '电话面',
    questions: ['对 AI 投资方向的理解', '为什么投这个岗位', '过往实习总结'],
    mistakes: ['对话节奏紧张磕巴', '回答 AI 方向理解时缺少具体案例'],
    strengths: ['没被压垮，全程跟上节奏'],
    createdAt: d(2025, 10, 20, 16, 21),
  },
  {
    messageId: 201,
    company: '某创投',
    jobPosition: 'AI 产品（疑似 AI 调研秘书）',
    interviewStage: '视频面',
    questions: ['AI 调研方法', '报告输出节奏', '跟 PE 团队怎么协同'],
    mistakes: ['对 PE 业务流程不熟', '应对压力面时显得防御'],
    strengths: ['坚持澄清了岗位定位'],
    createdAt: d(2025, 10, 27, 16, 31),
  },
  {
    messageId: 202,
    company: '某创投',
    jobPosition: 'AI 产品（疑似 AI 调研秘书）',
    interviewStage: '线下面',
    questions: ['某基金底层逻辑', 'AI 工具如何应用到投后管理'],
    mistakes: ['对方公司投资标的没真研究过'],
    strengths: ['面后理性判断岗位不匹配，拒了'],
    createdAt: d(2025, 11, 5, 22, 1),
  },
  {
    messageId: 203,
    company: '元芯动力',
    jobPosition: 'AI 算法',
    interviewStage: '视频面',
    questions: [
      'Graph CoT 论文细节',
      'Few-shot 实体抽取 F1 怎么稳到 91.3%',
      '节点构建 pipeline 选型',
      'SPARQL 子图检索召回率',
      'Baseline 选型公平性',
    ],
    mistakes: ['Baseline 公平性那一题答得偏防御', '没主动展示其他对比实验'],
    strengths: ['论文细节全程接得住', '能用一句话讲清 motivation'],
    createdAt: d(2025, 12, 15, 22, 1),
  },
  {
    messageId: 204,
    company: '元芯动力',
    jobPosition: 'AI 算法',
    interviewStage: 'offer 通知',
    questions: [],
    mistakes: [],
    strengths: ['首个明确 offer，体感 oracle 选型上自己有筹码了'],
    createdAt: d(2025, 12, 22, 12, 9),
  },
  {
    messageId: 205,
    company: 'ASML',
    jobPosition: 'LLM Development Intern',
    interviewStage: '线下一面',
    questions: [
      'RAG 双通道（vector + graph）设计',
      'Multi-Agent 编排逻辑',
      'XML 生成可用率 92% 怎么测',
      '知识图谱节点抽取 prompt 细节',
      'Token 消耗优化路径',
    ],
    mistakes: ['说 token 优化只提了 prompt caching'],
    strengths: ['全程节奏稳', '技术细节能讲到 prompt 层', '流程规范带来心态稳定'],
    createdAt: d(2026, 1, 20, 19, 1),
  },
  {
    messageId: 206,
    company: 'ASML',
    jobPosition: 'LLM Development Intern',
    interviewStage: 'offer 通知',
    questions: [],
    mistakes: [],
    strengths: ['确认入职'],
    createdAt: d(2026, 2, 5, 11, 1),
  },
  {
    messageId: 207,
    company: 'TCL',
    jobPosition: '端侧模型部署',
    interviewStage: '视频面',
    questions: [
      'INT8 / INT4 量化',
      '模型蒸馏 vs 剪枝',
      'PEFT / LoRA / QLoRA',
      'Transformer KV cache',
      'RLHF 实操',
    ],
    mistakes: ['RLHF 没真做过', '端侧推理优化具体路径答得泛'],
    strengths: ['基础名词都能解释'],
    dateHint: '没准备就上的非对口面',
    createdAt: d(2026, 2, 10, 16, 14),
  },
  {
    messageId: 208,
    company: '笃威尔（深圳）',
    jobPosition: 'AI 工程师（公务员赋能）',
    interviewStage: '线下面',
    questions: ['RAG 工程链路', 'Agent 编排', '向量库 milvus vs weaviate'],
    mistakes: ['对方水平一般，没刺激到深入思考'],
    strengths: ['面前判断业务方向不匹配，没投入太多准备'],
    createdAt: d(2026, 2, 15, 18, 1),
  },
  {
    messageId: 210,
    company: '奥萨医药',
    jobPosition: 'AI 产品',
    interviewStage: '视频面',
    questions: [
      'ASML 项目细节',
      'AI 面试官项目细节',
      'RAG 召回率怎么算',
      '向量 chunking 策略',
      '为什么 vibe coding 能这么快',
    ],
    mistakes: [],
    strengths: ['项目讲得有节奏', '能把 vibe coding 落到具体动作'],
    createdAt: d(2026, 2, 25, 17, 1),
  },
  {
    messageId: 212,
    company: '极光矩阵',
    jobPosition: 'AI 产品（游戏/娱乐方向）',
    interviewStage: '一面（飞书）',
    questions: [
      'Claude Code / Codex 协同',
      'Skill 架构沉淀',
      'Schema 设计',
      '一道 2 天测试题（用 Skill 链路跑通需求）',
    ],
    mistakes: [],
    strengths: ['当场把 Skill / Schema / Prompt 三段式讲清楚'],
    createdAt: d(2026, 3, 5, 17, 1),
  },
  {
    messageId: 213,
    company: '极光矩阵',
    interviewStage: 'HR 面',
    questions: ['职业规划', '价值观', '为什么选游戏赛道'],
    mistakes: [],
    strengths: ['HR 反馈"沟通舒服"'],
    createdAt: d(2026, 3, 10, 14, 9),
  },
  {
    messageId: 214,
    company: '极光矩阵',
    jobPosition: 'AI 产品（游戏/娱乐方向）',
    interviewStage: 'Boss 面 + offer',
    questions: ['AI 产品实习生成长路径', 'Skill 沉淀的本质', 'Vibe Coding 的真正杠杆'],
    mistakes: [],
    strengths: ['三段反问拿到主动权', '当晚 offer'],
    createdAt: d(2026, 3, 15, 20, 9),
  },
  {
    messageId: 215,
    company: '荣耀',
    jobPosition: 'AI 算法',
    interviewStage: '技术视频面',
    questions: ['ASML 的 RAG + Multi-Agent 整体架构', '为什么选双通道'],
    mistakes: [],
    strengths: ['架构图当场画清楚'],
    createdAt: d(2026, 4, 5, 17, 1),
  },
  {
    messageId: 216,
    company: '荣耀',
    jobPosition: 'AI 算法',
    interviewStage: '主管面',
    questions: ['本科为什么去西安', '性格短板', '能力盲区'],
    mistakes: ['西安问题答得太详细，反而暴露不安'],
    strengths: ['没回避短板，承认了沟通节奏问题'],
    createdAt: d(2026, 4, 10, 16, 11),
  },
  {
    messageId: 217,
    company: '蚂蚁',
    jobPosition: 'AI Coding',
    interviewStage: '笔试',
    questions: ['一道 AI Coding 自动化题（细节略）'],
    mistakes: [],
    strengths: ['做出来了，但没下文'],
    createdAt: d(2026, 4, 15, 22, 6),
  },
  {
    messageId: 218,
    company: '华为',
    interviewStage: '笔试',
    questions: ['ML 基础', '传统算法'],
    mistakes: ['对几道算法题熟练度不够'],
    strengths: [],
    createdAt: d(2026, 4, 20, 21, 7),
  },
  {
    messageId: 219,
    company: 'vivo / OPPO / 京东',
    interviewStage: '人才评测',
    questions: ['性格 + 数推 + 逻辑'],
    mistakes: [],
    strengths: ['全部做完，全部已读不回'],
    dateHint: '大厂集中已读不回',
    createdAt: d(2026, 4, 25, 23, 6),
  },
  {
    messageId: 221,
    company: '上海凡屿智能技术',
    interviewStage: '技术视频面',
    questions: ['项目细节询问', '对规划大致了解'],
    mistakes: [],
    strengths: ['技术面正常发挥'],
    createdAt: d(2026, 5, 10, 17, 1),
  },
  {
    messageId: 222,
    company: '上海凡屿智能技术',
    interviewStage: 'HR 视频面（压力面）',
    questions: [
      '秋招怎么选',
      '评价前两个 mentor',
      'ASML 和极光矩阵的具体区别',
    ],
    mistakes: [],
    strengths: ['当场识别出公司氛围问题，面后拒 offer'],
    createdAt: d(2026, 5, 12, 23, 1),
  },
  {
    messageId: 224,
    company: '八马茶业',
    jobPosition: 'AI 工程师（营销）',
    interviewStage: '线下面',
    questions: [
      '飞书 Agent 框架做 workflow 的经验',
      '前期数据处理思路',
      '后期工作流设计优化',
      '门店营销策略 + 投流落地',
    ],
    mistakes: [],
    strengths: ['面试体验是聊天喝茶'],
    dateHint: '业务偏营销，跟自己方向有偏',
    createdAt: d(2026, 5, 25, 19, 1),
  },
  {
    messageId: 225,
    company: '编程猫',
    jobPosition: 'AI 全栈实习',
    interviewStage: '一面',
    questions: [
      'ASML 项目',
      'AI 面试官项目',
      'Agent 和 Workflow 怎么选',
      'Token 消耗和响应延时怎么缩短',
      '为什么摘要压缩只做 2-3 轮',
      'AI 面试官如何避免回答导向性注入',
      'YOLO 在 ASML 里的用途',
    ],
    mistakes: ['Token 缩短没提 batch + few-shot 缩短，只说了 prompt caching'],
    strengths: ['项目讲得透', '能把"导向性注入"答到 prompt 隔离层'],
    createdAt: d(2026, 6, 1, 20, 1),
  },
  {
    messageId: 226,
    company: '编程猫',
    jobPosition: 'AI 全栈实习',
    interviewStage: '主管面',
    questions: [
      '产品视角下边界条件怎么确定',
      '交互教学 MVP 怎么定义 done',
      'AI 课中辅导灰度分级提示',
      '个性化题目灰度怎么观测',
    ],
    mistakes: [],
    strengths: [
      '反问三连：团队半年突破 / AI 全栈实习预期工作 / 希望具备的技术能力',
      '主管口头反馈"主观能动性 + 沟通表达"是关键',
    ],
    createdAt: d(2026, 6, 5, 21, 1),
  },
  {
    messageId: 227,
    company: 'moddytiger',
    interviewStage: '电话面',
    questions: [
      '业务介绍（偏 AI 赋能但说不清楚）',
      '两个实习项目',
      '离职原因 + 工作差异',
      'AI 工具 / AI 模型使用了解',
    ],
    mistakes: ['面试官业务讲不清，自己不知道按什么角度回答更好'],
    strengths: ['学会了"闻味道"', '业务面没讲清楚的公司一般不靠谱'],
    createdAt: d(2026, 6, 8, 16, 16),
  },
];

// ──────────────────────────────────────────────
// 写入 IndexedDB
// ──────────────────────────────────────────────

export interface Seed1Result {
  messages: number;
  emotions: number;
  reviews: number;
  petCreated: boolean;
  dateRange: string;
}

export async function seedDemoDataV1(
  defaultPet: PetType = 'cat',
): Promise<Seed1Result> {
  let petCreated = false;

  await db.transaction(
    'rw',
    [db.messages, db.emotions, db.reviews, db.settings],
    async () => {
      await db.messages.clear();
      await db.emotions.clear();
      await db.reviews.clear();

      const settings = await db.settings.toArray();
      if (settings.length === 0) {
        await db.settings.add({
          pet: defaultPet,
          name: defaultPet === 'cat' ? '栖栖' : '迟迟',
          createdAt: Date.now(),
        });
        petCreated = true;
      }

      for (const m of SEED_MESSAGES) {
        await db.messages.add({
          role: m.role,
          text: m.text,
          translatedText: m.translatedText,
          createdAt: m.createdAt,
        });
      }

      for (const e of SEED_EMOTIONS) {
        await db.emotions.add({
          messageId: e.messageId,
          tags: e.tags as never,
          score: e.score,
          confidence: 0.85,
          createdAt: e.createdAt,
        });
      }

      for (const r of SEED_REVIEWS) {
        await db.reviews.add({
          messageId: r.messageId,
          jobPosition: r.jobPosition,
          company: r.company,
          interviewStage: r.interviewStage,
          questions: [...r.questions],
          mistakes: [...r.mistakes],
          strengths: [...r.strengths],
          dateHint: r.dateHint,
          userEdited: false,
          hidden: false,
          createdAt: r.createdAt,
        });
      }
    },
  );

  return {
    messages: SEED_MESSAGES.length,
    emotions: SEED_EMOTIONS.length,
    reviews: SEED_REVIEWS.length,
    petCreated,
    dateRange: '2025.10 — 2026.06（8 个月真实求职历程）',
  };
}
