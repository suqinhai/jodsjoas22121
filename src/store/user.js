/*
 * @Date: 2023-09-08 10:06:56
 * @LastEditors: yilaisai
 * @LastEditTime: 2025-01-16 11:31:04
 */
import { defineStore } from 'pinia'
import router from '../router/index.js'
import { token, fetchTree, setPath, playOrderReminder } from '@/common/util'
import { handleLogin, handleLogout, getMenuList, getMerchantPayConfig } from '@/api/user'
import { getHomeDeploy, getTemplate } from '@/api/website'
import { getMerchantMessageUnread } from '@/api/merchant_center'
import {
    getMerchantSummary,
    getSiteSummaryMode,
    getMsgRemindingConfig,
    getMsgRemindingData,
    postMsgRemindingRead,
    getUserDetail,
} from '@/api/common'
import {
    MSG_REMINDING_PATH_PERMISS,
    NO_ONLINE_MENU_DATA,
} from '@/common/util/appConfig'

const usertore = defineStore('user', {
    state: () => {
        return {
            menuPermissList: !localStorage.getItem('menu_permiss_list')
                ? []
                : JSON.parse(localStorage.getItem('menu_permiss_list')),
            menuList: !localStorage.getItem('menu_list')
                ? []
                : JSON.parse(localStorage.getItem('menu_list')),
            funPermissList: !localStorage.getItem('fun_permiss_list')
                ? []
                : JSON.parse(localStorage.getItem('fun_permiss_list')),
            userInfo: !localStorage.getItem('user_info')
                ? {}
                : JSON.parse(localStorage.getItem('user_info')),
            merchantInfo: !localStorage.getItem('merchant_info')
                ? {}
                : JSON.parse(localStorage.getItem('merchant_info')),
            siteInfo: !localStorage.getItem('site_info')
                ? {}
                : JSON.parse(localStorage.getItem('site_info')),
            templateConfig: !localStorage.getItem('template_config')
                ? {}
                : JSON.parse(localStorage.getItem('template_config')),
            merchantMessageNum: 0,
            showConfigTipsDialog: false,
            isRestrictionsIp: true,
            msgRemindingConfig: {},
            msgRemindingData: [],
            msgRemindingTimer: null,
            isShowAcceptConfirm: false,
            hasMsgRemConfig: false,
            merchantPayConfig: [],
            temporaryTemplate: {},
        }
    },
    getters: {
        isHasPermiss() {
            return (val = '') => this.funPermissList.includes(val)
        },
        isHasMenuPermiss() {
            return (val = '') => this.menuPermissList.includes(val)
        },
        isShowMsgRem() {
            return MSG_REMINDING_PATH_PERMISS.some((item) =>
                this.isHasMenuPermiss(item.permissCode),
            )
        },
        msgRemNum() {
            return this.msgRemindingData.reduce(
                (pre, item) => pre + item.count,
                0,
            )
        },
        getMsgRemType() {
            return (type = '') =>
                this.msgRemindingData.find((item) => item.type === type)
        },
        getTemplateType() {
            return () => this.templateConfig.type || 1
        },
        getTemplateColor() {
            return () => this.templateConfig.color || 1
        },
        isCustomTemplate() {
            return this.templateConfig.type === 4
        },
    },
    actions: {
        // 登录
        login(val, config = {}) {
            return new Promise((resolve, reject) => {
                handleLogin(val, config)
                    .then((res) => {
                        this.userInfo = { ...res.data }
                        this.token = res.data.token
                        token(res.data.token)
                        localStorage.setItem(
                            'user_info',
                            JSON.stringify(this.userInfo),
                        )
                        resolve()
                    })
                    .catch((err) => {
                        reject()
                    })
            })
        },

        // 登出
        logout(type = 0) {
            return new Promise((resolve, reject) => {
                type > -1 && handleLogout({ type })
                // .then((res) => {
                localStorage.removeItem('user_info')
                localStorage.removeItem('merchant_info')
                localStorage.removeItem('site_info')
                localStorage.removeItem('fun_permiss_list')
                localStorage.removeItem('menu_permiss_list')
                localStorage.removeItem('menu_list')
                localStorage.removeItem('mid')
                localStorage.removeItem('alreadyRecharge')
                localStorage.removeItem('defaultPath')
                localStorage.removeItem('current_merchant_site')
                localStorage.removeItem('merchant_site_list')
                localStorage.removeItem('template_config')
                let obj = localStorage.getItem('risk_control_popup_data')
                    ? JSON.parse(
                        localStorage.getItem('risk_control_popup_data'),
                    )
                    : {}
                if (typeof obj.riskStatus === 'number' && obj.riskStatus === 0)
                    localStorage.removeItem('risk_control_popup_data')
                token(null)
                this.userInfo = {}
                this.funPermissList = []
                this.menuPermissList = []
                this.menuList = []
                this.templateConfig = {}
                resolve()
                // })
                // .catch((err) => {
                //     reject()
                // })
            })
        },

        // 获取菜单权限
        getMenuList() {
            return new Promise((resolve, reject) => {
                getMenuList()
                    .then((res) => {
                        let arr = res.data.filter((item) => item.isMenu)
                        this.funPermissList = res.data
                            .filter((item) => !item.isMenu)
                            .filter((item) => item.routeCode)
                            .map((item) => item.routeCode)
                        this.menuPermissList = arr
                            .filter((item) => item.routeCode)
                            .map((item) => item.routeCode)
                        this.menuPermissList.unshift('1')
                        localStorage.setItem(
                            'fun_permiss_list',
                            JSON.stringify(this.funPermissList),
                        )
                        localStorage.setItem(
                            'menu_permiss_list',
                            JSON.stringify(this.menuPermissList),
                        )
                        arr = fetchTree(arr, 'id', 'pId')
                        setPath(arr)
                        arr = arr.filter(
                            (item) =>
                                item.path === '/dashboard' ||
                                (item.path !== '/dashboard' &&
                                    item.children &&
                                    item.children.length),
                        )
                        NO_ONLINE_MENU_DATA.forEach((item) => {
                            let obj = arr.find(
                                (its) => its.name === item.firstLevelName,
                            )
                            if (obj) {
                                if (item.secondLevelName) {
                                    let sameParent = obj.children.find(
                                        (ims) =>
                                            ims.name === item.secondLevelName,
                                    )
                                    !!sameParent &&
                                        sameParent.children.push({
                                            name: item.name,
                                            path: item.path,
                                            pId: sameParent.id,
                                        })
                                } else {
                                    obj.children.push({
                                        name: item.name,
                                        path: item.path,
                                        pId: obj.id,
                                    })
                                }
                            }
                        })
                        if (arr.length) {
                            arr.push({
                                icon: 'profit',
                                id: 99999,
                                name: $t('利润中心'),
                                path: '#',
                                children: [
                                    {
                                        pId: 99999,
                                        id: 999991,
                                        name: $t('综合报表(待开放)'),
                                        path: '/profit-center/comprehensive-report',
                                    },
                                    {
                                        pId: 99999,
                                        id: 999992,
                                        name: $t('费用明细(待开放)'),
                                        path: '/profit-center/cost-detail',
                                    },
                                ],
                            })
                        }
                        localStorage.setItem('menu_list', JSON.stringify(arr))
                        this.menuList = arr
                        // console.log(11111111, arr)
                        resolve(arr)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
        },

        // 获取商户详情
        getMerchantDetail() {
            return new Promise((resolve, reject) => {
                getMerchantSummary({
                    gId: this.userInfo.groupId,
                })
                    .then((res) => {
                        this.merchantInfo = res.data || {}
                        localStorage.setItem(
                            'merchant_info',
                            JSON.stringify(this.merchantInfo),
                        )
                        resolve(res)
                    })
                    .catch((err) => {
                        reject()
                    })
            })
        },

        // 获取站点详情
        getSiteInfo() {
            return new Promise((resolve, reject) => {
                getSiteSummaryMode()
                    .then((res) => {
                        this.siteInfo = res.data || {}
                        localStorage.setItem(
                            'site_info',
                            JSON.stringify(this.siteInfo),
                        )
                        resolve(res)
                    })
                    .catch((err) => {
                        reject()
                    })
            })
        },

        // 获取商户消息数量
        getMerchantMessage() {
            return new Promise((resolve, reject) => {
                getMerchantMessageUnread()
                    .then((res) => {
                        this.merchantMessageNum = res.data
                        resolve()
                    })
                    .catch((err) => {
                        reject()
                    })
            })
        },

        //初始化模版配置
        initGetTemplateConfig() {
            return new Promise((resolve, reject) => {
                getTemplate()
                    .then((res) => {
                        if (res.data) {
                            this.templateConfig = res.data
                            localStorage.setItem(
                                'template_config',
                                JSON.stringify(this.templateConfig),
                            )
                        }
                        resolve()
                    })
                    .catch((err) => {
                        reject()
                    })
            })
        },

        // 获取消息提醒配置
        getRemindingConfig(type = '') {
            if (type === 'init') this.isShowAcceptConfirm = true
            getMsgRemindingConfig().then((res) => {
                this.hasMsgRemConfig = true
                let obj = res.data || {}
                let oldObj = { ...this.msgRemindingConfig }
                this.msgRemindingConfig = obj
                if (!obj.rpt) {
                    this.msgRemindingTimer &&
                        clearInterval(this.msgRemindingTimer)
                } else if (obj.rpt !== oldObj.rpt) {
                    this.msgRemindingTimer = setInterval(() => {
                        this.getRemindingData(this.isShowAcceptConfirm)
                    }, obj.rpt * 1000)
                }
                type !== 'reset' &&
                    this.getRemindingData(this.isShowAcceptConfirm)
            })
        },

        // 获取消息提醒数量
        getRemindingData(isRefresh = false) {
            if (
                !localStorage.getItem('current_merchant_site') ||
                !JSON.parse(localStorage.getItem('current_merchant_site')).id
            )
                return (
                    this.msgRemindingTimer &&
                    clearInterval(this.msgRemindingTimer)
                )
            getMsgRemindingData().then((res) => {
                this.msgRemindingData = res.data || []
                if (isRefresh) return
                let isPlay = false
                this.msgRemindingData.forEach((item) => {
                    let obj = MSG_REMINDING_PATH_PERMISS.find(
                        (its) => its.value === item.type,
                    )
                    if (
                        obj &&
                        this.isHasMenuPermiss(obj.permissCode) &&
                        this.msgRemindingConfig[obj.key] &&
                        item.count
                    )
                        isPlay = true
                })
                if (isPlay) playOrderReminder()
                // if (!this.msgRemNum) return
                // let currentPath = router.currentRoute.value.path
                // let obj = MSG_REMINDING_DATA.find(
                //     (item) => item.path === currentPath,
                // )
                // if (obj) this.postRemindingRead(currentObj.id)
            })
        },

        // 消息提醒已读
        postRemindingRead(type) {
            let currentObj = this.msgRemindingData.find(
                (item) => item.type === +type && item.count,
            )
            if (!currentObj) return
            postMsgRemindingRead({ type, maxId: currentObj.maxId }).then(() => {
                this.getRemindingData(true)
            })
        },

        // 获取用户最新详情
        getUserInfoDetail() {
            getUserDetail().then((res) => {
                if (res.status === 'OK') {
                    const {
                        needAnonymous,
                        cashAmountMax,
                        batchCashLimit,
                        limitEditSecret,
                        limitExport,
                        rechargeAmountMax,
                    } = res.data
                    let userInfo = JSON.parse(localStorage.getItem('user_info'))
                    userInfo.needAnonymous = needAnonymous
                    userInfo.cashAmountMax = cashAmountMax
                    userInfo.batchCashLimit = batchCashLimit
                    userInfo.limitEditSecret = limitEditSecret
                    userInfo.limitExport = limitExport
                    userInfo.rechargeAmountMax = rechargeAmountMax
                    localStorage.setItem('user_info', JSON.stringify(userInfo))
                    this.userInfo = userInfo
                }
            })
        },
        // 获取商户支付配置
        getMerchantPayConfigFn() {
            getMerchantPayConfig().then((res) => {
                if (res.status === 'OK') {
                    let arr = []
                    res.data.forEach((item) => {
                        arr.push({
                            label: item.channel_,
                            value: item.channel,
                        })
                    })
                    this.merchantPayConfig = arr
                }
            })
        },
        setTemporaryTemplate(template) {
            this.temporaryTemplate = template
        },
    },
})

export default usertore
