import { defineStore } from 'pinia'
import {
    getConfigCheck,
    getUploadLimit,
    getMerchantSiteList,
} from '@/api/common'
import router from '../router/index.js'
import { GUIDE_PATH } from '../common/util/appConfig.js'

const commonStore = defineStore('common', {
    state: () => {
        return {
            merchantSiteList: !localStorage.getItem('merchant_site_list')
                ? []
                : JSON.parse(localStorage.getItem('merchant_site_list')),
            allMerchantSiteList:[],
            currentMerchantSite: !localStorage.getItem('current_merchant_site')
                ? {}
                : JSON.parse(localStorage.getItem('current_merchant_site')),
            alreadyRecharge: true,
            showTipsDialog: false,
            guideList: [],
            guideCustomer: '',
            fileType: {
                image: {},
                video: {},
                audio: {},
            },
            memberDetailShow: false,
            memberId: '',
            isManual: false,
        }
    },
    getters: {
        guideFinished: (state) => {
            return state.guideList.every((item) => item.status === 1)
        },
    },
    actions: {
        // 重置数据
        resetCommonData() {
            this.merchantSiteList = []
            this.currentMerchantSite = {}
            this.alreadyRecharge = true
            this.showTipsDialog = true
            this.memberDetailShow = false
            this.memberId = ''
            this.guideList = []
            this.guideCustomer = ''
        },

        getRechargeStatus(path) {
            let rechargeStatus = localStorage.getItem('alreadyRecharge')
            let userInfo = localStorage.getItem('user_info')
                ? JSON.parse(localStorage.getItem('user_info'))
                : {}
            if (this.currentMerchantSite.id !== userInfo.merchantId) return
            if (!this.alreadyRecharge && !rechargeStatus)
                return (this.showTipsDialog = true)
            if (
                (rechargeStatus || this.alreadyRecharge) &&
                this.guideList.length &&
                this.guideFinished
            )
                return
            return new Promise(async (resolve, reject) => {
                const res = await getConfigCheck()
                const { data, code } = res
                if (code === 0) {
                    let currentPath = path || router.currentRoute.value.path
                    this.guideList = data.items || []
                    this.guideCustomer = data.customerConfig
                    if (data.rechargeFlag) {
                        this.alreadyRecharge = true
                        this.showTipsDialog = false
                        let finished = this.guideList.every(
                            (item) => item.status === 1,
                        )
                        if (!finished) {
                            // 未完成商户初始化，当前页面是需要配置的页面不弹窗，不需要配置和已配置完成的页面都会弹窗
                            let pop = this.guideList.some(
                                (item) =>
                                    item.status === 0 &&
                                    currentPath === GUIDE_PATH[item.id],
                            )
                            if (!pop) globalVBus.$emit('showGuide')
                        }
                    } else if (currentPath !== '/merchant-center/recharge') {
                        // 未完成充值跳转弹充值提示窗
                        this.alreadyRecharge = false
                        this.showTipsDialog = true
                    }
                    resolve()
                }
            })
        },

        // 获取上传文件限制
        getFileType() {
            getUploadLimit({ bizType: 'image' }).then((res) => {
                this.fileType.image = res.data || {}
            })
            getUploadLimit({ bizType: 'video' }).then((res) => {
                this.fileType.video = res.data || {}
            })
            getUploadLimit({ bizType: 'audio' }).then((res) => {
                this.fileType.audio = res.data || {}
            })
        },

        // 获取商户站点
        getMerchantSiteData() {
            return new Promise((resolve, reject) => {
                getMerchantSiteList()
                    .then((res) => {
                        if (!res.data) return
                        this.merchantSiteList = res.data || []
                        let sameObj = this.merchantSiteList.find(
                            (item) =>
                                item.id === this.currentMerchantSite.id,
                        )
                        if (
                            !this.currentMerchantSite.id || !sameObj) {
                            this.currentMerchantSite =
                                this.merchantSiteList[0] ? { ...this.merchantSiteList[0] } : {}
                        } else {
                                this.currentMerchantSite = { ...sameObj }
                        }
                        localStorage.setItem(
                            'current_merchant_site',
                            JSON.stringify(this.currentMerchantSite),
                        )
                        localStorage.setItem(
                            'merchant_site_list',
                            JSON.stringify(this.merchantSiteList),
                        )
                        resolve()
                    })
                    .catch((err) => {
                        reject()
                    })
            })
        },

        // 设置当前站点
        setCurrentMerchantSite(site = '') {
            if (this.currentMerchantSite.id !== site) {
                this.currentMerchantSite =
                    this.merchantSiteList.find((item) => item.id === site) || {}
                localStorage.setItem(
                    'current_merchant_site',
                    JSON.stringify(this.currentMerchantSite),
                )
            }
        },

        // 会员详情弹窗
        showMemberDetail(memberId) {
            this.memberId = memberId
            this.memberDetailShow = true
        },

        // 获取全部站点列表
        getAllMerchantSiteData() {
            if (this.allMerchantSiteList.length) return 
            return new Promise((resolve, reject) => {
                getMerchantSiteList({type:1})
                    .then((res) => {
                        if (!res.data) return
                        this.allMerchantSiteList = res.data || []
                        resolve()
                    })
                    .catch((err) => {
                        reject()
                    })
            })
        },
    },
})

export default commonStore
