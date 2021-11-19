/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPrismaClient } from '@shared_libs/createPrismaClient';
// import { v4 as uuidv4 } from 'uuid';

export const handler = async (): Promise<any[]> => {
  const prisma = createPrismaClient();
  console.log('from index');
  let users: any[] = [];
  try {
    users = await prisma.user.findMany();
  } catch (e) {
    console.error(e);
  }

  prisma.$disconnect();
  return users;
};
