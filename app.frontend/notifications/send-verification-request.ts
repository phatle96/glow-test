import 'server-only';

import { captureException } from '@sentry/nextjs';

import { createNovuInstance } from '@/lib/novu';

export async function sendVerificationRequest({
  identifier,
  url,
  token
}: {
  identifier: string;
  url: string;
  token: string;
}) {
  const novu = createNovuInstance();

  if (!novu) {
    return;
  }

  try {
    await novu.trigger("server-email", {
      to: {
        subscriberId: token,
        email: identifier,
      },
      payload: {
        subject: '[GLOW-TEST] Verification Request',
        message: `Verification link: ${url}`
      },
    });
  } catch (error) {
    captureException(error);
  }
}
