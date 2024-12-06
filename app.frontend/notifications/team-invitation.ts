import 'server-only';

import { TeamInvite } from '@tryglow/prisma';

import { createLoopsClient, saveEmail, transactionalEmailIds } from '@/lib/loops';
import { captureException } from '@sentry/nextjs';
import { createNovuInstance } from '@/lib/novu';

export async function sendTeamInvitationEmail(invite: TeamInvite) {

  const novu = createNovuInstance();

  if (!novu) {
    return;
  }

  try {
    // saveEmail(invite.email, `https://glow.as/i/invite/${invite.code}`)

    await novu.trigger("server-email", {
      to: {
        subscriberId: invite.id,
        email: invite.email,
      },
      payload: {
        subject: '[GLOW-TEST] Team Invitation Email',
        message: `Team Invitation Email: ${process.env.NEXT_PUBLIC_BASE_URL}/i/invite/${invite.code}`
      },
    });

  } catch (error) {
    captureException(error);
  }
}
