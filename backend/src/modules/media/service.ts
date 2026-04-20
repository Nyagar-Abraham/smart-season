import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../../config/s3-client.js';

export async function generatePresignedUrl(
  filename: string,
  contentType: string,
  fileDirectory: string,
) {
  const bucketName = process.env.AWS_BUCKET_NAME!;
  const key = `uploads/${fileDirectory}/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { presignedUrl, publicUrl };
}

export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  contentType: string,
  fileDirectory: string,
) {
  const bucketName = process.env.AWS_BUCKET_NAME!;
  const key = `uploads/${fileDirectory}/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { publicUrl, key };
}
