/*
 * @Author: yilaisai
 * @Date: 2024-11-12 15:26:40
 * @LastEditors: yilaisai
 * @LastEditTime: 2024-11-19 17:57:35
 */
import $http from '../common/util/http'

// 域名管理列表（前台/后台）
export const getDomainList = (data, config = {}) => {
    return $http.get('/admin/domain/list', data, config)
}
//域名下拉列表
export const getDomainListData = (data, config = {}) => {
    return $http.get('/admin/promotion/domainList', data, config)
}
// 添加域名
export const postDomainData = (data, config = {}) => {
    return $http.post('/admin/domain/edit', data, config)
}

// 验证域名
export const postVerifyDomain = (data, config = {}) => {
    return $http.post('/admin/domain/active', data, config)
}

// 停用/启用域名
export const postDomainStatus = (data, config = {}) => {
    return $http.post('/admin/domain/toggle', data, config)
}

// 删除域名
export const deleteDomainData = (data, config = {}) => {
    return $http.post('/admin/domain/delete', data, config)
}

// APP最新版本信息 列表【分页】
export const getAppInfoList = (data, config = {}) => {
    return $http.get('/admin/app-info/list', data, config)
}

// 添加/修改APP版本信息
export const postAppInfoData = (data, config = {}) => {
    return $http.post('/admin/app-info/edit', data, config)
}

// APP打包或者发布
export const postAppPack = (data, config = {}) => {
    return $http.post('/admin/app-info/toggle', data, config)
}

// 删除APP版本信息
export const deleteAppInfoData = (data, config = {}) => {
    return $http.post('/admin/app-info/del', data, config)
}

// APP原生马甲包管理【分页】
export const getVestBagList = (data, config = {}) => {
    return $http.get('/admin/app-info/appList', data, config)
}

// APP包名列表
export const getPackageNameList = (data, config = {}) => {
    return $http.get('/admin/app-info/packageNames', data, config)
}

// APP原生马甲包编辑
export const postVestBagData = (data, config = {}) => {
    return $http.post('/admin/app-info/appEdit', data, config)
}

// 流量统计【分页】
export const getTrafficStatisticsList = (data, config = {}) => {
    return $http.get('/admin/traffic-stat/list', data, config)
}

// 流量统计详情
export const getTrafficStatisticsInfo = (data, config = {}) => {
    return $http.get('/admin/traffic-stat/detail', data, config)
}

// APP配置
export const getAppInfoConfig = (data, config = {}) => {
    return $http.get('/admin/app-info/config', data, config)
}

// 保存APP配置
export const saveAppInfoConfig = (data, config = {}) => {
    return $http.post('/admin/app-info/configEdit', data, config)
}
