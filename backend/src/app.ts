import mysql from 'mysql2/promise';
import express from 'express';
import cors from 'cors';
import userRoute from './route/user.routes.js';
import authRoute from './route/auth.routes.js';
import knowRoute from './route/know.routes.js';
import noteRoute from './route/note.routes.js';
import {loggerMiddleware} from './middleware/logger.middleware.js'
import {errorMiddleware} from './middleware/error.middleware.js'
import { vaildateMiddleware } from './middleware/validate.middleware.js';

import { config } from './config/env.js';


const app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use(loggerMiddleware)

app.use(cors());


app.get('/',(req,res)=>{
    res.send('hello world')
})

app.use('/api/user',userRoute)
app.use('/api/note',noteRoute)
app.use('/api/know',knowRoute)
app.use('/api',authRoute)
app.use(vaildateMiddleware)
app.use(errorMiddleware)

app.listen(config.server.port, async () => {
    console.log('服务启动');
})