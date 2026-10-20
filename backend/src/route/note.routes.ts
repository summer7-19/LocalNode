import { Router } from "express";
import { getNoteController,getNoteIdController,createNoteController, updateNoteController, deleteNoteController,searchController } from "../controllers/note.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { vaildateMiddleware,vaildateID } from "../middleware/validate.middleware";
import { postNoteSchema,updateNoteSchema,noteIDParamsSchemea } from "../schema/note.schema";

const router = Router();

router.get("/", authMiddleware, getNoteController);
router.post("/search",authMiddleware,searchController)
router.get("/:id",authMiddleware,vaildateMiddleware("params",noteIDParamsSchemea),getNoteIdController);
// router.post("/",authMiddleware,vaildateMiddleware(postNoteSchema),createNoteController)
router.put("/:id",authMiddleware,vaildateMiddleware("params",noteIDParamsSchemea),vaildateMiddleware("body",updateNoteSchema),updateNoteController)
router.delete("/:id",authMiddleware,vaildateMiddleware("params",noteIDParamsSchemea),deleteNoteController)

export default router;