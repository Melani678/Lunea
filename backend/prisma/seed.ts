import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL!;
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password },
  });
  console.log('Admin creado:', email);
}

main().finally(() => prisma.$disconnect());