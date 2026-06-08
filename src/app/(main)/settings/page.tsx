'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppBar } from '@/components/layout/AppBar';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useCurrentPet } from '@/hooks/useCurrentPet';
import { PETS } from '@/lib/pets';
import { exportAllData, resetAllData, updateLLMConfig } from '@/lib/db';
import { clearAllSummaryCache } from '@/lib/monthly';
import { pingLLM } from '@/lib/llm-client';
import { cn } from '@/lib/utils';

function SettingsRow({
  label,
  onClick,
  danger,
  serif,
  disabled,
  asLink,
}: {
  label: string;
  onClick?: () => void;
  danger?: boolean;
  serif?: boolean;
  disabled?: boolean;
  asLink?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-full items-center justify-between px-4 text-left transition-colors hover:bg-subtle disabled:hover:bg-transparent"
    >
      <span
        className={
          danger
            ? 'text-body-ui text-danger'
            : disabled
              ? 'text-body-ui text-ink-mute'
              : 'text-body-ui text-ink'
        }
        style={serif ? { fontFamily: 'serif' } : undefined}
      >
        {label}
      </span>
      <span className="text-ink-mute">{asLink ? '↗' : '›'}</span>
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-caption text-ink-soft">{title}</h3>
      <Card className="overflow-hidden p-0">
        <div className="divide-y divide-line">{children}</div>
      </Card>
    </section>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { pet } = useCurrentPet();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // LLM 配置本地表单态
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [modelMain, setModelMain] = useState('');
  const [modelFast, setModelFast] = useState('');
  const [llmTesting, setLlmTesting] = useState(false);
  const [llmTestResult, setLlmTestResult] = useState<
    null | { ok: true; msg: string } | { ok: false; msg: string }
  >(null);
  // 折叠状态：已配置时默认收起，没配置时默认展开
  const [llmExpanded, setLlmExpanded] = useState(false);

  // 把 pet 中的字段加载到表单 + 初次决定折叠状态
  useEffect(() => {
    if (!pet) return;
    setApiKey(pet.openaiKey ?? '');
    setBaseUrl(pet.openaiBaseUrl ?? '');
    setModelMain(pet.openaiModelMain ?? '');
    setModelFast(pet.openaiModelFast ?? '');
    // 已有 key → 默认收起；没 key → 默认展开
    setLlmExpanded(!pet.openaiKey);
  }, [pet?.openaiKey, pet?.openaiBaseUrl, pet?.openaiModelMain, pet?.openaiModelFast]);

  /** 给 key 打码：sk-2AgK•••••••••P8In */
  const maskedKey = (k: string) => {
    if (!k) return '';
    if (k.length <= 12) return k;
    return `${k.slice(0, 6)}••••••••${k.slice(-4)}`;
  };

  const hasKey = !!pet?.openaiKey;

  if (!pet) return null;
  const profile = PETS[pet.pet];

  const handleSaveLLM = async () => {
    await updateLLMConfig({
      openaiKey: apiKey.trim() || undefined,
      openaiBaseUrl: baseUrl.trim() || undefined,
      openaiModelMain: modelMain.trim() || undefined,
      openaiModelFast: modelFast.trim() || undefined,
    });
    setLlmTestResult({ ok: true, msg: '已保存' });
    // 保存后自动收起
    if (apiKey.trim()) setLlmExpanded(false);
  };

  const handleTestLLM = async () => {
    setLlmTesting(true);
    setLlmTestResult(null);
    try {
      const reply = await pingLLM({
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim() || undefined,
        modelMain: modelMain.trim() || undefined,
        modelFast: modelFast.trim() || undefined,
      });
      setLlmTestResult({ ok: true, msg: `连通：${reply}` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLlmTestResult({ ok: false, msg: `失败：${msg.slice(0, 120)}` });
    } finally {
      setLlmTesting(false);
    }
  };

  const wipeAndGo = async () => {
    await resetAllData();
    clearAllSummaryCache();
    router.replace('/onboarding');
  };

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `栖迟-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearConfirm = async () => {
    if (confirmText !== '确认') return;
    setConfirmText('');
    await wipeAndGo();
  };

  return (
    <>
      <AppBar center={<span className="text-h3 text-ink">我</span>} />

      <div className="scroll-soft flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
        {/* 宠物身份 */}
        <div className="flex flex-col items-center gap-2 py-4">
          <Icon src={profile.avatar} size={80} alt={pet.name} />
          <h2 className="text-h2 text-ink">{pet.name}</h2>
          <p className="text-caption text-ink-mute">在这儿陪你</p>
        </div>

        <Section title={`我和${pet.name}`}>
          <SettingsRow
            label="换一只小动物"
            onClick={() => setSwitchOpen(true)}
          />
        </Section>

        {/* AI 配置 ───────────────────── */}
        <section id="llm">
          <h3 className="mb-2 px-1 text-caption text-ink-soft">
            AI 配置{hasKey ? '' : '（必填）'}
          </h3>
          <Card className={llmExpanded ? 'space-y-3' : 'p-0'}>
            {!llmExpanded && hasKey ? (
              // ─── 收起态：已配置摘要 + 修改按钮 ───
              <button
                type="button"
                onClick={() => setLlmExpanded(true)}
                className="flex h-14 w-full items-center justify-between px-4 text-left transition-colors hover:bg-subtle"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-ui text-ink">
                    {maskedKey(apiKey)}
                  </span>
                  <span className="text-mini text-ink-mute">
                    {baseUrl || 'OpenAI 官方'} ·{' '}
                    {modelMain || 'gpt-4o-mini'}
                  </span>
                </div>
                <span className="text-caption text-brand">修改 ›</span>
              </button>
            ) : (
              // ─── 展开态：完整表单 ───
              <>
                <p className="text-caption leading-relaxed text-ink-soft">
                  栖栖 / 迟迟 想跟你说人话，需要一个 OpenAI 兼容的 API key。
                  <br />
                  <span className="text-mini text-ink-mute">
                    数据只在你这台设备上 · 不会上传给任何服务器
                  </span>
                </p>

                <div className="space-y-2">
                  <label className="block text-mini text-ink-soft">
                    API Key
                  </label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-mini text-ink-soft">
                    Base URL（OpenAI 官方留空；代理填到 /v1）
                  </label>
                  <Input
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.chatanywhere.tech/v1"
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="block text-mini text-ink-soft">
                      主力模型
                    </label>
                    <Input
                      value={modelMain}
                      onChange={(e) => setModelMain(e.target.value)}
                      placeholder="gpt-4o-mini"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-mini text-ink-soft">
                      快速模型
                    </label>
                    <Input
                      value={modelFast}
                      onChange={(e) => setModelFast(e.target.value)}
                      placeholder="gpt-4o-mini"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="md"
                    onClick={handleSaveLLM}
                    disabled={!apiKey.trim()}
                  >
                    保存
                  </Button>
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={handleTestLLM}
                    disabled={!apiKey.trim() || llmTesting}
                  >
                    {llmTesting ? '测试中...' : '测试连接'}
                  </Button>
                  {hasKey && (
                    <Button
                      size="md"
                      variant="text"
                      onClick={() => {
                        setLlmExpanded(false);
                        setLlmTestResult(null);
                      }}
                    >
                      收起
                    </Button>
                  )}
                </div>

                {llmTestResult && (
                  <p
                    className={cn(
                      'text-caption',
                      llmTestResult.ok ? 'text-success' : 'text-danger',
                    )}
                  >
                    {llmTestResult.msg}
                  </p>
                )}
              </>
            )}
          </Card>
        </section>

        <Section title="数据">
          <SettingsRow label="导出所有数据" onClick={handleExport} />
          <SettingsRow
            label="清除所有数据"
            danger
            onClick={() => {
              setConfirmText('');
              setClearOpen(true);
            }}
          />
        </Section>

        <Section title="关于栖迟">
          <Link href="/about" className="block">
            <SettingsRow label="这是个什么" asLink />
          </Link>
          <Link href="/about/easter-egg" className="block">
            <SettingsRow label="衡门之下，可以栖迟" serif asLink />
          </Link>
        </Section>

        <p className="mt-2 text-center text-mini text-ink-mute">
          数据只在你这台设备上 · 阶段 F
        </p>
      </div>

      {/* 换宠物确认 */}
      <Dialog
        open={switchOpen}
        onClose={() => setSwitchOpen(false)}
        title="换一只小动物？"
        body="换之后这只小动物以及你跟它说过的所有内容会一起清掉。要继续吗？"
        confirmLabel="换"
        onConfirm={wipeAndGo}
        danger
      />

      {/* 清除数据 · 输入"确认"才能执行 */}
      <Dialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="清除所有数据"
        body={
          <div className="space-y-3">
            <p>这会清掉所有的对话、情绪和复盘。不可恢复。</p>
            <p>输入「确认」继续：</p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="确认"
            />
          </div>
        }
        confirmLabel="清除"
        confirmDisabled={confirmText !== '确认'}
        onConfirm={handleClearConfirm}
        danger
      />
    </>
  );
}
