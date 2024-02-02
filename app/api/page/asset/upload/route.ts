import {
  type AbortMultipartUploadCommandOutput,
  CompleteMultipartUploadCommandOutput,
  S3,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import sharp from 'sharp';

import { AssetContexts } from '@/lib/asset';
import { authOptions } from '@/lib/auth';
import { isObjKey } from '@/lib/utils';

function isComplete(
  output:
    | CompleteMultipartUploadCommandOutput
    | AbortMultipartUploadCommandOutput
): output is CompleteMultipartUploadCommandOutput {
  return (output as CompleteMultipartUploadCommandOutput).ETag !== undefined;
}

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
  region: process.env.AWS_REGION,
});

const uploadTemplateFile = async (
  fileBuffer: Buffer,
  fileName: string,
  fileContentType: string
) => {
  return await new Upload({
    client: s3,
    params: {
      Bucket: `${process.env.NEXT_PUBLIC_APP_ENV}.onedash.user-uploads`,
      Key: fileName,
      ContentType: fileContentType,
      Body: fileBuffer,
    },
  }).done();
};

const assetContexts: Record<
  AssetContexts,
  {
    keyPrefix: string;
    quality: number;
    resize: {
      width: number;
      height: number;
    };
  }
> = {
  pageBackgroundImage: {
    keyPrefix: 'pg-bg',
    quality: 100,
    resize: {
      width: 1200,
      height: 800,
    },
  },
  blockAsset: {
    keyPrefix: 'block',
    quality: 80,
    resize: {
      width: 800,
      height: 800,
    },
  },
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({
      error: {
        message: 'Unauthorized',
      },
    });
  }

  const formData = await req.formData();
  const files = formData.getAll('file') as File[];
  const referenceId = formData.get('referenceId') as string;
  const context = formData.get('assetContext') as string;

  const firstFileOnly = files[0];

  if (!firstFileOnly || !referenceId) {
    // RETURN AN ERROR
    return Response.json({
      error: {
        message: 'Missing required fields',
      },
    });
  }

  if (!isObjKey(context, assetContexts)) {
    return Response.json({
      error: {
        message: 'Invalid asset context',
      },
    });
  }

  const assetConfig = assetContexts[context];

  const convertedImage = await sharp(await firstFileOnly.arrayBuffer())
    .resize(assetConfig.resize.width, assetConfig.resize.height)
    .toFormat('webp', {
      quality: assetConfig.quality,
    })
    .toBuffer();

  const fileName = `${assetConfig.keyPrefix}-${referenceId}/${randomUUID()}`;

  const assetUpload = await uploadTemplateFile(
    convertedImage,
    fileName,
    'image/webp'
  );

  if (isComplete(assetUpload)) {
    const fileLocation =
      process.env.NEXT_PUBLIC_APP_ENV === 'development'
        ? `https://cdn.dev.glow.as/${assetUpload.Key}`
        : `https://cdn.glow.as/${assetUpload.Key}`;

    // const fileLocation = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${assetUpload.Bucket}/${assetUpload.Key}`

    return Response.json({ message: 'success', url: fileLocation });
  }
}