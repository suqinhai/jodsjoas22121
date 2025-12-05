import $http from '../common/util/http'

// 代理列表
export const getAagentList = (data, config = {}) => {
    return $http.get('/admin/agent/list', data, config)
}

// 编辑代理开关状态
export const postAagentData = (data, config = {}) => {
    return $http.post('/admin/agent/editInfo', data, config)
}

// 代理等级列表
export const getAagentLevelList = (data, config = {}) => {
    return $http.get('/admin/agent/levelList', data, config)
}

// 修改代理等级配置
export const postAagentLevelData = (data, config = {}) => {
    return $http.post('/admin/agent/levelEdit', data, config)
}

// 返佣配置列表
export const getRebateSettingList = (data, config = {}) => {
    return $http.get('/admin/agent/awardCfgList', data, config)
}

// 添加/编辑 返佣配置
export const postRebateSettingData = (data, config = {}) => {
    return $http.post('/admin/agent/awardCfgEdit', data, config)
}

// 启用/停用 返佣配置
export const postRebateSettingStatus = (data, config = {}) => {
    return $http.post('/admin/agent/awardCfgToggle', data, config)
}

// 删除返佣配置
export const deleteRebateSettingData = (data, config = {}) => {
    return $http.post('/admin/agent/awardCfgDel', data, config)
}

// 佣金领取记录【分页】
export const getCommissionLogList = (data, config = {}) => {
    return $http.get('/admin/agent/commissionLogList', data, config)
}

// 代理数据列表【分页】
export const getAagentDataList = (data, config = {}) => {
    return $http.get('/admin/agent/dataList', data, config)
}

// 代理上级更改溯源【分页】
export const getChangeList = (data, config = {}) => {
    return $http.get('/admin/agent-op/changeList', data, config)
}

// 代理上级关系修改
export const postChangeEdit = (data, config = {}) => {
    return $http.post('/admin/agent-op/changeEdit', data, config)
}

// 三级代理配置
export const getDefaultConfig = (data, config = {}) => {
    return $http.get('/admin/third-level-agent/getDefaultConfig', data, config)
}

// 编辑三级代理配置
export const postEditDefaultConfig = (data, config = {}) => {
    return $http.post(
        '/admin/third-level-agent/editDefaultConfig',
        data,
        config,
    )
}

// 获取代理账号
export const getAgentName = (data, config = {}) => {
    return $http.get('/admin/third-level-agent/getAgentName', data, config)
}

// 编辑代理商配置
export const postEditAgentConfig = (data, config = {}) => {
    return $http.post('/admin/third-level-agent/editAgentConfig', data, config)
}

// 删除代理掉绑配置
export const postDeleteMissBindConfig = (data, config = {}) => {
    return $http.post(
        '/admin/third-level-agent/deleteMissBindConfig',
        data,
        config,
    )
}

// 三级代理掉绑配置列表
export const getMissBindConfigList = (data, config = {}) => {
    return $http.get(
        '/admin/third-level-agent/missBindConfigList',
        data,
        config,
    )
}

// 三级掉绑查询
export const getMissBindList = (data, config = {}) => {
    return $http.get('/admin/third-level-agent/missBindList', data, config)
}

// 掉绑明细
export const getMissBindUserList = (data, config = {}) => {
    return $http.get('/admin/third-level-agent/missBindUserList', data, config)
}

// 三级代理总览【分页】
export const getOverview = (data, config = {}) => {
    return $http.get('/admin/agent/overview', data, config)
}

// 三级代理每日明细
export const getOverviewDetail = (data, config = {}) => {
    return $http.get('/admin/agent/overviewDetail', data, config)
}

// 三级代理总览下级明细【分页】
export const getChildDetail = (data, config = {}) => {
    return $http.get('/admin/agent/childDetail', data, config)
}

// 三级代理奖励【分页】
export const getThirdReward = (data, config = {}) => {
    return $http.get('/admin/agent/thirdReward', data, config)
}

// 三级代理奖励明细【分页】
export const getThirdRewardDetail = (data, config = {}) => {
    return $http.get('/admin/agent/thirdRewardDetail', data, config)
}

// 邀请奖励记录【分页】
export const getAgentInviteRewardLog = (data, config = {}) => {
    return $http.get('/admin/custom-agent/inviteLog', data, config)
}

// 成就奖励记录【分页】
export const getAgentMeritRewardLog = (data, config = {}) => {
    return $http.get('/admin/custom-agent/meritLog', data, config)
}

// 充值返佣记录【分页】
export const getAgentRechargeRebateLog = (data, config = {}) => {
    return $http.get('/admin/custom-agent/rechargeLog', data, config)
}

// 投注返佣记录【分页】
export const getAgentBetRebateLog = (data, config = {}) => {
    return $http.get('/admin/custom-agent/playLog', data, config)
}

//邀请人列表【分页】
export const getInviteList = (data, config = {}) => {
    return $http.get('/admin/custom-agent/inviteList', data, config)
}

//邀请关系查询【分页】
export const getRelationList = (data, config = {}) => {
    return $http.get('/admin/custom-agent/relationList', data, config)
}

