import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const TAG = 'catalogo-ropa';
// No tocamos subidas recientes: podrían estar en un formulario aún sin guardar
const MIN_AGE_HOURS = 24;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? '';
cloudinary.config({
  cloud_name: cloudName,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

function extractPublicId(url: string): string | null {
  const prefix = `https://res.cloudinary.com/${cloudName}/image/upload/`;
  if (!url.startsWith(prefix)) return null;
  const match = url.slice(prefix.length).match(/^(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

async function main() {
  const apply = process.argv.includes('--delete');

  // 1. Imágenes que SÍ se usan (productos y carrusel)
  const used = new Set<string>();
  const products = await prisma.product.findMany({ select: { images: true } });
  for (const p of products) {
    for (const url of p.images as string[]) {
      const id = extractPublicId(url);
      if (id) used.add(id);
    }
  }
  const slides = await prisma.slide.findMany({ select: { imageUrl: true } });
  for (const s of slides) {
    const id = extractPublicId(s.imageUrl);
    if (id) used.add(id);
  }

  // 2. Imágenes con nuestro tag en Cloudinary que nadie usa
  const orphans: string[] = [];
  let cursor: string | undefined;
  do {
    const res = await cloudinary.api.resources_by_tag(TAG, {
      max_results: 500,
      next_cursor: cursor,
    });
    for (const r of res.resources) {
      const ageHours = (Date.now() - new Date(r.created_at).getTime()) / 36e5;
      if (!used.has(r.public_id) && ageHours >= MIN_AGE_HOURS) {
        orphans.push(r.public_id);
      }
    }
    cursor = res.next_cursor;
  } while (cursor);

  console.log(`Imágenes huérfanas encontradas: ${orphans.length}`);
  orphans.forEach((id) => console.log(' -', id));

  if (!apply) {
    console.log('\nSimulación: no se borró nada. Ejecuta con --delete para borrarlas.');
    return;
  }

  for (let i = 0; i < orphans.length; i += 100) {
    await cloudinary.api.delete_resources(orphans.slice(i, i + 100), {
      invalidate: true,
    });
  }
  console.log('Listo: imágenes borradas.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());