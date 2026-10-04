import { Router } from "express";
import { getKnowledgeController,getKnowledgeIdController,getKnowTreeController,createKnowledgeController, updateKnowledgeController, deleteKnowledgeController } from "../controllers/knowledge.controllers";
import { getNoteIdController,createNoteController,getNoteListController } from "../controllers/note.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { vaildateMiddleware,vaildateID } from "../middleware/validate.middleware";
import { validateQuery } from "../middleware/vaildate.query";
import { postKnowSchema,updateKnowSchema,knowIDParamsSchemea } from "../schema/know.schema";
import { postNoteSchema,noteIDParamsSchemea } from "../schema/note.schema";
import { pageSchema } from "../schema/page.schema";
const router = Router();

router.get("/", authMiddleware, getKnowledgeController);
router.get("/:id",authMiddleware,vaildateMiddleware("params",knowIDParamsSchemea),getKnowledgeIdController);
router.post("/",authMiddleware,vaildateMiddleware("body",postKnowSchema),createKnowledgeController)
router.put("/:id",authMiddleware,vaildateMiddleware("params",knowIDParamsSchemea),vaildateMiddleware("body",updateKnowSchema),updateKnowledgeController)
router.delete("/:id",authMiddleware,vaildateMiddleware("params",knowIDParamsSchemea),deleteKnowledgeController)

router.get("/:id/tree",authMiddleware,vaildateMiddleware("params",knowIDParamsSchemea),getKnowTreeController);
// router.get("/:id/note",authMiddleware,vaildateID(knowIDParamsSchemea),getNoteIdController);
router.post("/:id/note",authMiddleware,vaildateMiddleware("params",knowIDParamsSchemea),vaildateMiddleware("body",postNoteSchema),createNoteController);
router.get('/:id/note',authMiddleware,vaildateMiddleware("params",knowIDParamsSchemea),vaildateMiddleware("query",pageSchema),getNoteListController);
export default router;