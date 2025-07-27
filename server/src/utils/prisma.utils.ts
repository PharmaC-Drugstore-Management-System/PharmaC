// /lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
if(prisma){
    console.log('Connected to Db')
}else{
    console.log('Failed to connected')
}

export default prisma;
