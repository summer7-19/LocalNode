import 'dotenv/config'

const env = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'NODE_ENV',
    'LOG_LEVEL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_PASS',
    'SMTP_USER',
    'SMTP_SECURE',
    'SMTP_FROM'
]

const  getEnv=(key:string)=>{
    const value = process.env[key]
    if(!value){
        throw new Error(`缺少${key}配置`)
    }
    return value
}

export const config = {
    db:{
        host:getEnv('DB_HOST'),
        port:Number(getEnv('DB_PORT')),
        user:getEnv('DB_USER'),
        password:getEnv('DB_PASSWORD'),
        database:getEnv('DB_NAME')
    },
    server:{
        port:3000
    },
    jwt:{
        JWT_SECRET:'secret'
    },
    log:{
        level:getEnv('LOG_LEVEL')
    },
    env:{
        NODE_ENV:getEnv('NODE_ENV')
    },
    SMTP:{
        SMTP_USER:getEnv('SMTP_USER'),
        SMTP_SECURE:getEnv('SMTP_SECURE'),
        SMTP_HOST:getEnv('SMTP_HOST'),
        SMTP_PORT:Number(getEnv('SMTP_PORT')),
        SMTP_FROM:getEnv('SMTP_FROM'),
        SMTP_PASS:getEnv('SMTP_PASS')
    }
}
