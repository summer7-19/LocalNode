import { Router } from "express";
import { getNoteController,getNoteIdController,createNoteController, updateNoteController, deleteNoteController } from "../controllers/note.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { vaildateMiddleware,vaildateID } from "../middleware/validate.middleware";
import { postNoteSchema,updateNoteSchema,noteIDParamsSchemea } from "../schema/note.schema";

const router = Router();

router.get("/", authMiddleware, getNoteController);
// router.get("/:id",authMiddleware,vaildateID(noteIDParamsSchemea),getNoteIdController);
// router.post("/",authMiddleware,vaildateMiddleware(postNoteSchema),createNoteController)
router.put("/:id",authMiddleware,vaildateID(noteIDParamsSchemea),vaildateMiddleware(updateNoteSchema),updateNoteController)
router.delete("/:id",authMiddleware,vaildateID(noteIDParamsSchemea),deleteNoteController)
export default router;