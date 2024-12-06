import 'server-only';

import { TeamInvite } from '@tryglow/prisma';

import { createLoopsClient, saveEmail, transactionalEmailIds } from '@/lib/loops';
import { captureException } from '@sentry/nextjs';

export async function sendTeamInvitationEmail(invite: TeamInvite) {
  // const loops = createLoopsClient();

  // if (!loops) {
  //   return;
  // }

  try {
    saveEmail(invite.email, `https://glow.as/i/invite/${invite.code}`)
    // await loops.sendTransactionalEmail({
    //   transactionalId: transactionalEmailIds.invitationToTeam,
    //   email: invite.email,
    //   dataVariables: {
    //     inviteUrl: `https://glow.as/i/invite/${invite.code}`,
    //   },
    // });
  } catch (error) {
    captureException(error);
  }
}
