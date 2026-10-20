import { getCaptchaController,verifyCaptchaController } from "../controllers/captcha.controller";
import { Router } from "express";

const router = Router();

router.get("/", getCaptchaController);
router.post("/verify", verifyCaptchaController);

export default router;