import type { NodeExecuter } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import handlebars from "handlebars";
import { cheerioChannel } from "@/inngest/channels/cheerio";
import * as cheerio from "cheerio";
import ky from "ky";

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type CheerioSelectorData = {
    variableName?: string;
    url?: string;
    selector?: string;
    extractAttribute?: string; // e.g., "text", "html", "attr:href", "attr:src"
    extractMultiple?: boolean;
};

export const cheerioExecuter: NodeExecuter<CheerioSelectorData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        cheerioChannel().status({
            nodeId,
            status: "loading",
        })
    );

    try {
        const result = await step.run("cheerio-extract", async () => {
            if (!data.variableName) {
                throw new NonRetriableError("CHEERIO: Variable name is required");
            }
            if (!data.url) {
                throw new NonRetriableError("CHEERIO: URL is required");
            }
            if (!data.selector) {
                throw new NonRetriableError("CHEERIO: CSS selector is required");
            }

            // Compile URL with handlebars for dynamic values
            const compiledUrl = handlebars.compile(data.url)(context);

            // Fetch HTML from URL
            let html: string;
            try {
                const response = await ky(compiledUrl, {
                    method: "GET",
                    timeout: 30000,
                });
                html = await response.text();
            } catch (error) {
                throw new NonRetriableError(
                    `CHEERIO: Failed to fetch URL: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }

            // Load HTML with cheerio
            const $ = cheerio.load(html);

            // Extract data
            const extractAttribute = data.extractAttribute || "text";
            const elements = $(data.selector);

            if (elements.length === 0) {
                throw new NonRetriableError(
                    `CHEERIO: No elements found with selector: ${data.selector}`
                );
            }

            let extractedData: string | string[] | Record<string, any> | Record<string, any>[];

            if (data.extractMultiple) {
                const results: Record<string, any> = {};
                let elementIndex = 1;
                elements.each((i, el) => {
                    const elementKey = `${(data.selector as string).replace(/[^a-zA-Z0-9]/g, "")}${elementIndex}`;
                    const result: Record<string, any> = {};

                    if (extractAttribute === "text") {
                        result.text = $(el).text().trim();
                    } else if (extractAttribute === "html") {
                        result.html = $(el).html();
                    } else if (extractAttribute.startsWith("attr:")) {
                        const attrName = extractAttribute.replace("attr:", "");
                        result[attrName] = $(el).attr(attrName);
                    } else {
                        result.text = $(el).text().trim();
                    }

                    results[elementKey] = result;
                    elementIndex++;
                });
                extractedData = results;
            } else {
                const element = elements.first();
                if (extractAttribute === "text") {
                    extractedData = element.text().trim();
                } else if (extractAttribute === "html") {
                    extractedData = element.html() || "";
                } else if (extractAttribute.startsWith("attr:")) {
                    const attrName = extractAttribute.replace("attr:", "");
                    extractedData = element.attr(attrName) || "";
                } else {
                    extractedData = element.text().trim();
                }
            }

            return {
                ...context,
                [data.variableName]: {
                    cheerioExtracted: extractedData,
                    selector: data.selector,
                    elementsFound: elements.length,
                },
            };
        });

        await publish(
            cheerioChannel().status({
                nodeId,
                status: "success",
            })
        );

        return result;
    } catch (error) {
        await publish(
            cheerioChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw error;
    }
};
