import 'server-only';

import { createLoopsClient, saveEmail } from '@/lib/loops';
import { captureException } from '@sentry/nextjs';

export async function createContact(email: string) {
  // const loops = createLoopsClient();

  // if (!loops) {
  //   return;
  // }

  try {
    saveEmail(email, 'createContact')
    // await loops.createContact(email);
  } catch (error) {
    captureException(error);
  }
}
