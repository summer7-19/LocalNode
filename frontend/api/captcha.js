import request from "./requset";

export function getCaptcha(){
    return request.get('/captcha')
    
}

export function verifyCaptcha(data){
    return request.post('/captcha/verify',data)
}