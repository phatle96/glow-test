import { createLoopsClient, saveEmail, transactionalEmailIds } from '@/lib/loops';
import { captureException } from '@sentry/nextjs';

export async function sendSubscriptionCancelledEmail(email: string) {
  // const loops = createLoopsClient();

  // if (!loops) {
  //   return;
  // }

  try {
    saveEmail(email, 'subscriptionCancelled')
    // await loops.sendTransactionalEmail({
    //   transactionalId: transactionalEmailIds.subscriptionCancelled,
    //   email,
    // });
  } catch (error) {
    captureException(error);
  }
}
