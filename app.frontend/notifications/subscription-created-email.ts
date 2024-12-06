import 'server-only';

import { createLoopsClient, saveEmail, transactionalEmailIds } from '@/lib/loops';
import { captureException } from '@sentry/nextjs';
import { createNovuInstance } from '@/lib/novu';

export async function sendSubscriptionCreatedEmail(
  id: string,
  email: string,
  planType: 'premium' | 'team'
) {

  const novu = createNovuInstance();

  if (!novu) {
    return;
  }

  const transactionalId =
    planType === 'premium'
      ? transactionalEmailIds.subscriptionCreatedPremium
      : transactionalEmailIds.subscriptionCreatedTeam;

  try {
    // saveEmail(email, 'sendSubscriptionCreatedEmail')
    await novu.trigger("server-email", {
      to: {
        subscriberId: id,
        email: email,
      },
      payload: {
        subject: '[GLOW-TEST] Subscription Created',
        message: `Subscription Created (plan type: ${planType}): ${email}`
      },
    });

  } catch (error) {
    captureException(error);
  }
}
