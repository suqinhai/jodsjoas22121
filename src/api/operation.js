import $http from '../common/util/http'

// 获取 用户协议/关于我们 列表
export const getGgreementList = (data, config = {}) => {
    return $http.get('/admin/site-content/get', data, config)
}

// 修改/新增 用户协议/关于我们 数据
export const postGgreementData = (data, config = {}) => {
    return $http.post('/admin/site-content/addOrEdit', data, config)
}

// 获取有奖反馈列表
export const getFeedBackList = (data, config = {}) => {
    return $http.get('/admin/feedback/list', data, config)
}

// 回复有奖反馈
export const replayFeedBack = (data, config = {}) => {
    return $http.post('/admin/feedback/edit', data, config)
}

// 新增商户建议
export const addFeedBack = (data, config = {}) => {
    return $http.post('/admin/feedback/add', data, config)
}

export const getMultipleLogin = (data, config = {}) => {
    return $http.get('/admin/radio/hallCfg', data, config)
}

// 获取音乐列表
export const getMusicList = (data, config = {}) => {
    return $http.get('/admin/radio/list', data, config)
}

// 启用/停用/ 删除 音乐
export const postMusicStatus = (data, config = {}) => {
    return $http.post('/admin/radio/toggle', data, config)
}

// 编辑音乐整体配置
export const postMusicConfig = (data, config = {}) => {
    return $http.post('/admin/meta/hallEdit', data, config)
}

// 编辑音乐数据
export const postMusicData = (data, config = {}) => {
    return $http.post('/admin/radio/edit', data, config)
}

// 排行榜活动统计
export const postRankList = (data, config = {}) => {
    return $http.get('/admin/promotion/rankList', data, config)
}

// 任务审核列表
export const postReviewList = (data, config = {}) => {
    return $http.get('/admin/user-task-config/reviewList', data, config)
}

// 任务审核
export const postReview = (data, config = {}) => {
    return $http.post('/admin/user-task-config/review', data, config)
}

// 新拼多多审核列表
export const getActiveReviewList = (data, config = {}) => {
    return $http.get('/admin/promotion-review-log/reviewList', data, config)
}

// 新拼多多任务审核
export const postActiveReview = (data, config = {}) => {
    return $http.post('/admin/promotion-review-log/review', data, config)
}

// 票券列表
export const getTicketList = (data, config = {}) => {
    return $http.get('/admin/ticket/list', data, config)
}

// 创建或修改票券
export const postTicketAddOrEdit = (data, config = {}) => {
    return $http.post('/admin/ticket/addOrEdit', data, config)
}

// 修改状态
export const postTicketToggle = (data, config = {}) => {
    return $http.post('/admin/ticket/toggle', data, config)
}

// 票券使用列表（菜单）
export const getUseList = (data, config = {}) => {
    return $http.get('/admin/ticket/useList', data, config)
}

// 票券使用记录列表（票券中心的二级页面）
export const getUseDetail = (data, config = {}) => {
    return $http.get('/admin/ticket/useDetail', data, config)
}

// 票券发放记录（票券列表的二级页面）
export const getGrantDetail = (data, config = {}) => {
    return $http.get('/admin/ticket/grantDetail', data, config)
}

// 录入审核列表【分页】
export const getReviewList = (data, config = {}) => {
    return $http.get('/admin/merchant-other-fee-log/reviewList', data, config)
}

// 录入列表【分页】
export const getEnteringList = (data, config = {}) => {
    return $http.get('/admin/merchant-other-fee-log/list', data, config)
}

// 录入或修改广告费用
export const postAddOrEdit = (data, config = {}) => {
    return $http.post('/admin/merchant-other-fee-log/addOrEdit', data, config)
}

// 广告费用审核
export const postFeeReview = (data, config = {}) => {
    return $http.post('/admin/merchant-other-fee-log/review', data, config)
}

// 录入或修改广告费用
export const postEnterFee = (data, config = {}) => {
    return $http.post('/admin/merchant-other-fee-log/enterFee', data, config)
}

// 财务数据汇总
export const getFeeStat = (data, config = {}) => {
    return $http.get('/admin/merchant-other-fee-log/feeStat', data, config)
}

// 网红排行榜奖励【分页】
export const getBloggerRankList = (data, config = {}) => {
    return $http.get('/admin/blogger/rankList', data, config)
}

// 赠送奖励【单次或批量】
export const postBloggerGiveReward = (data, config = {}) => {
    return $http.post('/admin/blogger/giveReward', data, config)
}

// 筛选赠送奖励
export const bloggerFilterGiveReward = (data, config = {}) => {
    return $http.post('/admin/blogger/filterGiveReward', data, config)
}

// 网红排行榜记录【分页】
export const getBloggerRankRecord = (data, config = {}) => {
    return $http.get('/admin/blogger/rewardLog', data, config)
}

// 每日自动赠送记录【分页】
export const getBloggerRewardConfig = (data, config = {}) => {
    return $http.get('/admin/blogger/rewardConfig', data, config)
}

// 会员投诉列表【分页】
export const getComplaintList = (data, config = {}) => {
    return $http.get('/admin/feedback/list2', data, config)
}

// 未处理投诉提醒弹窗
export const getComplaintRemindData = (data, config = {}) => {
    return $http.get('/admin/feedback/popup', data, config)
}
