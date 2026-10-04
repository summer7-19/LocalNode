// 此文件预留给用户自行接入 axios，当前不书写实际请求逻辑。
// 建议在此目录补充：
// - axios 实例与请求/响应拦截器
// - auth.js：登录、注册、获取当前用户
// - note.js：笔记增删改查
// - folder.js / tag.js：目录与标签相关接口

import axios from "axios"

const request= axios.create({
    baseURL:'http://localhost:3000/api',
    timeout:5000
})

export default request;
