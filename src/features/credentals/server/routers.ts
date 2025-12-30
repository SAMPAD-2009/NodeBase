import { PAGINATION } from "@/config/constraints";
import { CredentialType } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { createTRPCRouter, protectedProcedure, premiumProcedure } from "@/trpc/init";
import z from "zod";




export const credentialsRouter = createTRPCRouter({
    create: premiumProcedure
    .input(
        z.object({
            name: z.string().min(1, "Name is required"),
            value: z.string().min(1, "Value is required"),
            type: z.enum(CredentialType),
        })
    )
    .mutation(({ ctx, input }) => {
        const { name, value, type } = input;
        return prisma.credentials.create({
            data: {
                name: name,
                value: encrypt(value),
                type: type,
                userId: ctx.auth.user.id,
               
            },
        });
    }),
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return prisma.credentials.delete({
                where: {
                    userId: ctx.auth.user.id,
                    id: input.id,
                },
            });
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1, "Name is required"),
                value: z.string().min(1, "Value is required"),
                type: z.enum(CredentialType),
                
            })
        )
        .mutation(({ ctx, input }) => {
            const { id, name, value, type } = input;

            return prisma.credentials.update({
                where: { id, userId: ctx.auth.user.id },
                data: {
                    name: name,
                    value: encrypt(value),
                    type: type,
                },
            });

        }),
    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return prisma.credentials.findUniqueOrThrow({
                where: { userId: ctx.auth.user.id, id: input.id }
            });
           
        }),

    getMany: protectedProcedure
        .input(
            z.object({
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z.number()
                    .min(PAGINATION.MIN_PAGE_SIZE)
                    .max(PAGINATION.MAX_PAGE_SIZE)
                    .default(PAGINATION.DEFAULT_PAGE_SIZE),
                search: z.string().default(""),
            })
        )
        .query(async({ ctx, input }) => {
            const { page, pageSize, search } = input;

            const [items, totalCount] = await Promise.all([
                prisma.credentials.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive",
                        }
                    },
                    orderBy: {
                        createdAt: "desc",
                    }
                }),
                prisma.credentials.count({
                    where: {
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive",
                        }
                    },
                }),
            ])
            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            };
        }),
        getByType: protectedProcedure
        .input(z.object({ type: z.enum(CredentialType) }))
        .query(({ ctx, input }) => {
            return prisma.credentials.findMany({
                where: {
                    userId: ctx.auth.user.id,
                    type: input.type,
                },
                orderBy: {
                    updatedAt: "desc",
                }
            });
        }),
});

