import { assetContexts, AssetContexts } from '@/modules/assets/constants';
import {
  CompleteMultipartUploadCommandOutput,
  S3,
  type AbortMultipartUploadCommandOutput,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { MultipartFile } from '@fastify/multipart';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { PassThrough } from 'stream';

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

const uploadStream = (fileName: string, contentType: string) => {
  const passThrough = new PassThrough();

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: `${process.env.APP_ENV}.glow.user-uploads`,
      Key: fileName,
      ContentType: contentType,
      Body: passThrough,
    },
  });

  return {
    writeStream: passThrough,
    done: upload.done(),
  };
};

export async function uploadAsset({
  context,
  file,
  referenceId,
}: {
  context: AssetContexts;
  file: MultipartFile;
  referenceId: string;
}) {
  const assetConfig = assetContexts[context];
  const fileId = randomUUID();
  const baseFileName = `${assetConfig.keyPrefix}-${referenceId}/${fileId}`;

  // Create upload streams for webp and png
  const { writeStream: webpStream, done: webpDone } = uploadStream(
    `${baseFileName}.webp`,
    'image/webp'
  );
  const { writeStream: pngStream, done: pngDone } = uploadStream(
    `${baseFileName}.png`,
    'image/png'
  );

  // Process file with sharp streams
  const sharpWebp = sharp()
    .resize(assetConfig.resize.width, assetConfig.resize.height)
    .webp({ quality: assetConfig.quality });
  const sharpPng = sharp()
    .resize(assetConfig.resize.width, assetConfig.resize.height)
    .png({ quality: assetConfig.quality });

  // Pipe file through sharp to S3
  file.file.pipe(sharpWebp).pipe(webpStream);
  file.file.pipe(sharpPng).pipe(pngStream);

  // Wait for uploads to finish
  const [webpUpload, pngUpload] = await Promise.all([webpDone, pngDone]);

  // Check if uploads are successful
  if (isComplete(webpUpload) && isComplete(pngUpload)) {
    const fileLocation =
      process.env.APP_ENV === 'development'
        ? `https://cdn.dev.glow.as/${webpUpload.Key}`
        : `https://cdn.glow.as/${webpUpload.Key}`;

    return {
      data: {
        url: fileLocation,
      },
    };
  }

  return {
    error: 'Failed to upload asset',
  };
}