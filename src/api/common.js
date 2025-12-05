import $http from '../common/util/http'

// 获取连接状态
export const getLinkState = (data, config = {}) => {
    return $http.get('/admin', data, config)
}

// 获取文件上传地址
export const getUploadUrl = (data, config = {}) => {
    return $http.get('/admin/file/uploadUrl', data, config)
}

// 获取文件上传限制
export const getUploadLimit = (data, config = {}) => {
    return $http.get('/admin/file/init', data, config)
}

// 获取元数据
export const getCommonMeta = (data, config = {}) => {
    return $http.get('/admin/common/metas', data, config)
}

// 会员基础信息获取
export const getUserBaseDetail = (data, config = {}) => {
    return $http.get('/admin/user/summary', data, config)
}

// 获取元数据配置
export const getMetaData = (data, config = {}) => {
    return $http.get('/admin/meta/itemList', data, config)
}

// 提交元数据配置
export const postMetaData = (data, config = {}) => {
    return $http.post('/admin/meta/edit', data, config)
}

// 新商户配置引导
export const getConfigCheck = (data, config = {}) => {
    return $http.get('/admin/merchant/configCheck', data, config)
}

// 获取商家支持的厂家与游戏类型
export const getMerchantVendorData = (data, config = {}) => {
    return $http.get('/admin/merchant-vendor/all', data, config)
}

// 获取会员余额
export const getMemberBalance = (data, config = {}) => {
    return $http.get('/admin/account/balance', data, config)
}

// 查询DNS键值对
export const getDomainDnsConfig = (data, config = {}) => {
    // forBack: 0=前台；1=后台
    // position: 0=Web大厅；1=App大厅；2=下载站域名；3=支付域名
    return $http.get('/admin/domain/dnsItems', data, config)
}

// 获取商户游戏厂家列表
export const getMerchantVendorList = (data, config = {}) => {
    return $http.get('/admin/merchant/gameVendorList', data, config)
}

// 查询活跃人数
export const getLastActiveCount = (data, config = {}) => {
    return $http.get('/admin/report/lastActiveCount', data, config)
}

// 用户标签键值对
export const getMemberTagItems = (data, config = {}) => {
    return $http.get('/admin/user-tag/items', data, config)
}

// 层级下拉列表
export const getLevelConfig = (data, config = {}) => {
    // 层级类型type：0=自动层级；1=固定层级；不传查询所有
    return $http.get('/admin/merchant-layer-config/all', data, config)
}

// 获取站点角色列表（下拉选择）
export const getMerchantRoleList = (data, config = {}) => {
    return $http.get('/admin/role/items', data, config)
}

// 获取站点下拉列表
export const getMerchantSiteList = (data, config = {}) => {
    return $http.get('/admin/merchant/groups', data, config)
}

// 获取商户详情
export const getMerchantSummary = (data, config = {}) => {
    return $http.get('/admin/merchant/summary', data, config)
}

// 获取站点详情
export const getSiteSummaryMode = (data, config = {}) => {
    return $http.get('/admin/merchant/summaryMode', data, config)
}

// 获取国家/地区列表
export const getCountryAreaList = (data, config = {}) => {
    return $http.get('/admin/region-limit/regionItems', data, config)
}

// 获取消息提醒配置
export const getMsgRemindingConfig = (data, config = {}) => {
    return $http.get('/admin/radio/promptSoundConfig', data, config)
}

// 修改消息提醒配置
export const postMsgRemindingConfig = (data, config = {}) => {
    return $http.post('/admin/radio/editPromptSound', data, config)
}

// 获取消息提醒消息数量
export const getMsgRemindingData = (data, config = {}) => {
    return $http.get('/admin/radio/pendingList', data, config)
}

// 消息提醒已读上报
export const postMsgRemindingRead = (data, config = {}) => {
    return $http.post('/admin/radio/markProcessed', data, config)
}

// 获取活动数据（未开始/进行中）
export const getActivityData = (data, config = {}) => {
    return $http.get('/admin/promotion/validList', data, config)
}

// 渠道键值对
export const getChannelData = (data, config = {}) => {
    return $http.get('/admin/channel/items', data, config)
}

// 获取会员等级键值对
export const getUserGradeData = (data, config = {}) => {
    return $http.get('/admin/user-level-config/userLevels', data, config)
}

// 根据游戏类型获取厂家列表（可多选厂家）
export const getGameVendorList = (data, config = {}) => {
    return $http.get('/admin/merchant-game/aliasList', data, config)
}

// 获取票券数据
export const getTicketList = (data, config = {}) => {
    return $http.get('/admin/ticket/empList', data, config)
}

//获取用户详情
export const getUserDetail = (data, config = {}) => {
    return $http.get('/admin/emp/info', data, config)
}

// 活动标签元数据
export const getActivityTagData = (data, config = {}) => {
    return $http.get('/admin/promotion-tag/all', data, config)
}

// 获取表格表头配置
export const getTableHeaderConfig = (data, config = {}) => {
    return $http.get('/admin/user/getTitle', data, config)
}

// 编辑表格表头配置
export const postTableHeaderConfig = (data, config = {}) => {
    return $http.post('/admin/user/editTitle', data, config)
}