import prisma from '@/lib/prisma';

export async function getIntegrationsForTeamId(teamId: string) {
  const integrations = await prisma.integration.findMany({
    where: {
      teamId,
      deletedAt: null,
    },
    select: {
      id: true,
      createdAt: true,
      type: true,
    },
  });

  return integrations;
}

export async function disconnectIntegration(integrationId: string) {
  await prisma.integration.update({
    where: {
      id: integrationId,
    },
    data: {
      deletedAt: new Date(),
      config: {},
      encryptedConfig: null,
    },
  });

  await prisma.block.updateMany({
    where: {
      integrationId,
    },
    data: {
      integrationId: null,
    },
  });

  return {
    sucess: true,
  };
}
