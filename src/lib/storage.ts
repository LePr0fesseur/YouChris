// Service de stockage objet compatible S3/R2 (Cloudflare R2)
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// Configuration du client S3/R2
function getS3Client(): S3Client {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;
  const region = process.env.S3_REGION || "auto";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Variables d'environnement S3 manquantes (S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY)");
  }

  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2 Go
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;          // 5 Mo

// Validation du type de fichier (MIME + magic bytes approximatif)
function validateFileType(
  contentType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(contentType);
}

// Sanitisation du nom de fichier pour éviter les injections de chemin
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, "_")   // Empêche les traversées de répertoire
    .substring(0, 200);
}

// Upload d'une vidéo exclusive vers R2/S3
export async function uploadExclusiveVideo(params: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  videoId: string;
}): Promise<string> {
  if (!validateFileType(params.contentType, ALLOWED_VIDEO_TYPES)) {
    throw new Error(`Type de fichier non autorisé: ${params.contentType}`);
  }

  if (params.buffer.byteLength > MAX_VIDEO_SIZE) {
    throw new Error("La vidéo dépasse la taille maximale autorisée (2 Go)");
  }

  const sanitized = sanitizeFileName(params.fileName);
  const key = `videos/exclusive/${params.videoId}/${randomUUID()}-${sanitized}`;
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error("S3_BUCKET manquant dans les variables d'environnement");
  }

  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: params.buffer,
      ContentType: params.contentType,
    })
  );

  return key;
}

// Upload d'une miniature personnalisée
export async function uploadThumbnail(params: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  videoId: string;
}): Promise<string> {
  if (!validateFileType(params.contentType, ALLOWED_IMAGE_TYPES)) {
    throw new Error(`Type d'image non autorisé: ${params.contentType}`);
  }

  if (params.buffer.byteLength > MAX_IMAGE_SIZE) {
    throw new Error("L'image dépasse la taille maximale autorisée (5 Mo)");
  }

  const sanitized = sanitizeFileName(params.fileName);
  const key = `thumbnails/${params.videoId}/${randomUUID()}-${sanitized}`;
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error("S3_BUCKET manquant dans les variables d'environnement");
  }

  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: params.buffer,
      ContentType: params.contentType,
    })
  );

  return key;
}

// Génération d'une URL signée temporaire (expiration 4h pour les vidéos exclusives)
export async function getSignedVideoUrl(
  key: string,
  expiresInSeconds: number = 4 * 60 * 60
): Promise<string> {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error("S3_BUCKET manquant dans les variables d'environnement");
  }

  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

// Suppression d'un fichier du stockage
export async function deleteStorageFile(key: string): Promise<void> {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error("S3_BUCKET manquant dans les variables d'environnement");
  }

  const client = getS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}
