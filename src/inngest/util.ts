import toposort from "toposort";
import { Node, Connection } from "@/generated/prisma/client";
import { NonRetriableError } from "inngest";
import { toast } from "sonner";

export const topologicalsort = (
    nodes : Node[],
    connections: Connection[],

):Node[] => {
    if(connections.length===0){
        return nodes;
    }

    const edges: [string, string][] = connections.map((connection) => [
        connection.fromNodeId,
        connection.toNodeId,
    ]);

    const connectedNodeIds = new Set<string>();
    for (const conn of connections) {
        connectedNodeIds.add(conn.fromNodeId);
        connectedNodeIds.add(conn.toNodeId);
    }

    for (const node of nodes) {
        if (!connectedNodeIds.has(node.id)) {
            edges.push([node.id, node.id]);
        }
    }

    let sortedNodeIds : string[];
    try{
        sortedNodeIds = toposort(edges);
        sortedNodeIds = [...new Set(sortedNodeIds)];
    }catch(error){
        if(error instanceof Error && error.message.includes("Cyclic")){
            toast.error("workflow contains a cyclic node allignment");
            throw new NonRetriableError("workflow contains a cyclic dependency");
        }
        throw error;
    }

    const nodeMap = new Map(nodes.map((n)=>[n.id, n]));
    return sortedNodeIds.map((id)=>nodeMap.get(id)!).filter(Boolean);
};
