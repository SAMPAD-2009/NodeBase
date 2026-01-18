import type { NodeExecuter } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import handlebars from "handlebars";
import { screenshotChannel } from "@/inngest/channels/screenshot";
import ky from "ky";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type ScreenshotData = {
    variableName?: string;
    url?: string;
    format?: "png" | "jpeg" | "webp";
    fullPage?: boolean;
    width?: number;
    height?: number;
    credentialId?: string;
};

export const screenshotExecuter: NodeExecuter<ScreenshotData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
    userId,
}) => {
    await publish(
        screenshotChannel().status({
            nodeId,
            status: "loading",
        })
    );

    try {
        if (!data.variableName) {
            throw new NonRetriableError("SCREENSHOT: Variable name is required");
        }
        if (!data.url) {
            throw new NonRetriableError("SCREENSHOT: URL is required");
        }
        if (!data.credentialId) {
            throw new NonRetriableError("SCREENSHOT: API credential is required");
        }

        // Get API credential
        const credentialValue = await step.run("get-credential", () => {
            return prisma.credentials.findUniqueOrThrow({
                where: {
                    id: data.credentialId,
                    userId,
                },
            });
        });

        if (!credentialValue) {
            throw new NonRetriableError("SCREENSHOT: API credential not found");
        }

        const apiKey = decrypt(credentialValue.value);

        // Compile URL with handlebars for dynamic values
        const compiledUrl = handlebars.compile(data.url)(context);
        console.log("Compiled URL:", compiledUrl);

        const format = data.format || "png";
        const fullPage = data.fullPage !== false;
        const width = data.width || 1920;
        const height = data.height || 1080;

        const result = await step.run("take-screenshot", async () => {
            const screenshotUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&url=${encodeURIComponent(compiledUrl)}&format=${format}&full_page=${fullPage}&width=${width}&height=${height}`;

            const response = await ky(screenshotUrl, {
                method: "GET",
                timeout: 60000,
            });

            const screenshotBuffer = await response.arrayBuffer();
            const base64Screenshot = Buffer.from(screenshotBuffer).toString("base64");

            return {
                ...context,
                [data.variableName as string]: {
                    screenshot: {
                        base64: base64Screenshot,
                        url: compiledUrl,
                        format: format,
                        width: width,
                        height: height,
                        fullPage: fullPage,
                        timestamp: new Date().toISOString(),
                    },
                },
            };
        });

        await publish(
            screenshotChannel().status({
                nodeId,
                status: "success",
            })
        );

        return result;
    } catch (error) {
        await publish(
            screenshotChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw error;
    }
};
