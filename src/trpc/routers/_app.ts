// import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
// export const appRouter = createTRPCRouter({
import prisma from '@/lib/db';
export const appRouter = createTRPCRouter({
    users: baseProcedure.query(async () => {
        return await prisma.user.findMany();
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;