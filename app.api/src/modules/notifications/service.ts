import { createLoopsClient, saveEmail } from '@/lib/loops';
import { transactionalEmailIds } from '@/modules/notifications/constants';
import { captureException } from '@sentry/node';

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

export async function sendSubscriptionCancelledEmail(email: string) {
  // const loops = createLoopsClient();

  // if (!loops) {
  //   return;
  // }

  try {
    saveEmail(email, 'sendSubscriptionCancelledEmail')
    // await loops.sendTransactionalEmail({
    //   transactionalId: transactionalEmailIds.subscriptionCancelled,
    //   email,
    // });
  } catch (error) {
    captureException(error);
  }
}
