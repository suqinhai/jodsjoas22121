import axios from 'axios'
import qs from 'qs'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '../../router/index.js'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import tagsStore from '@/store/tags'
import { POST_HTTP_URL } from '@/common/util/appConfig'
import {
    token,
    getHeaderTimeZone,
    blobToJson,
    getMerchantId,
    excelFileExport,
    getTimezone,
} from '@/common/util'

const controller = new AbortController()

const service = axios.create({
    withCredentials: true,
    baseURL: process.env.VITE_AUTH_PATH + '/api',
    timeout: 1800000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
})

service.interceptors.request.use(
    (config) => {
        // 没有获取到商户id时，手动取消请求
        if (
            !getMerchantId() &&
            config.url !== '/admin/emp/login' &&
            config.url !== '/admin/emp/logout'
        ) {
            controller.abort('请求被取消')
            config.signal = controller.signal // 绑定 AbortSignal
        }
        // config.headers['App-Id'] = 'game_merchant/PC/1.0.0/main/-03'
        config.headers['App-Id'] =
            'game_merchant/PC/1.0.0/main/' + getHeaderTimeZone()
        config.headers['Accept-Language'] =
            localStorage.getItem('locale') || 'zh'
        if (localStorage.getItem('mid')) {
            config.headers['mid'] = localStorage.getItem('mid')
        }
        if (token()) {
            config.headers.Authorization = token()
        }
        return config
    },
    (error) => Promise.reject(error),
)

service.interceptors.response.use(
    async (response) => {
        const { data, config } = response
        // 文件导出
        // if (config.responseType === 'blob') {
        if (config.isExport && !data.status) {
            excelFileExport(response)
            return Promise.resolve()
        }

        if (!data) return response
        const { msg, status, callback } = data
        let userData = userStore()
        if (status && status === 'merchant_whitelist') {
            userData.isRestrictionsIp = true
            if (router.currentRoute.value.path !== '/ip-restrictions') {
                router.replace('/ip-restrictions')
            }
            localStorage.removeItem('menu_list')
            userData.menuList = []
            return Promise.reject(data)
        } else if (status && status === 'maintain') {
            router.replace('/maintain')
            return Promise.resolve(data)
        } else if (status && status === 'async_export') {
            ElMessage.success(msg)
            router.push('/data-report/export-download')
            return Promise.resolve()
        } else {
            userData.isRestrictionsIp && (userData.isRestrictionsIp = false)
        }
        if (msg) {
            if (callback && callback === 'alert') {
                ElMessageBox.alert(msg, {
                    dangerouslyUseHTMLString: true,
                })
                // ElMessageBox.alert(msg)
            } else if (config.url !== '/admin/radio/markProcessed') {
                let type = status === 'OK' ? 'success' : 'error'
                ElMessage[type]({
                    dangerouslyUseHTMLString: true,
                    message: msg,
                })
            }
        }

        // 状态为login时记录当前路由地址并跳到登录页
        let currentPath = router.currentRoute.value
        if (
            status === 'login' &&
            currentPath.fullPath &&
            currentPath.fullPath !== '/login'
        ) {
            localStorage.setItem('defaultPath', currentPath.fullPath)
            await userData.logout(2)
            commonStore().resetCommonData()
            tagsStore().clearTags()
            router.replace('/login')
            return Promise.reject()
        } else if (status === 'frozen' || status === 'blocked') {
            return Promise.reject(data)
        }
        if (status !== 'OK') return Promise.reject(data)
        return Promise.resolve(data)
    },
    async (error) => {
        // 手动取消请求
        if (error.code === 'ERR_CANCELED') {
            ElMessage.error(
                $t('检测到关键参数缺失，请刷新页面后重新获取数据！'),
            )
            return Promise.reject(error)
        }

        const { response } = error
        // if (request.responseType === 'blob') {
        //     blobToJson(response.data).then((res) => {
        //         ElMessage.error(res.msg || $t('请求失败！'))
        //     })
        // }
        if (response && response.data && response.data.msg) {
            if (response.data.callback && response.data.callback === 'alert') {
                ElMessageBox.alert(response.data.msg, {
                    dangerouslyUseHTMLString: true,
                })
                // ElMessageBox.alert(response.data.msg)
            } else {
                let currentPath = router.currentRoute.value
                if (
                    response.data.status === 'login' &&
                    currentPath.fullPath &&
                    currentPath.fullPath !== '/login'
                ) {
                    localStorage.setItem('defaultPath', currentPath.fullPath)
                    await userStore().logout(2)
                    commonStore().resetCommonData()
                    tagsStore().clearTags()
                    router.replace('/login')
                }
                ElMessage.error(response.data.msg)
            }
        } else {
            ElMessage.error(error.message || error.response.status)
        }
        return Promise.reject(error)
    },
)

export const $http = {
    get: (url, data = null, config = {}) => {
        let params = {}
        if (data) {
            for (let key in data) {
                if (!['', null, undefined].includes(data[key])) {
                    params[key] = data[key]
                }
            }
        }
        if (!params) {
            params = {
                merchantId: getMerchantId(),
            }
        } else if (params.merchantId === 0) {
            delete params.merchantId
        } else if (!params.merchantId) {
            params.merchantId = getMerchantId()
        }
        if (params.isExport) {
            params.export = getTimezone()
            config.isExport = true
            delete params.isExport
        }
        return service.get(url, {
            params,
            ...config,
        })
    },
    post: (url, data = null, config = {}, allowDots = true) => {
        if (!POST_HTTP_URL.includes(url)) {
            if (!data) {
                data = {
                    merchantId: getMerchantId(),
                }
            } else if (data.merchantId === 0) {
                delete data.merchantId
            } else if (!data.merchantId) {
                data.merchantId = getMerchantId()
            }
        }
        // allowDots：数据存在数组格式(例：{a:[{b:1}]})时为true，数据存在对象嵌套(例：{a:{b:1}})时为false
        return service.post(
            url,
            qs.stringify(data, { arrayFormat: 'indices', allowDots }),
            config,
        )
    },
}

export default $http
