import { noteTreeNode } from "./attachNotesToTree";

interface KnowledgeNodeBase {
    id: number;
    title: string;
    parentId: number | null;
    userID: number;
    description: string;
}


export interface KnowledgeTreeNode {
    id: number;
    title: string;
    parentId: number | null;
    userID: number;
    description: string;
    children: KnowledgeTreeNode[];
    notes: noteTreeNode[];
}

export const buildKnowledgeTree = (
    rows: KnowledgeNodeBase[]
): KnowledgeTreeNode[] => {

    const map = new Map<number, KnowledgeTreeNode>()
    const roots: KnowledgeTreeNode[] = []

    for (const row of rows) {

        map.set(row.id, {
            ...row,
            children: [],
            notes: []
        })
    }

    for (const row of rows) {

        const node = map.get(row.id)!

        if (row.parentId === null) {

            roots.push(node)

        } else {

            const parent = map.get(row.parentId)

            if (parent) {
                parent.children.push(node)
            }
        }
    }

    return roots
}
// export function buildKnowledgeTree(rows: KnowledgeNodeBase[], rootID?: number): KnowledgeTreeNode[] {
//     const map = new Map<number, KnowledgeTreeNode>()
//     const roots: KnowledgeTreeNode[] = []
//     for (const row of rows) {
//         const node: KnowledgeTreeNode = {
//             knowledgeID: row.knowledgeID,
//             knowledgeName: row.knowledgeName,
//             parentID: row.parentID,
//             userID: row.userID,
//             description: row.description,
//             children: [],
//             notes: []
//         }
//         map.set(row.knowledgeID, node)
//         if (row.parentID === null) {
//             roots.push(node)
//         }
//     }
    
//     for (const row of rows) {
//         const node = map.get(row.knowledgeID)
//         if (!node) {
//             continue
//         }
//         if (row.parentID !== null) {
//             const parent = map.get(row.parentID)
//             if (parent) {
//                 parent.children.push(node as KnowledgeTreeNode)
//             }
//         }
//     }

//     if (rootID !== undefined) {
//         const root = map.get(rootID)
//         if (!root) {
//             return []
//         }
//         return [root]
//     }
//     return roots
// }