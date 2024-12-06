'use client';

import posthog from 'posthog-js';
import {
  PostHogProvider as OGPostHogProvider,
  usePostHog,
} from 'posthog-js/react';
import { useEffect } from 'react';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <OGPostHogProvider client={posthog}>{children}</OGPostHogProvider>;
}

export function PostHogIdentify({
  userId,
  teamId,
}: {
  userId: string;
  teamId: string;
}) {
  const _posthog = usePostHog();

  useEffect(() => {
    if (userId) {
      _posthog?.identify(userId);
      _posthog?.group('team', teamId);
    }
  }, [_posthog, userId, teamId]);

  return null;
}
