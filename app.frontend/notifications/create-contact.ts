import 'server-only';

import { createLoopsClient, saveEmail } from '@/lib/loops';
import { captureException } from '@sentry/nextjs';
import { createNovuInstance } from '@/lib/novu';

export async function createContact(id: string, email: string, name: string) {

  const novu = createNovuInstance();

  if (!novu) {
    return;
  }

  try {
    // saveEmail(email, 'createContact')
    await novu.subscribers.identify(id, {
      firstName: name,
      email: email,
      data: {
        createdFrom: "glow-test",
      }
    })
  } catch (error) {
    captureException(error);
  }
}
