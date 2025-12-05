import $http from '../common/util/http'

// 经销商管理列表
export const getDealerList = (data, config = {}) => {
    return $http.get('/admin/dealer/managerList', data, config)
}

// 修改经销商数据
export const postDealerData = (data, config = {}) => {
    return $http.post('/admin/dealer/bindEdit', data, config)
}

// 获取经销商联系设置
export const getDealerContactConfig = (data, config = {}) => {
    return $http.get('/admin/dealer/awardCfgList', data, config)
}

// 提交经销商联系设置
export const postDealerContactConfig = (data, config = {}) => {
    return $http.post('/admin/dealer/awardCfgEdit', data, config)
}

// 获取经销商奖励配置
export const getDealerAwardConfig = (data, config = {}) => {
    return $http.get('/admin/dealer/defaultRewardList', data, config)
}

// 提交经销商奖励配置
export const postDealerAwardConfig = (data, config = {}) => {
    return $http.post('/admin/dealer/defaultRewardEdit', data, config)
}

// 获取VIP晋级奖励配置
export const getDealerUpgradeAwardConfig = (data, config = {}) => {
    return $http.get('/admin/dealer/vipCfgList', data, config)
}

// 提交VIP晋级奖励配置
export const postDealerUpgradeAwardConfig = (data, config = {}) => {
    return $http.post('/admin/dealer/vipCfgEdit', data, config)
}

// 经销商审核列表【分页】
export const getDealerAuditList = (data, config = {}) => {
    return $http.get('/admin/dealer/list', data, config)
}

// 获取经销商详情
export const getDealerApplyData = (data, config = {}) => {
    return $http.get('/admin/dealer/applyDetail', data, config)
}

// 审核经销商申请
export const postAuditDealerApply = (data, config = {}) => {
    return $http.post('/admin/dealer/verify', data, config)
}

// 添加经销商
export const addDealerData = (data, config = {}) => {
    return $http.post('/admin/dealer/apply', data, config)
}

// 获取经销商账变记录
export const getDealerBilChangelList = (data, config = {}) => {
    return $http.get('/admin/user-coin-log/dealerChanges', data, config)
}

// 获取经销商发放记录列表【分页】
export const getDealerRewardLogList = (data, config = {}) => {
    return $http.get('/admin/dealer/rewardLogList', data, config)
}

// 经销商模式列表
export const getDealerModelList = (data, config = {}) => {
    return $http.get('/admin/dealer-model/list', data, config)
}

// 经销商模式编辑
export const postDealerModelData = (data, config = {}) => {
    return $http.post('/admin/dealer-model/edit', data, config)
}

// 经销商模式站点编辑
export const postDealerModelSiteData = (data, config = {}) => {
    return $http.post('/admin/dealer-model/siteEdit', data, config)
}

// 经销商模式详细信息
export const getDealerModelData = (data, config = {}) => {
    return $http.get('/admin/dealer-model/info', data, config)
}

// 经销商模式-获取智能配置
export const getDealerModelSmartList = (data, config = {}) => {
    return $http.get('/admin/dealer-model/smartList', data, config)
}

// 经销商模式-获取VIP等级数
export const getMerchantMaximumVip = (data, config = {}) => {
    return $http.get('/admin/dealer-model/vipNum', data, config)
}
