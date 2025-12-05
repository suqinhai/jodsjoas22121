import $http from '../common/util/http'

// 常见问题
export const getCommonProblemList = (data, config = {}) => {
    return $http.get('/admin/faq/list', data, config)
}

// 新增/修改常见问题
export const postCommonProblemData = (data, config = {}) => {
    return $http.post('/admin/faq/addOrEdit', data, config)
}

//删除常见问题
export const deleteCommonProblemData = (data, config = {}) => {
    return $http.post('/admin/faq/delete', data, config)
}

// 获取其他客服列表
export const getOtherServiceList = (data, config = {}) => {
    return $http.get('/admin/customer-service-config/otherList', data, config)
}

// 新增/修改其他客服配置
export const postOtherServiceData = (data, config = {}) => {
    return $http.post('/admin/customer-service-config/otherEdit', data, config)
}

// 删除其他客服配置
export const delOtherServiceData = (data, config = {}) => {
    return $http.post(
        '/admin/customer-service-config/otherDelete',
        data,
        config,
    )
}

// 获取渠道、代理列表【分页】
export const getOtherLinkList = (data, config = {}) => {
    return $http.get(
        '/admin/customer-service-config/otherLinkList',
        data,
        config,
    )
}
