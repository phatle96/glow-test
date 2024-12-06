import 'server-only';

import { createLoopsClient, saveEmail, transactionalEmailIds } from '@/lib/loops';
import { captureException } from '@sentry/nextjs';

export async function sendSubscriptionCreatedEmail(
  email: string,
  planType: 'premium' | 'team'
) {
  // const loops = createLoopsClient();

  // if (!loops) {
  //   return;
  // }

  const transactionalId =
    planType === 'premium'
      ? transactionalEmailIds.subscriptionCreatedPremium
      : transactionalEmailIds.subscriptionCreatedTeam;

  try {
    saveEmail(email, 'sendSubscriptionCreatedEmail')
    // await loops.sendTransactionalEmail({
    //   transactionalId,
    //   email,
    // });
  } catch (error) {
    captureException(error);
  }
}
