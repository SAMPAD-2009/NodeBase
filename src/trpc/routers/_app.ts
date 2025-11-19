// import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { createTRPCRouter, protectedProcedure } from '../init';
// export const appRouter = createTRPCRouter({
import prisma from '@/lib/db';
export const appRouter = createTRPCRouter({
    getWorkflows: protectedProcedure.query(async ({ctx}) => {
        return await prisma.workflow.findMany();
    }),
    createWorkflow: protectedProcedure.mutation(async () => {
        await inngest.send({
            name: "test/hello.world",
            data: {
                email: "test@example.com",
            },
        });
        return {message:"workflow created"}
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;