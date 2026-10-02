import 'dotenv/config'

const env = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
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
    }
}
