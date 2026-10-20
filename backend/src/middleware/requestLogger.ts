import { randomUUID } from "node:crypto";
import pinoHttp from "pino-http";
import { logger } from "../utils/logger";

export const requestLogger = pinoHttp({
    logger,
    genReqId: () => randomUUID(),
    customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url}completed`
    },
    customErrorMessage: (req, res) => {
        return `${req.method} ${req.url}failed`
    }
})