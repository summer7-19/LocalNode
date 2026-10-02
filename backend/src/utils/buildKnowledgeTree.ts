import { noteTreeNode } from "./attachNotesToTree";

interface KnowledgeNodeBase {
    knowledgeID: number;
    knowledgeName: string;
    parentID: number | null;
    userID: number;
    description: string;
}


export interface KnowledgeTreeNode {
    knowledgeID: number;
    knowledgeName: string;
    parentID: number | null;
    userID: number;
    description: string;
    children: KnowledgeTreeNode[];
    notes: noteTreeNode[];
}


export function buildKnowledgeTree(rows: KnowledgeNodeBase[], rootID?: number): KnowledgeTreeNode[] {
    const map = new Map<number, KnowledgeTreeNode>()
    const roots: KnowledgeTreeNode[] = []
    for (const row of rows) {
        const node: KnowledgeTreeNode = {
            knowledgeID: row.knowledgeID,
            knowledgeName: row.knowledgeName,
            parentID: row.parentID,
            userID: row.userID,
            description: row.description,
            children: [],
            notes: []
        }
        map.set(row.knowledgeID, node)
        if (row.parentID === null) {
            roots.push(node)
        }
    }
    
    for (const row of rows) {
        const node = map.get(row.knowledgeID)
        if (!node) {
            continue
        }
        if (row.parentID !== null) {
            const parent = map.get(row.parentID)
            if (parent) {
                parent.children.push(node as KnowledgeTreeNode)
            }
        }
    }

    if (rootID !== undefined) {
        const root = map.get(rootID)
        if (!root) {
            return []
        }
        return [root]
    }
    return roots
}