import pino from 'pino';
import { config } from '../config/env';

const isProduction = config.env.NODE_ENV === 'production';
const baseOptions = {
  level: config.log.level ?? (isProduction ? 'info' : 'debug'),
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      'req.headers.authorization',
      'req.headers.cookie',
      'emailCode',
      'captcha',
      'token',
      'accessToken',
      'refreshToken',
    ],
    censor: '[REDACTED]',
  },
};

export const logger = isProduction
  ? pino(baseOptions)
  : pino({
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });