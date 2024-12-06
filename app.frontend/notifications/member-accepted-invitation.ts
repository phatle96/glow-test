import 'server-only';

import { captureException } from '@sentry/nextjs';

import { createLoopsClient, saveEmail, transactionalEmailIds } from '@/lib/loops';

export async function sendMemberAcceptedInvitationEmail({
  teamEmails,
  newMemberName,
}: {
  teamEmails: string[];
  newMemberName: string;
}) {
  // const loops = createLoopsClient();

  // if (!loops) {
  //   return;
  // }

  for (const email of teamEmails) {
    try {

      saveEmail(email, newMemberName)

      // await loops.sendTransactionalEmail({
      //   transactionalId: transactionalEmailIds.memberAcceptedInvitation,
      //   email,
      //   dataVariables: {
      //     newMemberName,
      //   },
      // });
    } catch (error) {
      captureException(error);
    }
  }
}
