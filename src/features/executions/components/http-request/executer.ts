import type { NodeExecuter } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as kyOptions } from "ky";
import handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type HttpRequestData = {
    variableName?: string;
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: string;
};

export const HttpRequestExecuter: NodeExecuter<HttpRequestData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        httpRequestChannel().status(
            {
                nodeId,
                status: "loading",
            })
    );


    try {
        const result = await step.run("http-request", async () => {

            if (!data.endpoint) {
                await publish(
                    httpRequestChannel().status(
                        {
                            nodeId,
                            status: "error",
                        })
                );
                throw new NonRetriableError("HTTP REQUEST:endpoint is required");
            }
            if (!data.variableName) {
                throw new NonRetriableError("HTTP REQUEST:Variable name is required");
            }
            if (!data.method) {
                throw new NonRetriableError("HTTP REQUEST:Method is required");
            }


            const method = data.method || "GET";
            const endpoint = handlebars.compile(data.endpoint)(context);

            const options: kyOptions = { method };

            if (["POST", "PUT", "PATCH"].includes(method)) {
                const resolved = handlebars.compile(data.body || "{}")(context);
                JSON.parse(resolved);
                options.body = resolved;
                options.headers = {
                    "Content-Type": "application/json",
                };
            }

            const response = await ky(endpoint, options);
            const contentType = response.headers.get("content-type");
            const responseData = contentType?.includes("application/json")
                ? await response.json()
                : await response.text();

            const responsePayload = {
                httpResponse: {
                    status: response.status,
                    statusText: response.statusText,
                    data: responseData,
                }
            }     

            return {
                ...context,
                [data.variableName]: responsePayload,
            }


        });

        await publish(
            httpRequestChannel().status(
                {
                    nodeId,
                    status: "success",
                })
        );

        return result;

    } catch (error) {
        await publish(
            httpRequestChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw error;
    }


}
