import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "@/lib/db"
import { checkout,polar,portal } from "@polar-sh/better-auth";
import { polarClient } from "@/lib/polar";


export const auth = betterAuth({
    database: prismaAdapter(prisma,{
        provider:"postgresql",
    }),
    emailAndPassword:{
        enabled:true,
        autoSignIn:true,
    },

    plugins:[
        polar({
            client: polarClient,
            createCustomerOnSignUp:true,
            use:[
                checkout({
                    products:[
                        {
                            productId: "c67d6306-d99a-472a-b082-633f7a2ea4aa",
                            slug: "Nodebase-PRO"
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true
                }),
                portal(),
            ]
        })
    ]
 
});
// 2:10:54