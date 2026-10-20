import { Router } from "express";
import { testRedis } from "../controllers/redis.controller";

const router = Router();

router.get("/", testRedis);

export default router;