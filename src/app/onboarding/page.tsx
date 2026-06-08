'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { PetSelectScreen } from '@/components/onboarding/PetSelectScreen';
import { AppShell } from '@/components/layout/AppShell';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'select'>('welcome');

  return (
    <AppShell>
      {step === 'welcome' ? (
        <WelcomeScreen onContinue={() => setStep('select')} />
      ) : (
        <PetSelectScreen onDone={() => router.replace('/chat')} />
      )}
    </AppShell>
  );
}
