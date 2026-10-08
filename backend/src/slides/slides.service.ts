import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class SlidesService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  private handleError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Imagen no encontrada');
    }
    throw error;
  }

  findAll() {
    return this.prisma.slide.findMany({ orderBy: { order: 'asc' } });
  }

  // La nueva imagen va al final del carrusel
  async create(dto: CreateSlideDto) {
    const last = await this.prisma.slide.findFirst({
      orderBy: { order: 'desc' },
    });
    return this.prisma.slide.create({
      data: { imageUrl: dto.imageUrl, order: (last?.order ?? -1) + 1 },
    });
  }

  async remove(id: number) {
    try {
      const deleted = await this.prisma.slide.delete({ where: { id } });
      await this.uploads.deleteImages([deleted.imageUrl]);
      return deleted;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Recibe los ids en el nuevo orden: la posición en la lista es el nuevo "order"
  async reorder(ids: number[]) {
    try {
      await this.prisma.$transaction(
        ids.map((id, index) =>
          this.prisma.slide.update({ where: { id }, data: { order: index } }),
        ),
      );
    } catch (error) {
      this.handleError(error);
    }
    return this.findAll();
  }
}