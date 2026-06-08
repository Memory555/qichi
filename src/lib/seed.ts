/**
 * 栖迟 · 调试种子数据
 *
 * 给 IndexedDB 一次性灌入示例情绪 + 复盘卡片，用于验收阶段 D。
 *
 * 设计要点：
 * - 每条记录有独立 messageId（≥ 101），删除复盘 → 级联删情绪 → 曲线点消失
 * - 复盘和情绪共享 messageId 时表示"同一段事件"
 * - 包含 1 天波动剧烈的日子（早低落晚兴奋），测试 tooltip 的 min/max 显示
 * - 包含 1 天断档（5 天前），测试曲线断线
 */

import { db, type PetType } from './db';

const DAY = 24 * 60 * 60 * 1000;

/** 几天前的 H:M 时间戳（本地） */
function ts(daysAgo: number, hour = 14, minute = 0): number {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

interface EmotionSeed {
  messageId: number;
  tags: string[];
  score: number;
  createdAt: number;
}

interface ReviewSeed {
  messageId: number; // 若与某 emotion 相同 → 表示同源
  jobPosition?: string;
  company?: string;
  interviewStage?: string;
  questions: string[];
  mistakes: string[];
  strengths: string[];
  dateHint?: string;
  createdAt: number;
}

const SEED_EMOTIONS: ReadonlyArray<EmotionSeed> = [
  // 7 天前 · 低落（一面被怼）
  { messageId: 101, tags: ['挫败', '自我否定'], score: 3, createdAt: ts(7, 14) },
  { messageId: 102, tags: ['迷茫'], score: 4, createdAt: ts(7, 20) },
  // 6 天前 · 平稳
  { messageId: 103, tags: ['平静'], score: 5, createdAt: ts(6, 15) },
  // 5 天前 · 断档（无数据）
  // 4 天前 · 谷底（连面试都不想去）
  { messageId: 104, tags: ['挫败'], score: 2, createdAt: ts(4, 10) },
  { messageId: 105, tags: ['自我否定'], score: 3, createdAt: ts(4, 16) },
  { messageId: 106, tags: ['挫败', '迷茫'], score: 2, createdAt: ts(4, 22) },
  // 3 天前 · 反弹（HR 面表达欲恢复）
  { messageId: 107, tags: ['平静'], score: 6, createdAt: ts(3, 12) },
  // 2 天前 · 波动剧烈（早上挂掉一家，晚上接到 offer）★
  { messageId: 108, tags: ['挫败'], score: 3, createdAt: ts(2, 9) },
  { messageId: 109, tags: ['兴奋', '侥幸'], score: 8, createdAt: ts(2, 21) },
  // 1 天前 · 高（offer 后的余温）
  { messageId: 110, tags: ['兴奋'], score: 7, createdAt: ts(1, 14) },
  { messageId: 111, tags: ['侥幸', '兴奋'], score: 8, createdAt: ts(1, 21) },
  // 今天 · 中（回到日常）
  { messageId: 112, tags: ['平静'], score: 5, createdAt: ts(0, 10) },
];

/**
 * 复盘卡片，messageId 与情绪关联：
 * - 101 ↔ 阿里三面（删它会同时干掉 7 天前下午那个低落情绪）
 * - 104 ↔ 字节二面
 * - 107 ↔ 美团 HR
 * - 109 ↔ 拼多多一面（删它会让 2 天前晚上的"兴奋 8"消失，
 *         波动剧烈日子退回只剩早上的"挫败 3"，曲线点也变低）
 * - 112 ↔ 今天的前端聊天
 */
const SEED_REVIEWS: ReadonlyArray<ReviewSeed> = [
  {
    messageId: 101,
    jobPosition: '算法岗',
    company: '阿里',
    interviewStage: '三面',
    questions: ['RAG 优化', 'Transformer 位置编码'],
    mistakes: ['向量分段答漏', '临场紧张说话结巴'],
    strengths: ['业务理解到位'],
    dateHint: '今天',
    createdAt: ts(7, 15),
  },
  {
    messageId: 104,
    jobPosition: '后端',
    company: '字节',
    interviewStage: '二面',
    questions: ['手撕 LRU'],
    mistakes: ['变量命名混乱'],
    strengths: ['LRU 写出来了'],
    createdAt: ts(4, 11),
  },
  {
    messageId: 107,
    company: '美团',
    interviewStage: 'HR面',
    questions: ['薪资期望', '为什么离职'],
    mistakes: ['薪资没谈好'],
    strengths: [],
    createdAt: ts(3, 14),
  },
  {
    messageId: 109,
    jobPosition: '算法岗',
    company: '拼多多',
    interviewStage: '一面',
    questions: ['Dropout 原理', 'BN vs LN'],
    mistakes: [],
    strengths: ['Dropout 答得详细', 'BN 推导清晰'],
    createdAt: ts(2, 22),
  },
  {
    messageId: 112,
    jobPosition: '前端',
    questions: ['React fiber'],
    mistakes: [],
    strengths: [],
    createdAt: ts(0, 11),
  },
];

interface MessageSeed {
  role: 'user' | 'pet';
  text: string;
  translatedText?: string;
  createdAt: number;
}

/**
 * 全天对话种子（供小本本"详情"视图回看）
 *
 * 与 emotions / reviews 通过 createdAt 同日聚合。
 * 不用 messageId 关联，详情查询按"那天 0:00 - 23:59"范围拉取。
 */
const SEED_MESSAGES: ReadonlyArray<MessageSeed> = [
  // ─── 7 天前：阿里三面 session ───
  { role: 'user', text: '今天面阿里算法岗三面，刚出来。', createdAt: ts(7, 14, 0) },
  {
    role: 'pet',
    text: '喵～',
    translatedText: '嗯…来这儿坐会儿吧。',
    createdAt: ts(7, 14, 1),
  },
  { role: 'user', text: '面试官问 RAG 优化，我把向量分段答漏了，紧张到说话结巴。', createdAt: ts(7, 14, 5) },
  { role: 'pet', text: '喵～', createdAt: ts(7, 14, 6) },
  { role: 'user', text: '出门特别自我怀疑，感觉自己什么都不会。', createdAt: ts(7, 14, 20) },
  {
    role: 'pet',
    text: '喵～',
    translatedText: '我也常常这样想。但你还是把今天熬过来了。',
    createdAt: ts(7, 14, 21),
  },
  { role: 'user', text: '一天过去了还是放不下这事。', createdAt: ts(7, 20, 0) },
  { role: 'pet', text: '喵～', createdAt: ts(7, 20, 1) },

  // ─── 6 天前 · 平稳 ───
  { role: 'user', text: '今天没投简历，看了点书。', createdAt: ts(6, 15, 0) },
  { role: 'pet', text: '喵～', createdAt: ts(6, 15, 1) },

  // ─── 4 天前：字节二面 + 累 ───
  { role: 'user', text: '字节二面让我手撕 LRU，写出来了。', createdAt: ts(4, 10, 0) },
  { role: 'pet', text: '喵～', createdAt: ts(4, 10, 1) },
  { role: 'user', text: '但变量名取得乱七八糟，可能会扣分。', createdAt: ts(4, 10, 30) },
  { role: 'pet', text: '喵～', createdAt: ts(4, 10, 31) },
  { role: 'user', text: '感觉自己每天都在准备，看不到尽头。', createdAt: ts(4, 16, 0) },
  { role: 'pet', text: '喵～', createdAt: ts(4, 16, 1) },
  { role: 'user', text: '真的好累，什么都不想干。', createdAt: ts(4, 22, 0) },
  {
    role: 'pet',
    text: '喵～',
    translatedText: '来，过来挠挠我。先不想了。',
    createdAt: ts(4, 22, 1),
  },

  // ─── 3 天前：美团 HR ───
  { role: 'user', text: '美团 HR 面问了薪资期望和为什么离职。', createdAt: ts(3, 12, 0) },
  { role: 'pet', text: '喵～', createdAt: ts(3, 12, 1) },
  { role: 'user', text: '薪资没谈好，对方说要回去商量。', createdAt: ts(3, 14, 0) },
  { role: 'pet', text: '喵～', createdAt: ts(3, 14, 1) },

  // ─── 2 天前：剧烈波动日 ★ ───
  { role: 'user', text: '早上挂了一家，又被刷了。', createdAt: ts(2, 9, 0) },
  {
    role: 'pet',
    text: '喵～',
    translatedText: '嗯。我趴你脚边了。',
    createdAt: ts(2, 9, 1),
  },
  { role: 'user', text: '真的有点崩溃，想直接放弃。', createdAt: ts(2, 9, 30) },
  { role: 'pet', text: '喵～', createdAt: ts(2, 9, 31) },
  { role: 'user', text: '突然接到拼多多算法岗的 offer！没想到这么快。', createdAt: ts(2, 21, 0) },
  {
    role: 'pet',
    text: '喵～',
    translatedText: '那真好。我尾巴轻轻晃了一下。',
    createdAt: ts(2, 21, 1),
  },
  { role: 'user', text: '一天天差地别。', createdAt: ts(2, 21, 30) },
  { role: 'pet', text: '喵～', createdAt: ts(2, 21, 31) },

  // ─── 1 天前：offer 余温 ───
  { role: 'user', text: '拼多多 offer 落实了，准备去入职体检。', createdAt: ts(1, 14, 0) },
  { role: 'pet', text: '喵～', createdAt: ts(1, 14, 1) },
  { role: 'user', text: '还在感叹，没想到柳暗花明。', createdAt: ts(1, 21, 0) },
  {
    role: 'pet',
    text: '喵～',
    translatedText: '那真好，慢慢享受这阵子吧。',
    createdAt: ts(1, 21, 1),
  },

  // ─── 今天：前端面试 ───
  { role: 'user', text: '早上面了个前端的，问了 React fiber。', createdAt: ts(0, 10, 0) },
  { role: 'pet', text: '喵～', createdAt: ts(0, 10, 1) },
  { role: 'user', text: '应该没问题，期待结果。', createdAt: ts(0, 11, 0) },
  { role: 'pet', text: '喵～', createdAt: ts(0, 11, 1) },
];

export interface SeedResult {
  messages: number;
  emotions: number;
  reviews: number;
  petCreated: boolean;
}

export async function seedDemoData(
  defaultPet: PetType = 'cat',
): Promise<SeedResult> {
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
  };
}
