import 'server-only';

import { createLoopsClient, saveEmail } from '@/lib/loops';
import { captureException } from '@sentry/nextjs';
import { createNovuInstance } from '@/lib/novu';

export async function sendWelcomeEmail(id: string, email: string) {

  const novu = createNovuInstance();

  if (!novu) {
    return;
  }

  try {
    // saveEmail(email, 'sendWelcomeEmail')
    await novu.trigger("server-email", {
      to: {
        subscriberId: id,
        email: email,
      },
      payload: {
        subject: '[GLOW-TEST] Welcom Email',
        message: `Welcome to Glow, enjoy the app!`
      },
    });
  } catch (error) {
    captureException(error);
  }
}
