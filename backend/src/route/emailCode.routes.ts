import { Router } from "express";
import { sendEmailCodeController,varifyEmailCodeController } from "../controllers/emailCode.controller";
import { vaildateMiddleware } from "../middleware/validate.middleware";
import { sendEmailCodeSchema, verifyEmailCodeSchema} from "../schema/emailCode.schema";



const router = Router();
router.post('/send',vaildateMiddleware("body",sendEmailCodeSchema),sendEmailCodeController);
router.post('/verify',vaildateMiddleware("body",verifyEmailCodeSchema),varifyEmailCodeController);

export default router;