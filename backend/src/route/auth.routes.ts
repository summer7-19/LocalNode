import { Router } from "express";
import { Register,login } from "../controllers/auth.controllers";
import { vaildateID,vaildateMiddleware } from "../middleware/validate.middleware";
import { authSchema,authLoginSchema} from "../schema/auth.schema";
// import type{ registerDto,loginDto } from "../schemas/auth.schema"

const router = Router();

router.post('/login',vaildateMiddleware(authLoginSchema),login)

router.post('/register',vaildateMiddleware(authSchema),Register)

export default router