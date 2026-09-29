import { PrismaClient } from '@prisma/client';

// Una sola instancia compartida por toda la aplicación
const prisma = new PrismaClient();

export default prisma;
