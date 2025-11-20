// import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
// export const appRouter = createTRPCRouter({
import prisma from '@/lib/db';

export const appRouter = createTRPCRouter({
    testA1: baseProcedure.mutation(async () => {
        await inngest.send({name:'execute/ai'});
        return { success: true, message: "workflow created" }

    }),
    getWorkflows: protectedProcedure.query(async ({ ctx }) => {
        return await prisma.workflow.findMany();
    }),
    createWorkflow: protectedProcedure.mutation(async () => {
        await inngest.send({
            name: "test/hello.world",
            data: {
                email: "test@example.com",
            },
        });
        return { message: "workflow created" }
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;