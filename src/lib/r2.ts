import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error("Missing R2 credentials in environment variables");
  }

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  return _client;
}

function getBucket(): string {
  if (!R2_BUCKET_NAME) {
    throw new Error("Missing R2_BUCKET_NAME in environment variables");
  }
  return R2_BUCKET_NAME;
}

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function getFile(
  key: string
): Promise<{ body: ReadableStream; contentType: string | undefined }> {
  const client = getClient();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );

  if (!response.Body) {
    throw new Error(`No body returned for key: ${key}`);
  }

  return {
    body: response.Body.transformToWebStream(),
    contentType: response.ContentType,
  };
}

export async function deleteFile(key: string): Promise<void> {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}
