
import $http from '../common/util/http'

// 商户充值产品档位列表
export const getMerchantRechargeList = (data, config = {}) => {
    return $http.get('/admin/merchant-recharge/products', data, config)
}

// 商户充值-创建订单
export const recharge = (data, config = {}) => {
    return $http.post('/admin/merchant-recharge/create', data, config)
}

// 获取商户游戏厂商列表
export const getVendorList = (data, config = {}) => {
    return $http.get('/admin/merchant-vendor/list', data, config)
}

// 修改商户游戏厂商
export const editVendor = (data, config = {}) => {
    return $http.post('/admin/merchant-vendor/edit', data, config)
}

// 批量修改商户游戏厂商
export const batchPostVendorData = (data, config = {}) => {
    return $http.post('/admin/merchant-game/vendorBatchEdit', data, config)
}

// 更新游戏
export const postUpdateGame = (data, config = {}) => {
    return $http.post('/admin/merchant-game/incrSyncGame', data, config)
}

// 批量修改游戏信息
export const batchEditGameData = (data, config = {}) => {
    return $http.post('/admin/merchant-game/batchEdit', data, config)
}

// 站点管理-商户额度
export const getMerchantSite = (data, config = {}) => {
    return $http.get('/admin/merchant/site', data, config)
}

// 获取商户游戏列表
export const merchantVendorListApi = (data, config = {}) => {
    return $http.get('/admin/merchant-game/list', data, config)
}
// 获取商户游戏列表-过滤
export const merchantValidListApi = (data, config = {}) => {
    return $http.get('/admin/merchant-game/validList', data, config)
}

// 修改商户游戏
export const merchantGameEditApi = (data, config = {}) => {
    return $http.post('/admin/merchant-game/edit', data, config)
}

// 商户充值订单列表【分页】
export const merchantRechargeList = (data, config = {}) => {
    return $http.get('/admin/merchant-recharge/list', data, config)
}

// 站点维护查询
export const getSiteStatus = (data, config = {}) => {
    return $http.get('/admin/merchant/getSiteStatus', data, config)
}

// 站点状态编辑
export const editSiteStatus = (data, config = {}) => {
    return $http.post('/admin/merchant/editSiteStatus', data, config)
}

// 商户信息
export const getMerchantInfo = (data, config = {}) => {
    return $http.get('/admin/merchant/info', data, config)
}

// 游戏分成
export const getGameDiv = (data, config = {}) => {
    return $http.get('/admin/merchant/gameShare', data, config)
}

// 获取商户消息数量
export const getMerchantMessageUnread = (data, config = {}) => {
    return $http.get('/admin/merchant-msg/unread', data, config)
}

// 获取商户消息列表
export const getMerchantMessageList = (data, config = {}) => {
    return $http.get('/admin/merchant-msg/list', data, config)
}

// 获取商户消息详情
export const getMerchantMessageInfo = (data, config = {}) => {
    return $http.get('/admin/merchant-msg/detail', data, config)
}

// 全部商户消息已读
export const allMerchantMessageRead = (data, config = {}) => {
    return $http.post('/admin/merchant-msg/readAll', data, config)
}

// 获取商户消息弹窗列表
export const getMerchantMessagePopup = (data, config = {}) => {
    return $http.get('/admin/merchant-msg/popup', data, config)
}

// 账变记录
export const getAccountLogList = (data, config = {}) => {
    return $http.get('/admin/merchant-account/accountLogList', data, config)
}

// 商户短信配置
export const getSmsConfig = (data, config = {}) => {
    return $http.get('/admin/merchant-sms-config/get', data, config)
}

// 编辑短信余额不足提醒
export const postEditSmsRemind = (data, config = {}) => {
    return $http.post('/admin/merchant-sms-config/editRemind', data, config)
}

// 短信编辑
export const postEditSms = (data, config = {}) => {
    return $http.post('/admin/merchant-sms-config/edit', data, config)
}

// 商户账单
export const getMerchantBillList = (data, config = {}) => {
    return $http.get('/admin/merchant-bill/list', data, config)
}

// 商户月度结算子账单列表
export const getMerchantChildrenBillList = (data, config = {}) => {
    return $http.get('/admin/merchant-bill/children', data, config)
}

// 商户账单确认
export const confirmBillList = (data, config = {}) => {
    return $http.post('/admin/merchant-bill/confirm', data, config)
}

// 获取非经营地访问限制列表
export const getRegionalRestrictions = (data, config = {}) => {
    return $http.get('/admin/region-limit/list', data, config)
}

// 新增/修改 非经营地访问限制
export const addOrEditRegionalRestrictions = (data, config = {}) => {
    return $http.post('/admin/region-limit/addOrEdit', data, config)
}

// 删除非经营地访问限制
export const deleteRegionalRestrictions = (data, config = {}) => {
    return $http.post('/admin/region-limit/delete', data, config)
}

// 获取客服配置
export const getCustomerList = (data, config = {}) => {
    return $http.get('/admin/customer-service-config/list', data, config)
}

// 获取站点预警数据
export const getEarlyWarningExplain = (data, config = {}) => {
    return $http.get('/admin/merchant-level-config/riskList', data, config)
}

// 获取商户申请游戏厂家列表
export const getMerchantApplyVendorList = (data, config = {}) => {
    return $http.get('/admin/merchant-vendor/applyList', data, config)
}

// 商户申请游戏厂家
export const postMerchantApplyVendor = (data, config = {}) => {
    return $http.post('/admin/merchant-vendor/apply', data, config)
}

// 获取商户热门游戏列表
export const getHotGameList = (data, config = {}) => {
    return $http.get('/admin/merchant-game/hotList', data, config)
}

// 修改商户热门游戏
export const postHotGameData = (data, config = {}) => {
    return $http.post('/admin/merchant-game/hotEdit', data, config)
}

// 获取子站点列表
export const getMerchantList = (data, config = {}) => {
    return $http.get('/admin/merchant/merchantList', data, config)
}

// 创建站点
export const postAddSite = (data, config = {}) => {
    return $http.post('/admin/merchant/addSite', data, config)
}

// 修改站点状态
export const postEditSiteStatus = (data, config = {}) => {
    return $http.post('/admin/merchant/editSiteStatus', data, config)
}

// 一键修改站点状态
export const postEditAllSiteStatus = (data, config = {}) => {
    return $http.post('/admin/merchant/oneKeyEditSiteStatus', data, config)
}

// 获取站点账单列表
export const getSiteBillList = (data, config = {}) => {
    return $http.get('/admin/merchant-bill/siteList', data, config)
}

// 获取站点账单详情
export const getSiteBillDetail = (data, config = {}) => {
    return $http.get('/admin/merchant-bill/siteDetail', data, config)
}

// 获取大R提醒弹窗消息列表
export const getBigRRemindMassageList = (data, config = {}) => {
    return $http.get('/admin/merchant-msg/bigRPopup', data, config)
}

// 获取风控提醒弹窗数据
export const getRiskControlRemindData = (data, config = {}) => {
    return $http.get('/admin/merchant/popRemind', data, config)
}

// 获取未出账单明细
export const getUnPendingBillsData = (data, config = {}) => {
    return $http.get('/admin/merchant/unPendingBills', data, config)
}

// 获取站点未出游戏分成
export const getUnPendingShareData = (data, config = {}) => {
    return $http.get('/admin/merchant/unPendingShare', data, config)
}

// 中奖排行榜管理
export const getWinningRankingList = (data, config = {}) => {
    return $http.get('/admin/user-winning-rank/list', data, config)
}

// 手动添加排行榜记录
export const getRankingManualList = (data, config = {}) => {
    return $http.get('/admin/user-winning-rank/manualList', data, config)
}

// 获取排行榜设置
export const getWinningRankingConfig = (data, config = {}) => {
    return $http.get('/admin/user-winning-rank/getConfig', data, config)
}

// 编辑排行榜配置
export const postWinningRankingConfig = (data, config = {}) => {
    return $http.post('/admin/user-winning-rank/editConfig', data, config)
}

// 手工添加排行榜
export const postWinningRankingData = (data, config = {}) => {
    return $http.post('/admin/user-winning-rank/add', data, config)
}

// 删除中奖排行榜
export const deleteWinningRankingData = (data, config = {}) => {
    return $http.post('/admin/user-winning-rank/delete', data, config)
}
