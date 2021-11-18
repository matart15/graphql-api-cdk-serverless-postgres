import { createPrismaClient } from '@shared_libs/createPrismaClient';
import { v4 as uuidv4 } from 'uuid';

export const handler = async (): Promise<void> => {
  const prisma = createPrismaClient();

  try {
    await prisma.user.create({
      data: { uuid: uuidv4() },
    });
  } catch (e) {
    console.error(e);
  }

  prisma.$disconnect();
};
