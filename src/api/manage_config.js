
import $http from '../common/util/http'

// 获取操作日志列表
export const getOperationLogList = (data, config = {}) => {
    return $http.get('/admin/admin-log/platformList', data, config)
}

// 获取账号列表
export const getAccountList = (data, config = {}) => {
    return $http.get('/admin/emp/list', data, config)
}

// 获取账号信息
export const getAccountData = (data, config = {}) => {
    return $http.get('/admin/emp/data', data, config)
}

// 删除账号信息
export const deleteAccountData = (data, config = {}) => {
    return $http.post('/admin/emp/delete', data, config)
}

// 冻结/解冻账号
export const operateAccountData = (data, config = {}) => {
    return $http.post('/admin/emp/toggle', data, config)
}

// 新增账号
export const addAccountData = (data, config = {}) => {
    return $http.post('/admin/emp/add', data, config)
}

// 修改账号信息
export const editAccountData = (data, config = {}) => {
    return $http.post('/admin/emp/edit', data, config)
}

// 获取角色列表
export const getRoleList = (data, config = {}) => {
    return $http.get('/admin/role/list', data, config)
}

// 新增/编辑角色信息
export const postRoleData = (data, config = {}) => {
    return $http.post('/admin/role/edit', data, config)
}

// 删除角色信息
export const deleteRoleData = (data, config = {}) => {
    return $http.post('/admin/role/delete', data, config)
}

// 获取角色权限
export const getRolePermissionData = (data, config = {}) => {
    return $http.get(`/admin/role/menus`, data, config)
}

// 提交角色权限配置
export const postRolePermissionData = (data, config = {}) => {
    return $http.post(`/admin/role/grant`, data, config)
}

// 获取商户白名单列表
export const getMerchantWhitelistList = (data, config = {}) => {
    return $http.get(`/admin/merchant-whitelist-config/list`, data, config)
}

// 新增修改商户白名单设置
export const postMerchantWhitelistConfig = (data, config = {}) => {
    return $http.post(`/admin/merchant-whitelist-config/edit`, data, config)
}

// 删除商户白名单设置
export const deleteMerchantWhitelistConfig = (data, config = {}) => {
    return $http.post(`/admin/merchant-whitelist-config/delete`, data, config)
}

// 重置google验证器
export const postResetGoogleValidator = (data, config = {}) => {
    return $http.post(`/admin/emp/resetGoogleValidator`, data, config)
}

// 获取人事工资列表
export const getStaffSalaryList = (data, config = {}) => {
    return $http.get(`/admin/emp-salary/list`, data, config)
}

// 根据ID查询员工详情
export const getStaffDetail = (data, config = {}) => {
    return $http.get(`/admin/emp/get`, data, config)
}

// 新增/修改工资
export const postSalaryAddOrEdit = (data, config = {}) => {
    return $http.post(`/admin/emp-salary/addOrEdit`, data, config)
}
