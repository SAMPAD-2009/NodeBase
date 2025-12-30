import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "@/lib/db"
import { checkout,polar,portal } from "@polar-sh/better-auth";
import { polarClient } from "@/lib/polar";

// Sanity-check required environment variables at startup so missing config
// shows an explicit error in production logs (e.g., Vercel deployments).
const requiredEnv: Record<string, string | undefined> = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_SUCCESS_URL: process.env.POLAR_SUCCESS_URL,
    DATABASE_URL: process.env.DATABASE_URL,
};

if (process.env.NODE_ENV === "production") {
    const missing = Object.keys(requiredEnv).filter((k) => !requiredEnv[k]);
    if (missing.length > 0) {
        throw new Error(`Missing required env vars for production: ${missing.join(", ")}`);
    }
}

export const auth = betterAuth({
    database: prismaAdapter(prisma,{
        provider:"postgresql",
    }),
    emailAndPassword:{
        enabled:true,
        autoSignIn:true,
    },
    socialProviders:{
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
        }
    },
    plugins:[
        polar({
            client: polarClient,
            createCustomerOnSignUp:true,
            use:[
                checkout({
                    products:[
                        {
                            productId: "74beb60f-ef1f-42b3-a9bf-e936dbc3b3a7",
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