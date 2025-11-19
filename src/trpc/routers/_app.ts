// import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
// export const appRouter = createTRPCRouter({
import prisma from '@/lib/db';
export const appRouter = createTRPCRouter({
    users: protectedProcedure.query(async ({ctx}) => {
        // console.log({userID: ctx.auth.user.id});

        return await prisma.user.findMany({
            where:{
                id: ctx.auth.user.id,
            }
        });
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;