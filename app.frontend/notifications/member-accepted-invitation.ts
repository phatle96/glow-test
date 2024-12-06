import 'server-only';

import { captureException } from '@sentry/nextjs';

import { createLoopsClient, saveEmail, transactionalEmailIds } from '@/lib/loops';
import { createNovuInstance } from '@/lib/novu';

export async function sendMemberAcceptedInvitationEmail({
  teamEmails,
  newMemberName,
  id,
}: {
  teamEmails: string[];
  newMemberName: string;
  id: string
}) {
  const novu = createNovuInstance();

  if (!novu) {
    return;
  }

  for (const email of teamEmails) {
    try {

      // saveEmail(email, newMemberName)

      await novu.trigger("server-email", {
        to: {
          subscriberId: id,
          email: email,
        },
        payload: {
          subject: '[GLOW-TEST] Member Invitation',
          message: `MemberAcceptedInvitation: ${newMemberName}`
        },
      });
    } catch (error) {
      captureException(error);
    }
  }
}
