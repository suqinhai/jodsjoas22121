import $http from '../common/util/http'

// 获取首页布局配置
export const getHomeDeploy = (data, config = {}) => {
    return $http.get('/admin/app/layout', data, config)
}

// 提交首页布局配置
export const postHomeDeploy = (data, config = {}) => {
    return $http.post('/admin/app/layoutConfig', data, config)
}

// 获取首页布局配置
export const getTemplate = (data, config = {}) => {
    return $http.get('/admin/app/template', data, config)
}

// 获取用户VIP升级配置
export const getUserUpgradelConfig = (data, config = {}) => {
    return $http.get('/admin/user-level-config/upgradeList', data, config)
}

// 编辑用户VIP升级配置
export const editUserUpgradelConfig = (data, config = {}) => {
    return $http.post('/admin/user-level-config/upgradeEdit', data, config)
}

// 获取VIP特权列表
export const getVipPrivilegeList = (data, config = {}) => {
    return $http.get('/admin/vip-privilege-config/list', data, config)
}

// 获取VIP特权配置
export const getVipPrivilegeData = (data, config = {}) => {
    return $http.get('/admin/vip-privilege-config/detail', data, config)
}

// 修改VIP特权配置
export const postVipPrivilegeData = (data, config = {}) => {
    return $http.post('/admin/vip-privilege-config/edit', data, config)
}

// 获取优惠类型配置
export const getDiscountTypeConfig = (data, config = {}) => {
    return $http.get('/admin/vip-privilege-config/detail', data, config)
}

// 修改优惠类型配置
export const postDiscountTypeConfig = (data, config = {}) => {
    return $http.post('/admin/vip-privilege-config/edit', data, config)
}

// 获取商城模块配置
export const getShoppingMallModuleConfig = (data, config = {}) => {
    return $http.get('/admin/vip-privilege-config/detail', data, config)
}

// 修改商城模块配置
export const postShoppingMallModuleConfig = (data, config = {}) => {
    return $http.post('/admin/vip-privilege-config/edit', data, config)
}

// 获取H5顶部下载栏配置
export const getDownloadBarConfig = (data, config = {}) => {
    return $http.get('/admin/download-bar-config/list', data, config)
}

// 编辑H5顶部下载栏配置
export const postDownloadBarConfig = (data, config = {}) => {
    return $http.post('/admin/download-bar-config/edit', data, config)
}

// 获取商户可用的模板风格列表
export const getTemplateList = (data, config = {}) => {
    return $http.get('/admin/app/templateList', data, config)
}

// 创建站点
export const postAddSite = (data, config = {}) => {
    return $http.post('/admin/merchant/addSite', data, config)
}

// 获取子站点列表
export const getMerchantList = (data, config = {}) => {
    return $http.get('/admin/merchant/merchantList', data, config)
}

// 修改站点状态
export const postEditSiteStatus = (data, config = {}) => {
    return $http.post('/admin/merchant/editSiteStatus', data, config)
}

// 修改站点名称
export const postSiteName = (data, config = {}) => {
    return $http.get('/admin/merchant/editSiteName', data, config)
}
// 一键修改站点状态
export const postEditAllSiteStatus = (data, config = {}) => {
    return $http.post('/admin/merchant/oneKeyEditSiteStatus', data, config)
}

// 复制站点配置
export const postCopySiteConfig = (data, config = {}) => {
    return $http.post('/admin/merchant/copyConfig', data, config)
}

// 站点经销商模式修改
export const postDealerMode = (data, config = {}) => {
    return $http.post('/admin/merchant/editSiteMode', data, config)
}

// 渠道埋点统计
export const getChannelPatternStat = (data, config = {}) => {
    return $http.get('/admin/channel/patternStat', data, config)
}

// 商户支付渠道数据
export const getPayChannelStat = (data, config = {}) => {
    return $http.get('/admin/recharge-log/payChannelStat', data, config)
}

// 网红账号管理【分页】
export const getInfluencerAccountList = (data, config = {}) => {
    return $http.get('/admin/blogger/accountList', data, config)
}

// 添加网红账户
export const addInfluencerAccountData = (data, config = {}) => {
    return $http.post('/admin/blogger/addAccount', data, config)
}

// 编辑网红账户
export const editInfluencerAccountData = (data, config = {}) => {
    return $http.post('/admin/blogger/editAccount', data, config)
}

// 生成网红账号
export const postInfluencerAccountData = (data, config = {}) => {
    return $http.post('/admin/blogger/generateAccount', data, config)
}

// 下载网红账号错误记录
export const getAddInfAccountDownErr = (data, config = {}) => {
    return $http.get('/admin/blogger/downloadAccount', data, config)
}

// 获取活动倒计时配置
export const getCountdown = (data, config = {}) => {
    return $http.get('/admin/promotion/getCountdown', data, config)
}

// 获取VIP前端规则说明
export const getVipRuleDesc = (data, config = {}) => {
    return $http.get('/admin/user-level-config/getRuleDesc', data, config)
}

// 编辑VIP前端规则说明
export const postVipRuleDesc = (data, config = {}) => {
    return $http.post('/admin/user-level-config/ruleDescEdit', data, config)
}
