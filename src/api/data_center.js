import $http from '../common/util/http'

// 获取消息通知列表
export const getMessageList = (data, config = {}) => {
    return $http.get('/admin/msg/list', data, config)
}

// 删除消息
export const deleteMessage = (data, config = {}) => {
    return $http.post('/admin/msg/delete', data, config)
}

// 修改消息状态
export const recallMessage = (data, config = {}) => {
    return $http.post('/admin/msg/editStatus', data, config)
}

// 新增修改消息
export const addOrEditMessage = (data, config = {}) => {
    return $http.post('/admin/msg/addOrEdit', data, config)
}

// 批量新增/修改宣传配置
export const postBatchMessage = (data, config = {}) => {
    return $http.post('/admin/msg/batchAdd', data, config)
}

// 宣传配置列表
export const getPublicityList = (data, config = {}) => {
    return $http.get('/admin/site-banner/list', data, config)
}

// 宣传配置详情
export const getPublicityConfig = (data, config = {}) => {
    return $http.get('/admin/site-banner/detail', data, config)
}

// 新增/修改宣传配置
export const editPublicityConfig = (data, config = {}) => {
    return $http.post('/admin/site-banner/addOrEdit', data, config)
}

// 删除宣传配置
export const deletePublicityConfig = (data, config = {}) => {
    return $http.post('/admin/site-banner/delete', data, config)
}

// 获取宣传管理播放时间列表
export const getCarouseTimeList = (data, config = {}) => {
    return $http.get('/admin/site-banner/playTimes', data, config)
}

// 修改宣传管理播放时间
export const postCarouseTime = (data, config = {}) => {
    return $http.post('/admin/site-banner/editPlayTime', data, config)
}

// 获取渠道列表
export const getChannelList = (data, config = {}) => {
    return $http.get('/admin/channel/list', data, config)
}

// 新增/修改渠道配置
export const postChannelData = (data, config = {}) => {
    return $http.post('/admin/channel/edit', data, config)
}

// 获取渠道列表下拉
export const getChannelListData = (data, config = {}) => {
    return $http.get('/admin/promotion/channelList', data, config)
}

// 删除渠道配置
export const deleteChannelData = (data, config = {}) => {
    return $http.post('/admin/channel/delete', data, config)
}

// 获取渠道统计数据
export const getChannelStatisticsData = (data, config = {}) => {
    return $http.get('/admin/channel/registerStatList', data, config)
}

// 获取推广域名列表【分页】
export const getMarketingDomainList = (data, config = {}) => {
    return $http.get('/admin/marketing-domain/list', data, config)
}

// 新增或修改推广域名
export const postMarketingDomainData = (data, config = {}) => {
    return $http.post('/admin/marketing-domain/edit', data, config)
}

// 启用/停用 推广域名
export const postMarketingDomainStatus = (data, config = {}) => {
    return $http.post('/admin/marketing-domain/toggle', data, config)
}

// 删除渠道配置
export const deleteMarketingDomainData = (data, config = {}) => {
    return $http.post('/admin/marketing-domain/delete', data, config)
}

// 获取广告消耗录入
export const getPurchaseVolumeRrecord = (data, config = {}) => {
    return $http.get('/admin/channel/costList', data, config)
}

// 广告费用审核
export const postFeeReview = (data, config = {}) => {
    return $http.post('/admin/channel/review', data, config)
}

// 新增买量数据
export const postPurchaseVolumeData = (data, config = {}) => {
    return $http.post('/admin/channel/editCostDaily', data, config)
}

// 广告消耗数据列表【分页】
export const getDataList = (data, config = {}) => {
    return $http.get('/admin/channel/dataList', data, config)
}

// 新增adjust配置
export const postAdjustConfig = (data, config = {}) => {
    return $http.post('/admin/channel/apiEdit', data, config)
}
// adjust 列表
export const getAdjustList = (data, config = {}) => {
     return $http.get('/admin/channel/apiList', data, config)
}
// adjust 详情
export const getAdjustDetail = (data, config = {}) => {
    return $http.get('/admin/channel/apiQuery', data, config)
}
// adjust 删除
export const deleteAdjustConfig = (data, config = {}) => {
    return $http.post('/admin/channel/apiDelete', data, config)
}
