import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket = process.env.AWS_S3_BUCKET!;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Upload file (used in artwork upload)
   */
  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // or remove if using private bucket
      });

      await this.s3.send(command);

      return this.getPublicUrl(key);
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Delete file
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3.send(command);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }

  /**
   * Generate signed URL (for private files)
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }

  /**
   * Public URL helper
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  /**
   * Extract key from URL (useful for delete)
   */
  extractKeyFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return decodeURIComponent(parsed.pathname.substring(1));
    } catch {
      throw new InternalServerErrorException('Invalid S3 URL');
    }
  }
}
