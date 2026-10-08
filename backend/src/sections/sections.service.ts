import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class SectionsService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  // "Vestidos de Fiesta" -> "vestidos-de-fiesta"
  private slugify(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Traduce errores de Prisma a respuestas HTTP claras
  private handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una sección con ese nombre');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Sección no encontrada');
      }
    }
    throw error;
  }

  async create(dto: CreateSectionDto) {
    try {
      return await this.prisma.section.create({
        data: { ...dto, slug: this.slugify(dto.name) },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  findAll() {
    return this.prisma.section.findMany({
      orderBy: { order: 'asc' },
      include: {
        // Último producto de la sección, solo para usar su foto como portada
        products: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { images: true },
        },
      },
    });
  }
  async findBySlug(slug: string) {
    const section = await this.prisma.section.findUnique({
      where: { slug },
      include: { products: true },
    });
    if (!section) throw new NotFoundException('Sección no encontrada');
    return section;
  }

  async update(id: number, dto: UpdateSectionDto) {
    const data: any = { ...dto };
    if (dto.name) data.slug = this.slugify(dto.name);
    try {
      return await this.prisma.section.update({ where: { id }, data });
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: number) {
    // Antes de borrar la sección, guardamos las fotos de sus productos
    const products = await this.prisma.product.findMany({
      where: { sectionId: id },
      select: { images: true },
    });

    try {
      const deleted = await this.prisma.section.delete({ where: { id } });
      await this.uploads.deleteImages(
        products.flatMap((p) => p.images as string[]),
      );
      return deleted;
    } catch (error) {
      this.handleError(error);
    }
  }
}