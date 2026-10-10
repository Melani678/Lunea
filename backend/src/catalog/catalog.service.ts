import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';

type SectionWithProducts = Prisma.SectionGetPayload<{
  include: { products: true };
}>;
type Product = SectionWithProducts['products'][number];

const MARGIN = 40;
const COLS = 3;
const GAP = 14;
const ROW_GAP = 18;
const IMG_H = 235; // alto de la foto
const CARD_EXTRA = 64; // espacio bajo la foto para nombre, precio y detalles
const PAD = 8; // espacio interno del texto en la tarjeta
const PINK = '#DB2777';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async generatePdf(sectionId?: number): Promise<Buffer> {
    const sections = await this.prisma.section.findMany({
      where: sectionId ? { id: sectionId } : undefined,
      orderBy: { order: 'asc' },
      include: { products: { orderBy: { createdAt: 'desc' } } },
    });
    const withProducts = sections.filter((s) => s.products.length > 0);

    if (withProducts.length === 0) {
      throw new NotFoundException('No hay productos para generar el catálogo');
    }

    const images = await this.loadProductImages(
      withProducts.flatMap((s) => s.products),
    );
    const logo = await this.loadLogo();

    return this.render(withProducts, images, logo);
  }

  // Descarga la primera foto de cada producto, de a 8 a la vez
  private async loadProductImages(products: Product[]) {
    const images = new Map<number, Buffer>();
    const BATCH = 8;

    for (let i = 0; i < products.length; i += BATCH) {
      await Promise.all(
        products.slice(i, i + BATCH).map(async (product) => {
          const first = (product.images as string[])?.[0];
          if (!first) return;
          const buffer = await this.fetchImage(first);
          if (buffer) images.set(product.id, buffer);
        }),
      );
    }
    return images;
  }

  private async fetchImage(url: string): Promise<Buffer | null> {
    // Cloudinary nos devuelve la foto reducida y en JPG (pdfkit no lee WebP)
    const candidates = url.includes('res.cloudinary.com')
      ? [url.replace('/upload/', '/upload/f_jpg,w_600,q_auto/'), url]
      : [url];

    for (const candidate of candidates) {
      try {
        const res = await fetch(candidate);
        if (res.ok) return Buffer.from(await res.arrayBuffer());
      } catch {
        // probamos con la siguiente opción
      }
    }
    return null;
  }

  // El logo está en el frontend (/logo.png). Si no se encuentra, la portada sale sin logo.
  private async loadLogo(): Promise<Buffer | null> {
    const origin = (process.env.FRONTEND_URL ?? '').split(',')[0]?.trim();
    if (!origin) return null;

    try {
      const res = await fetch(`${origin}/logo.png`);
      const type = res.headers.get('content-type') ?? '';
      if (!res.ok || !(type.includes('png') || type.includes('jpeg'))) {
        return null;
      }
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  private render(
    sections: SectionWithProducts[],
    images: Map<number, Buffer>,
    logo: Buffer | null,
  ): Promise<Buffer> {
    const storeName = process.env.STORE_NAME ?? 'Catálogo';

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: MARGIN,
        autoFirstPage: false,
        bufferPages: true,
        info: { Title: `Catálogo ${storeName}` },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Medidas de una hoja A4, en puntos
      const pageW = 595.28;
      const pageH = 841.89;
      const contentW = pageW - MARGIN * 2;
      const cardW = (contentW - GAP * (COLS - 1)) / COLS;
      const cardH = IMG_H + CARD_EXTRA;
      const bottomLimit = pageH - MARGIN;

      // ---- Portada ----
      doc.addPage();
      if (logo) {
        try {
          doc.image(logo, (pageW - 140) / 2, 170, {
            fit: [140, 140],
            align: 'center',
            valign: 'center',
          });
        } catch {
          // formato no compatible: portada sin logo
        }
      }
      doc
        .font('Helvetica-Bold')
        .fontSize(34)
        .fillColor(PINK)
        .text(storeName, MARGIN, 340, { width: contentW, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(16)
        .fillColor('#555555')
        .text('Catálogo de productos', MARGIN, doc.y + 8, {
          width: contentW,
          align: 'center',
        });
      const date = new Date().toLocaleDateString('es', {
        timeZone: 'America/La_Paz',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc
        .fontSize(10)
        .fillColor('#999999')
        .text(date, MARGIN, doc.y + 12, { width: contentW, align: 'center' });

      // ---- Página reservada para el índice (se llena al final) ----
      const showIndex = sections.length > 1;
      if (showIndex) doc.addPage();

      // ---- Franja con el título de la sección ----
      const drawHeader = (title: string, total?: number) => {
        doc.rect(MARGIN, MARGIN, contentW, 34).fill(PINK);
        doc
          .font('Helvetica-Bold')
          .fontSize(18)
          .fillColor('#FFFFFF')
          .text(title, MARGIN + 12, MARGIN + 8, {
            width: contentW - (total !== undefined ? 140 : 24),
            height: 22,
            ellipsis: true,
          });
        if (total !== undefined) {
          doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#FFFFFF')
            .text(
              `${total} ${total === 1 ? 'producto' : 'productos'}`,
              MARGIN + contentW - 112,
              MARGIN + 12,
              { width: 100, align: 'right', lineBreak: false },
            );
        }
        return MARGIN + 34 + 20; // posición donde empiezan los productos
      };

      // ---- Tarjeta de un producto ----
      const drawCard = (product: Product, x: number, y: number) => {
        const image = images.get(product.id);

        // La foto se recorta a su recuadro: así nunca se sale de la tarjeta
        doc.save();
        doc.rect(x, y, cardW, IMG_H).clip();
        doc.rect(x, y, cardW, IMG_H).fill('#F3F4F6');
        if (image) {
          try {
            doc.image(image, x, y, {
              cover: [cardW, IMG_H],
              align: 'center',
              valign: 'center',
            });
          } catch {
            // imagen no compatible: queda el recuadro gris
          }
        }
        doc.restore();

        // Marco de la tarjeta
        doc
          .rect(x, y, cardW, cardH)
          .lineWidth(0.5)
          .strokeColor('#E5E7EB')
          .stroke();

        const tx = x + PAD;
        const tw = cardW - PAD * 2;

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#111827')
          .text(product.name, tx, y + IMG_H + 8, {
            width: tw,
            height: 26,
            ellipsis: true,
          });

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(PINK)
          .text(`Bs ${Number(product.price).toFixed(2)}`, tx, y + IMG_H + 36, {
            width: tw,
            lineBreak: false,
          });

        const sizes = (product.sizes as string[] | null) ?? [];
        const colors = (product.colors as string[] | null) ?? [];
        const details = [
          sizes.length ? `Tallas: ${sizes.join(', ')}` : '',
          colors.length ? `Colores: ${colors.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join(' · ');

        if (details) {
          doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor('#6B7280')
            .text(details, tx, y + IMG_H + 51, {
              width: tw,
              height: 10,
              ellipsis: true,
            });
        }
      };

      // ---- Una página nueva por cada sección ----
      const sectionPages: { name: string; count: number; page: number }[] = [];

      for (const section of sections) {
        doc.addPage();
        sectionPages.push({
          name: section.name,
          count: section.products.length,
          page: doc.bufferedPageRange().count - 1,
        });
        let y = drawHeader(section.name, section.products.length);

        section.products.forEach((product, i) => {
          const col = i % COLS;
          // Al empezar una fila nueva, bajamos; si no cabe, pasamos a otra página
          if (col === 0 && i > 0) y += cardH + ROW_GAP;
          if (col === 0 && y + cardH > bottomLimit) {
            doc.addPage();
            y = drawHeader(`${section.name} (continuación)`);
          }
          drawCard(product, MARGIN + col * (cardW + GAP), y);
        });
      }

      // ---- Índice (página 1, después de la portada) ----
      if (showIndex) {
        doc.switchToPage(1);
        doc
          .font('Helvetica-Bold')
          .fontSize(22)
          .fillColor(PINK)
          .text('Índice', MARGIN, MARGIN, { width: contentW });

        let iy = MARGIN + 50;
        for (const entry of sectionPages) {
          if (iy > bottomLimit - 20) break; // seguridad si hubiera demasiadas secciones
          doc
            .font('Helvetica')
            .fontSize(12)
            .fillColor('#111827')
            .text(entry.name, MARGIN, iy, {
              width: contentW - 90,
              lineBreak: false,
            });
          doc
            .fillColor('#6B7280')
            .text(`Página ${entry.page}`, MARGIN + contentW - 90, iy, {
              width: 90,
              align: 'right',
              lineBreak: false,
            });
          doc
            .moveTo(MARGIN, iy + 20)
            .lineTo(MARGIN + contentW, iy + 20)
            .lineWidth(0.5)
            .strokeColor('#E5E7EB')
            .stroke();
          iy += 30;
        }
      }

      // ---- Numeración de páginas (la portada no lleva) ----
      const { start, count } = doc.bufferedPageRange();
      for (let i = start + 1; i < start + count; i++) {
        doc.switchToPage(i);
        doc.page.margins.bottom = 0;
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#9CA3AF')
          .text(`${storeName} · Página ${i}`, MARGIN, pageH - 28, {
            width: contentW,
            align: 'center',
            lineBreak: false,
          });
      }

      doc.end();
    });
  }
}