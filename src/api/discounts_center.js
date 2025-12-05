/*
 * @Author: yilaisai
 * @Date: 2024-01-04 18:24:04
 * @LastEditors: yilaisai
 * @LastEditTime: 2024-01-08 11:52:52
 */
import $http from '../common/util/http'

// 优惠中心-活动列表
export const promotionListApi = (data, config = {}) => {
    return $http.get('/admin/promotion/list', data, config)
}

// 创建活动
export const promotionAddApi = (data, config = {}) => {
    return $http.post('/admin/promotion/add', data, config)
}

// 删除活动
export const promotionDeleteApi = (data, config = {}) => {
    return $http.post('/admin/promotion/delete', data, config)
}

// 活动状态编辑
export const promotionEditStatusApi = (data, config = {}) => {
    return $http.post('/admin/promotion/editStatus', data, config)
}

// 修改活动
export const promotionEditApi = (data, config = {}) => {
    return $http.post('/admin/promotion/edit', data, config)
}

// 查询兑换码列表
export const getRedeemCodeList = (data, config = {}) => {
    return $http.get('/admin/promotion/redeemCodes', data, config)
}

// 生成兑换码
export const postRedeemCodeConfig = (data, config = {}) => {
    return $http.post('/admin/promotion/generate', data, config)
}

// 自定义活动|申请审核/派奖列表【分页】
export const getActivityApplyList = (data, config = {}) => {
    return $http.get('/admin/promotion-audit-log/list', data, config)
}

// 自定义活动|审核
export const postActivityAudit = (data, config = {}) => {
    return $http.post('/admin/promotion-audit-log/audit', data, config)
}

// 自定义活动|派发奖励
export const postActivityAward = (data, config = {}) => {
    return $http.post('/admin/promotion-audit-log/send', data, config)
}

// 优惠统计
export const getDiscountsStatisticsList = (data, config = {}) => {
    return $http.get('/admin/promotion/stat', data, config)
}

// 获取返水活动列表
export const getRebateActivityList = (data, config = {}) => {
    return $http.get('/admin/rebate-config/list', data, config)
}

// 查看实时返水活动配置
export const getRebateActivityData = (data, config = {}) => {
    return $http.get('/admin/rebate-config/view', data, config)
}

// 同步返水配置
export const postSyncRebateConfig = (data, config = {}) => {
    return $http.post('/admin/rebate-config/syncConfig', data, config)
}
// 提交实时返水活动配置
export const postRebateActivityData = (data, config = {}) => {
    return $http.post('/admin/rebate-config/addOrEdit', data, config)
}

// 查询实时返水活动基础配置
export const getRebateActivityBaseConfig = (data, config = {}) => {
    return $http.get('/admin/rebate-config/baseView', data, config)
}

// 提交实时返水活动基础配置
export const postRebateActivityBaseConfig = (data, config = {}) => {
    return $http.post('/admin/rebate-config/baseEdit', data, config)
}

// 存钱宝-收益配置规则-查看
export const getIncomeAccountRule = (data, config = {}) => {
    return $http.get('/admin/income/rule', data, config)
}

// 存钱宝-修改收益配置规则
export const postIncomeAccountRule = (data, config = {}) => {
    return $http.post('/admin/income/editRule', data, config)
}

// 存钱宝-开关配置
export const postIncomeAccountStatus = (data, config = {}) => {
    return $http.post('/admin/income/toggle', data, config)
}

// 存钱宝-收益明细记录列表【分页】
export const getIncomeAccountLogs = (data, config = {}) => {
    return $http.get('/admin/income/logs', data, config)
}

// 获取优惠明细列表
export const getMemberRewardDetail = (data, config = {}) => {
    return $http.get('/admin/user-coin-log/rewardDetail', data, config)
}

// 查询任务的基础或规则/阶梯配置
export const getTaskConfig = (data, config = {}) => {
    return $http.get('/admin/user-task-config/view', data, config)
}

// 修改任务的基础配置
export const postTaskBasicsConfig = (data, config = {}) => {
    return $http.post('/admin/user-task-config/addOrEditBase', data, config)
}

// 修改任务的规则/阶梯配置
export const postTaskRuleConfig = (data, config = {}) => {
    return $http.post('/admin/user-task-config/edit', data, config)
}

// 获取活动模板
export const getTemplateList = (data, config = {}) => {
    return $http.get('/admin/promotion/templateList', data, config)
}

// 同步指定活动
export const postSyncSpecPromotion = (data, config = {}) => {
    return $http.post('/admin/promotion/syncSpecPromotion', data, config)
}

// 获取活动类型【商户使用】
export const getTypeList = (data, config = {}) => {
    return $http.get('/admin/promotion/typeList', data, config)
}

// 全部活动标签
export const getActivityTagList = (data, config = {}) => {
    return $http.get('/admin/promotion-tag/list', data, config)
}

// 编辑活动标签
export const postActivityTagData = (data, config = {}) => {
    return $http.post('/admin/promotion-tag/addOrEdit', data, config)
}

// 删除活动标签
export const deleteActivityTagData = (data, config = {}) => {
    return $http.post('/admin/promotion-tag/delete', data, config)
}

// 风险配置列表
export const getRiskConfigList = (data, config = {}) => {
    return $http.get('/admin/promotion/riskConfigList', data, config)
}

// 修改风险配置
export const postEditRiskConfig = (data, config = {}) => {
    return $http.post('/admin/promotion/editRiskConfig', data, config)
}

// 获取风险配置
export const getRiskConfigSingle = (data, config = {}) => {
    return $http.get('/admin/promotion/getRiskConfig', data, config)
}

// 发放失败记录
export const getRewardGrantFailLog = (data, config = {}) => {
    return $http.get('/admin/promotion/rewardGrantFailLog', data, config)
}

// 新拼多多抽奖人数列表
export const getNewChopCount = (data, config = {}) => {
    return $http.get('/admin/promotion-review-log/newChopCount', data, config)
}