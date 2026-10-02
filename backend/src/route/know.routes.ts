import { Router } from "express";
import { getKnowledgeController,getKnowledgeIdController,getKnowTreeController,createKnowledgeController, updateKnowledgeController, deleteKnowledgeController } from "../controllers/knowledge.controllers";
import { getNoteIdController,createNoteController } from "../controllers/note.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { vaildateMiddleware,vaildateID } from "../middleware/validate.middleware";
import { postKnowSchema,updateKnowSchema,knowIDParamsSchemea } from "../schema/know.schema";
import { postNoteSchema,noteIDParamsSchemea } from "../schema/note.schema";
const router = Router();

router.get("/", authMiddleware, getKnowledgeController);
router.get("/:id",authMiddleware,vaildateID(knowIDParamsSchemea),getKnowledgeIdController);
router.post("/",authMiddleware,vaildateMiddleware(postKnowSchema),createKnowledgeController)
router.put("/:id",authMiddleware,vaildateID(knowIDParamsSchemea),vaildateMiddleware(updateKnowSchema),updateKnowledgeController)
router.delete("/:id",authMiddleware,vaildateID(knowIDParamsSchemea),deleteKnowledgeController)

router.get("/:id/tree",authMiddleware,vaildateID(knowIDParamsSchemea),getKnowTreeController);
router.get("/:id/note",authMiddleware,vaildateID(noteIDParamsSchemea),getNoteIdController);
router.post("/:id/note",authMiddleware,vaildateMiddleware(postNoteSchema),createNoteController)
export default router;