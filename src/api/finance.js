import $http from '../common/util/http'

// 获取用户充值订单列表
export const getRechargeLogList = (data, config = {}) => {
    return $http.get('/admin/recharge-log/list', data, config)
}

// 获取用户充值订单详情
export const getRechargeLogData = (data, config = {}) => {
    return $http.get('/admin/recharge-log/view', data, config)
}

// 补单/强制入款
export const postOperateOrder = (data, config = {}) => {
    return $http.post('/admin/recharge-log/sync', data, config)
}

// 创建订单前置接口-用户搜索
export const getUserOrderData = (data, config = {}) => {
    return $http.get('/admin/user-recharge/search', data, config)
}

// 创建订单
export const postCreateOrder = (data, config = {}) => {
    return $http.post('/admin/user-recharge/create', data, config)
}

// 获取商户支付配置列表
export const getMerchantPayConfigList = (data, config = {}) => {
    return $http.get('/admin/merchant-pay-config/list', data, config)
}

// 获取商户支付配置详情
export const getMerchantPayConfigInfo = (data, config = {}) => {
    return $http.get('/admin/merchant-pay-config/detail', data, config)
}

// 提交商户支付配置
export const addMerchantPayConfig = (data, config = {}) => {
    return $http.post('/admin/merchant-pay-config/add', data, config, false)
}

// 修改商户支付配置
export const editMerchantPayConfig = (data, config = {}) => {
    return $http.post('/admin/merchant-pay-config/edit', data, config, false)
}

// 获取商户支付配置表单字段
export const getFormConfig = (data, config = {}) => {
    return $http.get(
        '/admin/merchant-pay-config/payChannelDescriptors',
        data,
        config,
    )
}

// 获取商户可配置支付通道列表
export const getPayChannelList = (data, config = {}) => {
    return $http.get('/admin/merchant-pay-config/payChannel', data, config)
}

// 获取支付渠道排序配置
export const getPayChannelSortConfig = (data, config = {}) => {
    return $http.get('/admin/user-recharge-config/payChannelSort', data, config)
}

// 修改支付渠道排序配置
export const postPayChannelSortConfig = (data, config = {}) => {
    return $http.post('/admin/user-recharge-config/sortEdit', data, config)
}

// 删除三方支付配置
export const deletePayChannelConfig = (data, config = {}) => {
    return $http.post('/admin/merchant-pay-config/delete', data, config)
}

// 获取付款统计列表
export const getPaymentStatisticsList = (data, config = {}) => {
    return $http.get('/admin/cash-log/stat', data, config)
}

// 获取支付推荐金额列表
export const getRecommendedAmountList = (data, config = {}) => {
    return $http.get('/admin/user-recharge-config/list', data, config)
}

// 获取支付推荐金额配置
export const getRecommendedAmountConfig = (data, config = {}) => {
    return $http.get('/admin/user-recharge-config/detail', data, config)
}

// 提交支付推荐金额配置
export const postRecommendedAmountConfig = (data, config = {}) => {
    return $http.post('/admin/user-recharge-config/addOrEdit', data, config)
}

// 获取汇率配置
export const getExchangeRateConfig = (data, config = {}) => {
    return $http.get('/admin/exchange-rate-config/list', data, config)
}

// 获取充值统计列表
export const getRechargeStatisticsList = (data, config = {}) => {
    return $http.get('/admin/recharge-log/dailyStat', data, config)
}

// 充值统计详情
export const getDailyStatDetail = (data, config = {}) => {
    return $http.get('/admin/recharge-log/dailyStatDetail', data, config)
}

// 获取三方统计列表 - 充值
export const getChannelRechargeLogList = (data, config = {}) => {
    return $http.get('/admin/recharge-log/dailyChannelStat', data, config)
}

// 获取三方统计列表 - 提现
export const getChannelWithdrawLogList = (data, config = {}) => {
    return $http.get('/admin/cash-log/dailyChannelStat', data, config)
}

// 获取提现渠道配置列表
export const getMerchantCashConfigList = (data, config = {}) => {
    return $http.get('/admin/user-cash-config/list', data, config)
}

// 获取免审自动出款渠道
export const getWithdrawChannelList = (data, config = {}) => {
    return $http.get('/admin/cash-log/channelItems', data, config)
}

// 获取提现渠道配置
export const getMerchantCashConfigChannel = (data, config = {}) => {
    return $http.get('/admin/user-cash-config/detail', data, config)
}

// 编辑提现渠道配置
export const postMerchantCashConfigChannel = (data, config = {}) => {
    return $http.post('/admin/user-cash-config/editParam', data, config)
}

// 获取免审提现金额
export const getAuditExemptionConfigData = (data, config = {}) => {
    return $http.get('/admin/user-cash-config/exemptView', data, config)
}

// 编辑免审提现金额
export const postAuditExemptionConfigData = (data, config = {}) => {
    return $http.post('/admin/user-cash-config/editExemptAmount', data, config)
}

// 编辑提现参数
export const postMerchantCashConfigData = (data, config = {}) => {
    return $http.post('/admin/user-cash-config/edit', data, config)
}

// 获取提现限制配置
export const getWithdrawalLimitConfig = (data, config = {}) => {
    return $http.get('/admin/vip-privilege-config/cashConfigList', data, config)
}

// 获取支付钱包排序
export const getPayWalletSort = (data, config = {}) => {
    return $http.get('/admin/user-recharge-config/payWalletSort', data, config)
}

// 编辑提现限制配置
export const postWithdrawalLimitConfig = (data, config = {}) => {
    return $http.post('/admin/vip-privilege-config/cashEdit', data, config)
}

// 查询提现类型数量限制配置
export const getWithdrawalTypeConfig = (data, config = {}) => {
    return $http.get('/admin/user-cash-config/cashLimitView', data, config)
}

// 提现类型数量限制
export const postWithdrawalTypeConfig = (data, config = {}) => {
    return $http.post('/admin/user-cash-config/editCashLimit', data, config)
}

// 获取财务出款记录
export const getCashLogList = (data, config = {}) => {
    return $http.get('/admin/cash-log/list', data, config)
}

// 初审/拒绝出款
export const postFirstVerify = (data, config = {}) => {
    return $http.post('/admin/cash-log/verify', data, config)
}

// 复审/拒绝出款
export const postAgainVerify = (data, config = {}) => {
    return $http.post('/admin/cash-log/review', data, config)
}

// 复审/拒绝出款
export const getChannelInfo = (data, config = {}) => {
    return $http.get('/admin/cash-log/channels', data, config)
}

// 查询第三方订单状态
export const getThirdpartyOrderStatus = (data, config = {}) => {
    return $http.get('/admin/cash-log/query', data, config)
}

// 重新出款
export const postForceApply = (data, config = {}) => {
    return $http.post('/admin/cash-log/forceApply', data, config)
}

// 第三方订单强制关闭
export const postCloseOrder = (data, config = {}) => {
    return $http.post('/admin/cash-log/closed', data, config)
}

// 获取稽核配置
export const getAuditMultiplierList = (data, config = {}) => {
    return $http.get('/admin/audit-config/list', data, config)
}

// 编辑稽核配置(type：1=充值-稽核倍数；2=VIP奖励-稽核倍数；3=自动解除额度设置)
export const editAuditMultiplier = (data, config = {}) => {
    return $http.post('/admin/audit-config/edit', data, config)
}

// 稽核管理（用户稽核任务列表）【分页】
export const getMemberAuditTaskList = (data, config = {}) => {
    return $http.get('/admin/user-coin-log/auditList', data, config)
}

// 手工解除稽核任务额度
export const postRelieveAuditTask = (data, config = {}) => {
    return $http.post('/admin/user-coin-log/unblockAudit', data, config)
}

// 新增用户稽核任务
export const postMemberAuditTask = (data, config = {}) => {
    return $http.post('/admin/user-coin-log/addAudit', data, config)
}

// 获取稽核自动解除额度配置
export const getAutoRelieveConfig = (data, config = {}) => {
    return $http.get('/admin/audit-config/autoUnblockAmount', data, config)
}

// 获取风控审核列表
export const getRiskControlAuditList = (data, config = {}) => {
    return $http.get('/admin/cash-log/riskVerifyCashList', data, config)
}

// 风控审核-初审
export const postRiskControlFirstVerify = (data, config = {}) => {
    return $http.post('/admin/cash-log/firstVerify', data, config)
}

// 会员余额修正-列表【分页】
export const getBalanceRevisionList = (data, config = {}) => {
    return $http.get('/admin/account/adjustList', data, config)
}

// 新增会员余额修正
export const postBalanceRevisionData = (data, config = {}) => {
    return $http.post('/admin/account/adjust', data, config)
}
// 批量会员余额修正
export const postBatchRevisionData = (data, config = {}) => {
    return $http.post('/admin/account/batchAdjust', data, config)
}

// 充值通道列表
export const getChannelStat = (data, config = {}) => {
    return $http.get('/admin/merchant-pay-config/channelStat', data, config)
}

// 转账出款列表【分页】
export const getOfflineList = (data, config = {}) => {
    return $http.get('/admin/cash-log/offlineList', data, config)
}

// 锁定/解锁订单
export const postCashLogLockData = (data, config = {}) => {
    return $http.post('/admin/cash-log/lock', data, config)
}

// 复审线下出款订单
export const postReviewOfflineData = (data, config = {}) => {
    return $http.post('/admin/cash-log/reviewOffline', data, config)
}

// 获取商户支付方式配置列表（线下）
export const getPayScopeList = (data, config = {}) => {
    return $http.get('/admin/merchant-pay-config/list', data, config)
}

// 获取转账充值配置
export const getBankOfflineWallet = (data, config = {}) => {
    return $http.get(
        '/admin/merchant-pay-config/bankOfflineWallet',
        data,
        config,
    )
}

// 转账审核列表
export const getReviewListData = (data, config = {}) => {
    return $http.get('/admin/recharge-log/reviewList', data, config)
}

// 转账审核列表
export const postTransferReviewData = (data, config = {}) => {
    return $http.post('/admin/recharge-log/transferReview', data, config)
}

// 批量上传记录
export const getBalanceRevisionLog = (data, config = {}) => {
    return $http.get('/admin/account/importLog', data, config)
}

// 批量上传明细记录
export const getBalanceRevisionInfo = (data, config = {}) => {
    return $http.get('/admin/account/importLogs', data, config)
}
