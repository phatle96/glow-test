import Grid, { PageConfig } from './grid';
import {
  getPageIdBySlugOrDomain,
  getPageLayout,
} from '@/app/lib/actions/page-actions';
import { auth } from '@/app/lib/auth';
import { renderBlock } from '@/lib/blocks/ui';
import prisma from '@/lib/prisma';
import { isUserAgentMobile } from '@/lib/user-agent';
import { Integration } from '@tryglow/prisma';
import type { Metadata, ResolvingMetadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

const getPageData = async (pageId: string) => {
  const session = await auth();

  const user = session?.user;

  const page = await prisma.page.findUnique({
    where: {
      deletedAt: null,
      id: pageId,
    },
    include: {
      blocks: true,
      user: !!user,
    },
  });

  return page;
};

export async function generateMetadata(
  props: { params: Promise<{ slug: string; domain: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const isCustomDomain =
    decodeURIComponent(params.domain) !== process.env.NEXT_PUBLIC_ROOT_DOMAIN;

  const corePage = await getPageIdBySlugOrDomain(params.slug, params.domain);

  if (!corePage) {
    return {};
  }

  const page = await getPageData(corePage.id);

  if (!page || !page.publishedAt) {
    return {};
  }

  const parentMeta = await parent;

  return {
    openGraph: {
      images: [
        `${process.env.NEXT_PUBLIC_BASE_URL}/${page?.slug}/opengraph-image`,
      ],
    },
    twitter: {
      images: [
        `${process.env.NEXT_PUBLIC_BASE_URL}/${page?.slug}/opengraph-image`,
      ],
    },
    title: `${page?.metaTitle} - Glow` || parentMeta.title?.absolute,
    description: page?.metaDescription || parentMeta.description,
    alternates: {
      canonical: isCustomDomain
        ? `https://${params.domain}`
        : `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${params.slug}`,
    },
  };
}

interface Params {
  slug: string;
  domain: string;
}

export type InitialDataUsersIntegrations = Pick<
  Integration,
  'id' | 'createdAt' | 'type'
>[];

export default async function Page(props: { params: Promise<Params> }) {
  const startTime = performance.now();
  const params = await props.params;
  const session = await auth();
  const headersList = await headers();

  const isLoggedIn = !!session?.user;

  // Track core page fetch time
  const corePageStartTime = performance.now();
  const corePage = await getPageIdBySlugOrDomain(params.slug, params.domain);
  const corePageTime = performance.now() - corePageStartTime;

  if (!corePage) {
    return notFound();
  }

  // Track layout and data fetch time
  const dataFetchStartTime = performance.now();
  const [layout, page] = await Promise.all([
    getPageLayout(corePage.id),
    getPageData(corePage.id),
  ]);
  const dataFetchTime = performance.now() - dataFetchStartTime;

  if (!page) {
    notFound();
  }

  let isEditMode = false;

  if (session && page?.teamId === session?.currentTeamId) {
    isEditMode = true;
  }

  if (page.publishedAt == null && !isEditMode) {
    return notFound();
  }

  if (
    page.customDomain &&
    page.customDomain !== decodeURIComponent(params.domain) &&
    !isEditMode
  ) {
    redirect(`//${page.customDomain}`);
  }

  const isMobile = isUserAgentMobile(headersList.get('user-agent'));
  const pageLayout = layout as unknown as PageConfig;
  const mergedIds = [...pageLayout.sm, ...pageLayout.xxs].map((item) => item.i);

  // Calculate total time
  const totalTime = performance.now() - startTime;

  // Add Server-Timing headers
  const responseHeaders = new Headers();
  responseHeaders.append('Server-Timing', `core-page;dur=${corePageTime}`);
  responseHeaders.append('Server-Timing', `data-fetch;dur=${dataFetchTime}`);
  responseHeaders.append('Server-Timing', `total;dur=${totalTime}`);

  return (
    <Grid
      isPotentiallyMobile={isMobile}
      layout={pageLayout}
      editMode={isEditMode}
      isLoggedIn={isLoggedIn}
    >
      {page.blocks
        .filter((block) => mergedIds.includes(block.id))
        .map((block) => {
          return (
            <section key={block.id}>
              {renderBlock(block, page.id, isEditMode)}
            </section>
          );
        })}
    </Grid>
  );
}
