import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = configService.get<string>('app.aws.s3.bucket')!;
    this.s3 = new S3Client({
      region: configService.get<string>('app.aws.region')!,
      endpoint: configService.get<string>('app.aws.s3.endpoint'),
      credentials: {
        accessKeyId: configService.get<string>('app.aws.accessKeyId')!,
        secretAccessKey: configService.get<string>('app.aws.secretAccessKey')!,
      },
      forcePathStyle: true,
    });
  }

  async uploadPdf(key: string, data: Buffer): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: 'application/pdf',
      }),
    );
    return key;
  }

  async downloadPdf(key: string): Promise<Buffer> {
    const response = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    const stream = response.Body;
    if (!stream) {
      throw new Error('Empty response from S3');
    }

    const chunks: Buffer[] = [];
    const reader = stream.transformToWebStream().getReader();
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      if (result.value) {
        chunks.push(Buffer.from(result.value));
      }
    }

    return Buffer.concat(chunks);
  }
}
