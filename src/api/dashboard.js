import $http from '../common/util/http'

// 获取人数统计数据
// export const getHomeOperateData = (data, config = {}) => {
//     // tab：0=用户注册，1=当前在线；2=游戏人数；3=运营表格；4=运营投注线形图
//     return $http.get('/admin/report/userGraph', data, config)
// }

// 数据总览
export const getMerchantDataOverview = (data, config = {}) => {
    return $http.get('/admin/report/homeInfo', data, config)
}

// // 获取充值提现图表数据
// export const getMerchantFinanceData = (data, config = {}) => {
//     return $http.get('/admin/report/rechargeCashGraph', data, config)
// }

// // 获取排行榜数据
// export const getRankingListData = (data, config = {}) => {
//     // tab：0=充值；1=投注；2=盈亏；3=佣金
//     return $http.get('/admin/report/rank', data, config)
// }

// 首页统计数据
export const getHomeStatData = (data = null, config = {}) => {
    // tab: '': 用户在线统计, 1: 投注人数统计, 2: 充值人数统计, 3: 充值留存统计, 4: 投注金额统计
    return $http.get('/admin/report/userDayStat', data, config)
}

// 充值投放图表
export const getRechargeLaunchChart = (data, config = {}) => {
    return $http.get('/admin/report/rechargeChart', data, config)
}

// 新增数据详情
export const getAddDataStatList = (data, config = {}) => {
    return $http.get('/admin/report/addDataStat', data, config)
}

// 平台费用详情
export const getPlatformCostList = (data, config = {}) => {
    return $http.get('/admin/merchant-fee-stat/list', data, config)
}

// 站点费用
export const getPlatformSiteFeeList = (data, config = {}) => {
    return $http.get('/admin/merchant-fee-stat/siteFee', data, config)
}

// 返佣列表
export const getPlatformRebateList = (data, config = {}) => {
    return $http.get('/admin/merchant-fee-stat/rebateList', data, config)
}
