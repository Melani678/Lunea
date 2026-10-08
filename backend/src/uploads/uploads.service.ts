import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadedImage } from './uploaded-image.type';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly cloudName: string;

  constructor(config: ConfigService) {
    this.cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  uploadImage(file: UploadedImage): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          // El tag permite encontrar después solo las imágenes de este proyecto
          { folder: 'catalogo-ropa', tags: ['catalogo-ropa'] },
          (error, result) => {
            if (error || !result) {
              return reject(error ?? new Error('Falló la subida'));
            }
            resolve({ url: result.secure_url });
          },
        )
        .end(file.buffer);
    });
  }

  // "https://res.cloudinary.com/mi-nube/image/upload/v123/abc.jpg" -> "abc"
  // Solo reconoce URLs de TU cuenta de Cloudinary; cualquier otra se ignora.
  private extractPublicId(url: string): string | null {
    const prefix = `https://res.cloudinary.com/${this.cloudName}/image/upload/`;
    if (!url.startsWith(prefix)) return null;

    const match = url
      .slice(prefix.length)
      .match(/^(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : null;
  }

  async deleteImages(urls: string[]) {
    const publicIds = urls
      .map((url) => this.extractPublicId(url))
      .filter((id): id is string => id !== null);
    if (publicIds.length === 0) return;

    try {
      // Cloudinary permite borrar hasta 100 por llamada
      for (let i = 0; i < publicIds.length; i += 100) {
        await cloudinary.api.delete_resources(publicIds.slice(i, i + 100), {
          invalidate: true,
        });
      }
    } catch (error) {
      // No bloqueamos la operación principal si Cloudinary falla
      this.logger.warn(
        `No se pudieron borrar imágenes de Cloudinary: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
    }
  }
}