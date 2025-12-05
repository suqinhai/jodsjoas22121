import $http from '../common/util/http'

// 投注记录查询
export const gamePlayLogListApi = (data, config = {}) => {
    return $http.get('/admin/game-play-log/list', data, config)
}

// 账变记录
export const coinChangeLogApi = (data, config = {}) => {
    return $http.get('/admin/user-coin-log/changes', data, config)
}

// 投注统计
export const gamePlayLogStatApi = (data, config = {}) => {
    return $http.get('/admin/game-play-log/stat', data, config)
}

// 投注记录详情
export const gamePlayLogDetailApi = (data, config = {}) => {
    return $http.get('/admin/game-play-log/detail', data, config)
}

// 大R玩家统计【分页】
export const getPlayerStatisticsList = (data, config = {}) => {
    return $http.get('/admin/report/userRechargeLevelList', data, config)
}

// 大R玩家统计详情【分页】
export const getPlayerReportInfo = (data, config = {}) => {
    return $http.get('/admin/report/userRechargeLevelDetails', data, config)
}

// 获取代理结算记录列表
export const getAgentSettlementRecord = (data, config = {}) => {
    return $http.get('/admin/agent/settleDailyList', data, config)
}

// 获取代理结算明细列表
export const getAgentSettlementDetail = (data, config = {}) => {
    return $http.get('/admin/agent/settleList', data, config)
}

// 获取游戏统计列表
export const getGameStatisticsList = (data, config = {}) => {
    return $http.get('/admin/report/game', data, config)
}

// 获取会员统计列表
export const getMemberStatisticsList = (data, config = {}) => {
    return $http.get('/admin/report/userDetailList', data, config)
}

// 获取运营统计列表
export const getOperateStatisticsList = (data, config = {}) => {
    return $http.get('/admin/report/userDetailDailyList', data, config)
}

// 用户充值留存统计【分页】
export const getRetentionStatisticsList = (data, config = {}) => {
    return $http.get('/admin/report/rechargeRetentionList', data, config)
}

// 添加/编辑 渠道日成本
export const postRoiChannelCostDaily = (data, config = {}) => {
    return $http.post('/admin/channel/editCostDaily', data, config)
}

// 获取经销商结算记录列表
export const getDealerSettlementRecord = (data, config = {}) => {
    return $http.get('/admin/dealer/settleDailyList', data, config)
}

// 获取经销商结算明细列表
export const getDealerSettlementDetail = (data, config = {}) => {
    return $http.get('/admin/dealer/settleList', data, config)
}

// VIP充提差历史统计表
export const getRechargeCashStatHistory = (data, config = {}) => {
    return $http.get('/admin/vip-recharge-cash-stat/historyList', data, config)
}

// 当前VIP充提差额统计列表
export const getRechargeCashStatCurrent = (data, config = {}) => {
    return $http.get('/admin/vip-recharge-cash-stat/currentList', data, config)
}

// 总统计列表
export const getRechargeCashStatAll = (data, config = {}) => {
    return $http.get('/admin/vip-recharge-cash-stat/totalList', data, config)
}

// VIP充值提现人数
export const getRechargeCashStatData = (data, config = {}) => {
    return $http.get('/admin/vip-recharge-cash-stat/detailList', data, config)
}

// 导出列表
export const getExportList = (data, config = {}) => {
    return $http.get('/admin/export/list', data, config)
}

// 导出下载
export const getDownload = (data, config = {}) => {
    return $http.get('/admin/export/download', data, config)
}

// 综合报表
export const getComprehensive = (data, config = {}) => {
    return $http.get('/admin/report/comprehensive', data, config)
}

// 获取代理数据汇总
export const getAgentDataSummary = (data, config = {}) => {
    return $http.get('/admin/agent/agentDayStat', data, config)
}

// 获取投放数据汇总
export const getLaunchDataSummary = (data, config = {}) => {
    return $http.get('/admin/channel/roiDailyStatList', data, config)
}

// 获取游戏人生列表
export const getPlayerCount = (data, config = {}) => {
    return $http.get('/admin/report/playerCount', data, config)
}

// 优惠报表
export const getPromotionReport = (data, config = {}) => {
    return $http.get('/admin/report/promotionReport', data, config)
}

// 优惠报表详情
export const getPromotionReportDetail = (data, config = {}) => {
    return $http.get('/admin/report/promotionReportDetail', data, config)
}

// 网红日统计报表【分页】
export const getInfluencerReport = (data, config = {}) => {
    return $http.get('/admin/blogger/dayList', data, config)
}

// 网红二、三级报表【分页】
export const getInfluencerReportDetail = (data, config = {}) => {
    return $http.get('/admin/blogger/dayAgentList', data, config)
}

// 网红四级报表【分页】
export const getSubordinateData = (data, config = {}) => {
    return $http.get('/admin/blogger/bloggerList', data, config)
}

// 游戏平台投注人数报表
export const getPlayerNumData = (data, config = {}) => {
    return $http.get('/admin/report/playerNum', data, config)
}

// 获取投注金额数据
export const getBetAmountList = (data, config = {}) => {
    return $http.get(`/admin/report/gameDailyStat`, data, config)
}

// 用户充值分析
export const getUserRechargeAnalyze = (data, config = {}) => {
    return $http.get('/admin/report/userRechargeAnalyze', data, config)
}

// 平台费用报表
export const getMerchantFeeStat = (data, config = {}) => {
    return $http.get('/admin/merchant-fee-stat/report', data, config)
}

// 经销商数据列表
export const getDealerDataList = (data, config = {}) => {
    return $http.get('/admin/report/dealerData', data, config)
}

// 支付报表【分页】
export const getChannelStatList = (data, config = {}) => {
    return $http.get('/admin/recharge-log/channelStat', data, config)
}

// 支付报表详情
export const getChannelCodeStat = (data, config = {}) => {
    return $http.get('/admin/recharge-log/channelCodeStat', data, config)
}
