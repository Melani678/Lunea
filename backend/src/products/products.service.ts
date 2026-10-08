import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  findAll(sectionId?: number, limit?: number) {
    return this.prisma.product.findMany({
      where: sectionId ? { sectionId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { section: { select: { name: true, slug: true } } },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { section: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const current = await this.findOne(id); // 404 si no existe
    const updated = await this.prisma.product.update({
      where: { id },
      data: dto,
    });

    // Fotos que estaban antes y ya no están: se borran de Cloudinary
    if (dto.images) {
      const removed = (current.images as string[]).filter(
        (url) => !dto.images!.includes(url),
      );
      await this.uploads.deleteImages(removed);
    }
    return updated;
  }

  async remove(id: number) {
    const product = await this.findOne(id); // 404 si no existe
    const deleted = await this.prisma.product.delete({ where: { id } });
    await this.uploads.deleteImages(product.images as string[]);
    return deleted;
  }
}