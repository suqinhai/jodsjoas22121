/*
 * @Date: 2023-09-19 13:00:05
 * @LastEditors: Sai
 * @LastEditTime: 2023-09-20 09:51:49
 */
import $http from '../common/util/http'

// 登录
export const handleLogin = (data, config = {}) => {
    return $http.post('/admin/emp/login', data, config)
}

// 登出
export const handleLogout = (data, config = {}) => {
    return $http.get('/admin/emp/logout', data, config)
}

// 获取菜单数据
export const getMenuList = (data, config = {}) => {
    return $http.get('/admin/emp/menus', data, config)
}

// 获取验证码
export const getVerificationCode = (data, config = {}) => {
    // bizType:login=登录；bind=绑定手机号码；register=注册；find_pwd=找回密码；auth=鉴权（用户登录后进行敏感操作前的身份验证）
    return $http.get('/user/common/sendCaptcha', data, config)
}

// 校验验证码
export const postVerificationCode = (data, config = {}) => {
    return $http.post('/user/user/smsCheck', data, config)
}

// 修改密码
export const postchangePassword = (data, config = {}) => {
    return $http.post('/admin/emp/changePwd', data, config)
}

// 查看Google身份验证器链接
export const getGoogleAuthQr = (data, config = {}) => {
    return $http.get('/admin/emp/viewGoogleAuthQr', data, config)
}

// 绑定Google身份验证器
export const postBindGoogleAuth = (data, config = {}) => {
    return $http.post('/admin/emp/bindGoogleAuth', data, config)
}

// 获取商户支付配置
export const getMerchantPayConfig = (data, config = {}) => {
    return $http.get('/admin/merchant-pay-config/global', data, config)
}