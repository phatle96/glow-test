import { createLoopsClient, saveEmail, transactionalEmailIds } from '@/lib/loops';
import { createNovuInstance } from '@/lib/novu';
import { captureException } from '@sentry/nextjs';

export async function sendSubscriptionCancelledEmail(id: string, email: string) {

  const novu = createNovuInstance();

  if (!novu) {
    return;
  }

  try {
    // saveEmail(email, 'subscriptionCancelled')
    await novu.trigger("server-email", {
      to: {
        subscriberId: id,
        email: email,
      },
      payload: {
        subject: '[GLOW-TEST] Subscription Cancelled',
        message: `Subscription cancelled: ${email}`
      },
    });

  } catch (error) {
    captureException(error);
  }
}
