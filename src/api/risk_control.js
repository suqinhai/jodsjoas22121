import $http from '../common/util/http'

// 获取层级列表
export const getLevelList = (data, config = {}) => {
    // 层级类型type：0=自动层级；1=固定层级
    return $http.get('/admin/merchant-layer-config/list', data, config)
}

// 修改层级配置
export const postLevelData = (data, config = {}) => {
    return $http.post('/admin/merchant-layer-config/edit', data, config)
}

// 编辑用户操作行为
export const postLevelLimit = (data, config = {}) => {
    return $http.post('/admin/merchant-layer-config/batchHandle', data, config)
}

// 会员层级列表【分页】
export const getLevelUserList = (data, config = {}) => {
    return $http.get('/admin/merchant-layer-config/userList', data, config)
}

// 编辑/删除会员层级
export const postMemberLevelData = (data, config = {}) => {
    return $http.post('/admin/merchant-layer-config/editLayer', data, config)
}

// 获取会员层级控制管理列表(专业模式)
export const getUserLevelControlList = (data, config = {}) => {
    return $http.get('/admin/user-game-control/list', data, config)
}

// 新增/修改会员层级控制(专业模式)
export const postUserLevelControl = (data, config = {}) => {
    return $http.post('/admin/user-game-control/addOrEdit', data, config)
}

// 结束会员层级控制(专业模式)
export const overUserLevelControl = (data, config = {}) => {
    return $http.post('/admin/user-game-control/over', data, config)
}

// 踢线(专业模式)
export const postUserOffline = (data, config = {}) => {
    return $http.post('/admin/user-game-control/quit', data, config)
}

// 新增层级控制(专业模式)
export const postLevelControlConfig = (data, config = {}) => {
    return $http.post('/admin/user-game-control/addByLayer', data, config)
}

// 控制历史【分页】
export const getLevelControlHistory = (data, config = {}) => {
    return $http.get('/admin/user-simple-ctrl/history', data, config)
}

// 新增vip盈利控制(专业模式)
export const postProfitControlConfig = (data, config = {}) => {
    return $http.post('/admin/user-game-control/ctrlVipTier', data, config)
}

// 获取控制池配置
export const getControlPoolConfig = (data, config = {}) => {
    return $http.get('/admin/user-simple-ctrl/viewVipTierCfg', data, config)
}

// 提交控制池配置
export const postControlPoolConfig = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/editVipTierCfg', data, config)
}

// 一键设置控制池 | 一键同步推广账号返奖率
export const postSimpleControlOnekey = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/syncLog', data, config)
}

// 控制列表【分页】(简易模式)
export const getSimpleControlList = (data, config = {}) => {
    return $http.get('/admin/user-simple-ctrl/logList', data, config)
}

// 默认配置(简易模式)
export const postSimpleDefaultConfig = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/editBase', data, config)
}

// 修改控制池(简易模式)
export const postSimpleControlData = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/editLog', data, config)
}

// 规则列表(简易模式)
export const getSimpleRuleList = (data, config = {}) => {
    return $http.get('/admin/user-simple-ctrl/ruleList', data, config)
}

// 新增规则(简易模式)
export const addSimpleRuleData = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/addRule', data, config)
}

// 修改规则(简易模式)
export const editSimpleRuleData = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/editRule', data, config)
}

// 删除规则(简易模式)
export const deleteSimpleRuleData = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/delRule', data, config)
}

// 一键同步控制池(简易模式)
export const postSyncRuleConfig = (data, config = {}) => {
    return $http.post('/admin/user-simple-ctrl/syncRule', data, config)
}

// 获取商户VIP控制余额限制
export const getMemberRiskControlLimit = (data, config = {}) => {
    return $http.get('/admin/user-simple-ctrl/getLimit', data, config)
}

// 获取IP黑名单列表
export const getIpBlacklistList = (data, config = {}) => {
    return $http.get('/admin/user-blacklist/listIP', data, config)
}

// 获取会员黑名单列表
export const getMemberBlacklistList = (data, config = {}) => {
    return $http.get('/admin/user-blacklist/listUser', data, config)
}

// 新增/修改黑名单
export const postBlacklistData = (data, config = {}) => {
    return $http.post('/admin/user-blacklist/addOrEdit', data, config)
}

// 移除黑名单用户
export const deleteSingleBlacklistData = (data, config = {}) => {
    return $http.post('/admin/user-blacklist/delete', data, config)
}

// 批量移除黑名单用户
export const deleteBatchBlacklistData = (data, config = {}) => {
    return $http.post('/admin/user-blacklist/deleteBatch', data, config)
}

// 游戏获利监控列表【分页】
export const userProfitSpyListApi = (data, config = {}) => {
    return $http.get('/admin/user-profit-spy/list', data, config)
}

// 查询游戏获利监控配置
export const userProfitSpyViewApi = (data, config = {}) => {
    return $http.get('/admin/user-profit-spy/view', data, config)
}

// 添加/修改监控参数
export const userProfitSpyAddOrEditApi = (data, config = {}) => {
    return $http.post('/admin/user-profit-spy/addOrEdit', data, config)
}

// 处理监控记录
export const userProfitSpyAuditApi = (data, config = {}) => {
    return $http.post('/admin/user-profit-spy/audit', data, config)
}

// 游戏控制数据统计【分页】
export const userControlStatStatApi = (data, config = {}) => {
    return $http.get('/admin/user-control-stat/stat', data, config)
}

// 游戏概率控制统计【分页】
export const userControlStatGameStatApi = (data, config = {}) => {
    return $http.get('/admin/user-control-stat/gameStat', data, config)
}

// 游戏控杀控放开关
export const userControlStatToggleApi = (data, config = {}) => {
    return $http.post('/admin/user-control-stat/toggle', data, config)
}

// 刷子监控列表【分页】
export const gitRelevanceMonitoringList = (data, config = {}) => {
    return $http.get('/admin/user-bot-spy/list', data, config)
}

// 提交处罚
export const postCrimeSheetData = (data, config = {}) => {
    return $http.post('/admin/user-bot-spy/punishBatch', data, config)
}

// 刷子监控处罚列表【分页】
export const gitCrimeSheetList = (data, config = {}) => {
    return $http.get('/admin/user-bot-spy/listLog', data, config)
}

// 查看刷子监控配置规则
export const gitMonitoringRule = (data, config = {}) => {
    return $http.get('/admin/user-bot-spy/view', data, config)
}

// 配置刷子监控规则
export const postMonitoringRule = (data, config = {}) => {
    return $http.post('/admin/user-bot-spy/addOrEdit', data, config)
}

// 会员钱包余额详情
export const getMemberAccountInfo = (data, config = {}) => {
    return $http.get('/admin/account/info', data, config)
}

// 一键拉回|带出厂家余额
export const postMemberBalancePull = (data, config = {}) => {
    return $http.post('/admin/account/transOut', data, config)
}

// 获取调控会员限玩列表
export const getMemberGameList = (data, config = {}) => {
    return $http.get('/admin/game-play-limit/list', data, config)
}

// 提交游戏限玩配置
export const postMemberGameConfig = (data, config = {}) => {
    return $http.post('/admin/game-play-limit/config', data, config)
}

//全部提现-备注
export const postRemark = (data, config = {}) => {
    return $http.post('/admin/cash-log/edit', data, config)
}
