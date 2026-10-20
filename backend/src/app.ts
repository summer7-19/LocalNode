import mysql from 'mysql2/promise';
import express from 'express';
import cors from 'cors';
import { redisClient } from './config/redis';
import userRoute from './route/user.routes';
import authRoute from './route/auth.routes';
import knowRoute from './route/know.routes';
import noteRoute from './route/note.routes';
import captchaRoute from './route/captcha.routes';
import emailCodeRoute from './route/emailCode.routes';
import redisRoute from './route/redis.route';
import {loggerMiddleware} from './middleware/logger.middleware.js'
import {errorMiddleware} from './middleware/error.middleware.js'
import { authMiddleware } from './middleware/auth.middleware';
import { getKnowTreeController } from './controllers/knowledge.controllers';
import { config } from './config/env.js';
import { requestLogger } from './middleware/requestLogger';

const app = express();

const startServer = async () => {
    await redisClient.connect();
    app.listen(config.server.port, async () => {
    console.log('服务启动');
})}

startServer().catch((error) => {
  console.log('服务启动失败',error)
  process.exit(1)  
});

app.use(requestLogger)

app.use(express.json());

app.use(express.urlencoded({ extended: false }));


app.use(loggerMiddleware)

app.use(cors());


app.get('/',(req,res)=>{
    res.send('hello world')
})
// app.use('/api/know/tree',authMiddleware,getKnowTreeController)

app.use('/api/user',userRoute)
app.use('/api/note',noteRoute)
app.use('/api/know',knowRoute)
app.use('/api/captcha',captchaRoute)
app.use('/api/emailCode',emailCodeRoute)
app.use('/api/redis',redisRoute)
app.use('/api',authRoute)
// app.use(vaildateMiddleware)
app.use(errorMiddleware)

