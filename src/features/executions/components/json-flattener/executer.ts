import type { NodeExecuter } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { jsonFlattenerChannel } from "@/inngest/channels/json-flattener";

type JsonFlattenerData = {
    variableName?: string;
    sourceVariable?: string;
    nestingPath?: string;
    fieldMappings?: Array<{ sourceField: string; newName: string }>;
};

export const jsonFlattenerExecuter: NodeExecuter<JsonFlattenerData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        jsonFlattenerChannel().status({
            nodeId,
            status: "loading",
        })
    );

    try {
        const result = await step.run("json-flattener-transform", async () => {
            if (!data.variableName) {
                throw new NonRetriableError("JSON_FLATTENER: Output variable name is required");
            }
            if (!data.sourceVariable) {
                throw new NonRetriableError("JSON_FLATTENER: Source variable is required");
            }

            // Get the source data from context
            const sourceData = context[data.sourceVariable];

            if (sourceData === undefined) {
                throw new NonRetriableError(
                    `JSON_FLATTENER: Source variable '${data.sourceVariable}' not found in context`
                );
            }

            // If source data is not an object, it can't be transformed
            if (typeof sourceData !== "object" || sourceData === null) {
                throw new NonRetriableError(
                    `JSON_FLATTENER: Source variable must be an object, got ${typeof sourceData}`
                );
            }

            // Flatten the object
            let transformedData: Record<string, any> = sourceData;

            // Apply field mappings if provided
            if (data.fieldMappings && data.fieldMappings.length > 0) {
                transformedData = { ...transformedData };

                for (const mapping of data.fieldMappings) {
                    if (mapping.sourceField in transformedData) {
                        transformedData[mapping.newName] = transformedData[mapping.sourceField];
                        delete transformedData[mapping.sourceField];
                    }
                }
            }

            // Apply nesting if specified
            if (data.nestingPath && data.nestingPath.trim()) {
                transformedData = {
                    [data.nestingPath]: transformedData,
                };
            }

            return {
                ...context,
                [data.variableName]: transformedData,
            };
        });

        await publish(
            jsonFlattenerChannel().status({
                nodeId,
                status: "success",
            })
        );

        return result;
    } catch (error) {
        await publish(
            jsonFlattenerChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw error;
    }
};
