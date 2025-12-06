
import $http from '../common/util/http'

// 代理列表
export const getAgentCommissionChanges = (data, config = {}) => {
    return $http.get('/admin/agent-coin-log/commissionChanges', data, config)
}

// 代理分红操作
export const postCommissionAdjusts = (data, config = {}) => {
    return $http.post('/admin/agent-coin-log/commissionAdjust', data, config)
}

// 获取出款额度列表【分页】
export const getAdjustListData = (data, config = {}) => {
    return $http.get('/admin/agent-coin-log/adjustList', data, config)
}

// 出款额度配置
export const postAdjustConfig = (data, config = {}) => {
    return $http.post('/admin/agent-coin-log/adjust', data, config)
}

// 获取代理商列表【分页】
export const getAgentManageListData = (data, config = {}) => {
    return $http.get('/admin/agent-manage/list', data, config)
}

// 添加代理商
export const postAddAagentManage = (data, config = {}) => {
    return $http.post('/admin/agent-manage/add', data, config)
}

// 获取代理商分成列表
export const getShareListData = (data, config = {}) => {
    return $http.get('/admin/agent-manage/shareList', data, config)
}

// 编辑代理商分成配置
export const postEditShareEdit = (data, config = {}) => {
    return $http.post('/admin/agent-manage/shareEdit', data, config)
}
