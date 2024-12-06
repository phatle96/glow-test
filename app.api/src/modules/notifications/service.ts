import { createLoopsClient, saveEmail } from '@/lib/loops';
import { createNovuInstance } from '@/lib/novu';
import { transactionalEmailIds } from '@/modules/notifications/constants';
import { captureException } from '@sentry/node';

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
    saveEmail(email, 'sendSubscriptionCreatedEmail')

    await novu.trigger("server-email", {
      to: {
        subscriberId: id,
        email: email,
      },
      payload: {
        subject: '[GLOW-TEST] Subscription Created !',
        message: `Subscription Created (plan type: ${planType}): ${email}`
      },
    });
  } catch (error) {
    captureException(error);
  }
}

export async function sendSubscriptionCancelledEmail(id: string, email: string) {
  const novu = createNovuInstance();

  if (!novu) {
    return;
  }

  try {
    saveEmail(email, 'sendSubscriptionCancelledEmail')

    await novu.trigger("server-email", {
      to: {
        subscriberId: id,
        email: email,
      },
      payload: {
        subject: '[GLOW-TEST] Subscription Cancelled !',
        message: `Subscription cancelled: ${email}`
      },
    });
  } catch (error) {
    captureException(error);
  }
}
