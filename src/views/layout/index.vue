<template>
    <!-- <div> -->
    <!-- <Navbar v-if="!isNeedBinding"></Navbar> -->
    <Navbar v-if="userData.menuList.length && !isNeedBinding" @reload="reload"></Navbar>
    <TopMenu v-if="userData.menuList.length && !isNeedBinding"></TopMenu>
    <div v-if="userData.menuList.length && !isNeedBinding" class="content-box content-top-menu">
        <TagsView></TagsView>
        <div class="content" v-loading="loading">
            <router-view v-slot="{ Component }" v-if="state.isRouterAlive">
                <transition name="move" mode="out-in">
                    <div :key="useRoute.path" class="page-container">
                        <keep-alive :include="tagsData.nameList">
                            <component :is="Component"></component>
                        </keep-alive>
                    </div>
                </transition>
            </router-view>
        </div>
    </div>
    <NotificationMessage :itemData="state.notificationData" v-if="state.notificationPopupShow" @close="state.notificationPopupShow = false"
        @showNext="showNext('currentNotificationIndex',1)">
    </NotificationMessage>
    <BigRRemindMassage :itemData="state.bigRRemindData" v-if="state.bigRRemindPopupShow" @close="state.bigRRemindPopupShow = false"
        @showNext="showNext('currentRremindIndex',0)" @showMemberInfo="commonData.showMemberDetail">
    </BigRRemindMassage>
    <RiskControlMassage :itemData="state.riskControlData" v-if="state.riskControlPopupShow" @close="state.riskControlPopupShow = false">
    </RiskControlMassage>
    <ComplaintRemindDialog :itemData="state.complaintRemindData" v-if="state.complaintRemindShow" @close="state.complaintRemindShow = false">
    </ComplaintRemindDialog>
    <!-- <TipsDialog v-if="commonData.showTipsDialog && !alreadyRecharge"></TipsDialog>
    <GuideDialog v-if="!commonData.guideFinished && alreadyRecharge"></GuideDialog>
    <TemplateTipsDialog v-if="alreadyRecharge && userData.showConfigTipsDialog"></TemplateTipsDialog> -->
    <MemberDetail v-if="commonData.memberDetailShow"></MemberDetail>
    <BindingGoogleCaptcha v-if="isNeedBinding"></BindingGoogleCaptcha>
    <!-- </div> -->
</template>
<script setup name='home'>
import { defineAsyncComponent, onMounted, ref, reactive, nextTick, watch, onBeforeUnmount, computed, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElLoading } from 'element-plus'
import sidebarStore from '@/store/sidebar'
import tagsStore from '@/store/tags'
import commonStore from '@/store/common'
import userStore from '@/store/user'
import { getAccountData } from '@/api/manage_config'
import { getMerchantMessagePopup, getMerchantMessageInfo, getBigRRemindMassageList, getRiskControlRemindData } from '@/api/merchant_center'
import { getComplaintRemindData } from '@/api/operation'
import { dateFormat, findFirstMenuPage, findPathInList, apiRouteName } from '@/common/util'
import { EXTRA_PAGE_PATH, NO_REFRESH_PATH } from '@/common/util/appConfig.js'

// 通用组件
const Dialog = defineAsyncComponent(() => import('@/components/Dialog/index.vue'))
const Pagination = defineAsyncComponent(() => import('@/components/Pagination/index.vue'))
const Tinymce = defineAsyncComponent(() => import('@/components/Tinymce/index.vue'))
const UploadImage = defineAsyncComponent(() => import('@/components/UploadImage/index.vue'))
const Upload = defineAsyncComponent(() => import('@/components/Upload/index.vue'))
const MerchantSiteSelect = defineAsyncComponent(() => import('@/components/MerchantSiteSelect/index.vue'))
const MemberDetail = defineAsyncComponent(() => import('@/components/MemberDetail/index.vue'))

const Navbar = defineAsyncComponent(() => import('./components/Navbar.vue'))
const TopMenu = defineAsyncComponent(() => import('./components/TopMenu.vue'))
const TagsView = defineAsyncComponent(() => import('./components/TagsView.vue'))
const NotificationMessage = defineAsyncComponent(() => import('./components/NotificationMessage.vue'))
const BigRRemindMassage = defineAsyncComponent(() => import('./components/BigRRemindMassage.vue'))
const RiskControlMassage = defineAsyncComponent(() => import('./components/RiskControlMassage.vue'))
const TipsDialog = defineAsyncComponent(() => import('./components/TipsDialog.vue'))
const GuideDialog = defineAsyncComponent(() => import('./components/GuideDialog.vue'))
const TemplateTipsDialog = defineAsyncComponent(() => import('./components/TemplateTipsDialog.vue'))
const BindingGoogleCaptcha = defineAsyncComponent(() => import('./components/BindingGoogleCaptcha.vue'))
const ComplaintRemindDialog = defineAsyncComponent(() => import('./components/ComplaintRemindDialog.vue'))

const sidebarData = sidebarStore() // 保留用于其他逻辑兼容
const tagsData = tagsStore()
const commonData = commonStore()
const userData = userStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const state = reactive({
    isRouterAlive: true,// 刷新页面
    notificationPopupShow: false,  // 通知弹窗是否展示
    notificationData: {},  // 当前通知弹窗内容
    currentNotificationIndex: 0,  // 当前通知弹窗索引
    notificationTimer: null,  // 通知弹窗定时器
    bigRRemindTimer: null,  // 大R上线提醒弹窗定时器
    bigRRemindPopupShow: false,  // 大R上线提醒弹窗是否展示
    bigRRemindData: {},  // 当前大R上线提醒弹窗内容
    currentRremindIndex: 0,  // 当前大R上线弹窗索引
    riskControlPopupShow: false,  // 风控提醒弹窗是否展示
    riskControlData: {},  // 风控提醒弹窗内容
    riskControlTimer: null,  // 风控提醒弹窗定时器
    complaintRemindShow: false,  // 投诉提醒弹窗是否展示
    complaintRemindData: '',  // 投诉提醒弹窗内容
    complaintRemindTimer: null,  // 投诉提醒弹窗定时器
})

// const alreadyRecharge = computed(() => {
//     return localStorage.getItem('alreadyRecharge') || commonData.alreadyRecharge
// })
const isNeedBinding = computed(() => {
    return userData.userInfo.id && !userData.userInfo.enableGoogleAuth
})
const isMerchant = computed(() => {
    let { asGroup, merchantId, siteMid } = userData.userInfo
    return asGroup && ((siteMid && merchantId === siteMid) || !siteMid)
})

watch(
    () => state.notificationPopupShow,
    (val) => {
        if (val && !state.notificationData.status && userData.isHasPermiss('admin.merchant-msg.detail')) {
            postReaded()
        }
    }
)
watch(
    () => isNeedBinding.value,
    (newVal, oldVal) => {
        if (userData.userInfo.id && !newVal && newVal !== oldVal && !userData.isRestrictionsIp) {
            getData()
        }
    }
)

onBeforeMount(async () => {
    state.notificationTimer && clearInterval(state.notificationTimer)
    state.bigRRemindTimer && clearInterval(state.bigRRemindTimer)
    state.riskControlTimer && clearInterval(state.riskControlTimer)
    userData.msgRemindingTimer && clearInterval(userData.msgRemindingTimer)
    globalVBus.$on('globalLoading', (val) => {
        loading.value = val
    })
    await userData.getMenuList().then(() => {
        if (!findPathInList(userData.menuList, route.path) && !EXTRA_PAGE_PATH.includes(route.path)) {
            let path = findFirstMenuPage(userData.menuList)
            tagsData.clearTags()
            router.replace(path)
        } else {
            tagsData.setTagsItem({
                name: route.name,
                title: apiRouteName(route),
                path: route.path,
                fullPath: route.fullPath,
            })
        }
        globalVBus.$on('memberDetailDialog', (val) => {
            commonData.showMemberDetail(val)
        })
        if (!userData.isRestrictionsIp && !isNeedBinding.value) getData()
    })
})

// onMounted(() => {
// if (userData.isRestrictionsIp) return
// state.notificationTimer && clearInterval(state.notificationTimer)
// state.bigRRemindTimer && clearInterval(state.bigRRemindTimer)
// state.riskControlTimer && clearInterval(state.riskControlTimer)
// userData.msgRemindingTimer && clearInterval(userData.msgRemindingTimer)
// if (isNeedBinding.value) return
// globalVBus.$on('globalLoading', (val) => {
//     loading.value = val
// })
// globalVBus.$on('memberDetailDialog', (val) => {
//     commonData.showMemberDetail(val)
// })
// getData()
// })

const getData = async () => {
    getAccountInfo()
    commonData.getFileType()
    userData.initGetTemplateConfig()
    await commonData.getMerchantSiteData()
    await userData.getSiteInfo()
    userData.isShowMsgRem && userData.getRemindingConfig('init')
    if (userData.userInfo.asGroup) {
        await getBigRRremindPopupList()
        isMerchant.value && await getNotificationPopupList()
        state.bigRRemindTimer = setInterval(() => {
            getBigRRremindPopupList()
        }, 120 * 1000)
        await getRiskControlPopupList()
        state.riskControlTimer = setInterval(() => {
            getRiskControlPopupList()
        }, 600 * 1000)
        // userData.userInfo.asSuper && await commonData.getRechargeStatus()
    }
    if (userData.isHasMenuPermiss('merchant.feedback.list')) {
        getComplaintRemindList()
        state.complaintRemindTimer = setInterval(() => {
            getComplaintRemindList()
        }, 600 * 1000)
    }
}

onBeforeUnmount(() => {
    state.notificationTimer && clearInterval(state.notificationTimer)
    state.bigRRemindTimer && clearInterval(state.bigRRemindTimer)
    state.riskControlTimer && clearInterval(state.riskControlTimer)
    state.complaintRemindTimer && clearInterval(state.complaintRemindTimer)
    userData.msgRemindingTimer && clearInterval(userData.msgRemindingTimer)
})

const reload = () => {
    const loadingInstance = ElLoading.service({ fullscreen: true })
    userData.getMenuList().then(() => {
        loadingInstance.close()
        userData.isShowMsgRem && userData.getRemindingConfig()
        if (!findPathInList(userData.menuList, route.path) && !EXTRA_PAGE_PATH.includes(route.path)) {
            let path = findFirstMenuPage(userData.menuList)
            // tagsData.clearTags()
            router.replace(path)
        } else {
            state.isRouterAlive = false
            nextTick(() => {
                if (NO_REFRESH_PATH.includes(route.path)) {
                    router.replace('/')
                } else {
                    // if (val) {
                    //     router.replace({ query: {} })
                    // } else {
                    router.replace({ query: { ...route.query } })
                    //     }
                }
                state.isRouterAlive = true
                setTimeout(() => {
                    commonData.isManual = false
                }, 100)
            })
        }
    }).catch(() => {
        loadingInstance.close()
    })
}

// 获取大R提醒弹窗数据
const getBigRRremindPopupList = async () => {
    if (!commonData.currentMerchantSite.id) return (state.bigRRemindTimer && clearInterval(state.bigRRemindTimer))
    try {
        let res = await getBigRRemindMassageList()
        let { data } = res
        if (!data || !data.length) {
            localStorage.removeItem('bigr_remind_popup_list')
        } else {
            let messageList = getBigRRemindPopupData()
            let accountId = userData.userInfo.id
            if (messageList.length && accountId !== messageList[0].accountId) {
                localStorage.removeItem('bigr_remind_popup_list')
                messageList = []
            }
            let arr = []
            let sameObj = {}
            data.forEach(item => {
                sameObj = messageList.find(its => item.userId === its.userId)
                if (sameObj && sameObj.userId) {
                    arr.push(sameObj)
                } else {
                    let { level_, userId, user = {} } = item
                    arr.push({
                        level_,
                        userId,
                        user,
                        accountId,
                        status: 0,
                        latestTime: ''
                    })
                }
            })
            localStorage.setItem('bigr_remind_popup_list', JSON.stringify(arr))
            state.currentRremindIndex = 0
            openBigRRemindPopup()
        }
    } catch (err) { }
}

// 打开提醒弹窗
const openBigRRemindPopup = () => {
    let popupList = getBigRRemindPopupData()
    if (!popupList[state.currentRremindIndex] || !popupList.length) return
    let { status, latestTime } = popupList[state.currentRremindIndex]
    let obj = popupList[state.currentRremindIndex]
    let nowTime = Date.now()
    let nowMerchantTime = new Date(dateFormat(nowTime)).getTime()
    let latestDate = new Date(dateFormat(nowTime, 'YYYY-MM-DD') + ' 23:59:59').getTime()
    if (status && nowMerchantTime <= latestTime) {
        state.currentRremindIndex++
        openBigRRemindPopup()
    } else {
        obj.latestTime = latestDate
        state.bigRRemindData = { ...obj }
        obj.status = 1
        localStorage.setItem('bigr_remind_popup_list', JSON.stringify(popupList))
        state.bigRRemindPopupShow = true
    }
}

// 获取本地大R提醒弹窗数据
const getBigRRemindPopupData = () => {
    return (localStorage.getItem('bigr_remind_popup_list') ? JSON.parse(localStorage.getItem('bigr_remind_popup_list')) : [])
}

// 获取通知弹窗数据
const getNotificationPopupList = async () => {
    try {
        let res = await getMerchantMessagePopup()
        let { data } = res
        if (!data || !data.length) {
            localStorage.removeItem('notification_popup_list')
        } else {
            let nowTime = Date.now()
            let list = data.filter(item => item.endTime >= nowTime)
            let messageList = getNotificationPopupData()
            let userId = userData.userInfo.id
            if (messageList.length && userId !== messageList[0].userId) {
                localStorage.removeItem('notification_popup_list')
                messageList = []
            }
            let arr = []
            let sameObj = {}
            list.forEach(item => {
                sameObj = messageList.find(its => item.msgId === its.msgId)
                if (sameObj && sameObj.msgId && item.updateTime === sameObj.updateTim) {
                    arr.push(sameObj)
                } else {
                    let { msgId, popUp, endTime, content, title, status, updateTime } = item
                    arr.push({
                        userId,
                        msgId,
                        popUp,
                        status,
                        endTime,
                        content,
                        title,
                        updateTime,
                        lastPopupTime: sameObj ? sameObj.lastPopupTime : '',
                        latestTime: sameObj ? sameObj.latestTime : '',
                        isRead: sameObj ? sameObj.isRead : false,
                    })
                }
            })
            localStorage.setItem('notification_popup_list', JSON.stringify(arr))
            state.currentNotificationIndex = 0
            openNotificationPopup()
            if (arr.some(item => item.popUp === 4)) {
                state.notificationTimer = setInterval(() => {
                    setTiming()
                }, 60 * 60 * 1000)
            }
        }
    } catch (err) { }
}

// 获取本地通知弹窗数据
const getNotificationPopupData = () => {
    let nowTime = new Date(dateFormat(Date.now())).getTime()
    let arr = localStorage.getItem('notification_popup_list') ? JSON.parse(localStorage.getItem('notification_popup_list')) : []
    return arr.filter(item => item.endTime >= nowTime)
}

// 定时打开需要通知的弹窗
const setTiming = () => {
    if (!state.notificationPopupShow) {
        state.currentNotificationIndex = 0
        openNotificationPopup()
    }
}

// 打开当前需要通知的弹窗
const openNotificationPopup = () => {
    let popupList = getNotificationPopupData()
    if (!popupList.length || (popupList.length && popupList.every(item => item.popUp !== 4))) {
        state.notificationTimer && clearInterval(state.notificationTimer)
    }
    if (!popupList[state.currentNotificationIndex] || !popupList.length) return
    let { msgId, popUp, endTime, lastPopupTime, latestTime } = popupList[state.currentNotificationIndex]
    let obj = popupList[state.currentNotificationIndex]
    let nowTime = Date.now()
    let nowMerchantTime = new Date(dateFormat(nowTime)).getTime()
    let latestDate = new Date(dateFormat(nowTime, 'YYYY-MM-DD') + ' 23:59:59').getTime()
    if (nowMerchantTime > endTime) {
        popupList = popupList.filter(item => item.msgId !== msgId)
        localStorage.setItem('notification_popup_list', JSON.stringify(popupList))
        openNotificationPopup()
        return
    }
    if (lastPopupTime) {
        if ((popUp === 2 && nowMerchantTime > latestTime) || (popUp === 4 && (lastPopupTime + 60 * 60 * 1000) <= nowMerchantTime)) {
            obj.lastPopupTime = nowMerchantTime
            obj.latestTime = latestDate
            state.notificationData = { ...obj }
            obj.isRead = true
            obj.status = 1
            localStorage.setItem('notification_popup_list', JSON.stringify(popupList))
            state.notificationPopupShow = true
        } else {
            state.currentNotificationIndex++
            openNotificationPopup()
        }
    } else if (!obj.isRead) {
        obj.lastPopupTime = nowMerchantTime
        obj.latestTime = latestDate
        state.notificationData = { ...obj }
        obj.status = 1
        obj.isRead = true
        localStorage.setItem('notification_popup_list', JSON.stringify(popupList))
        state.notificationPopupShow = true
    }
}

// 打开下一个弹窗
const showNext = (key, type) => {
    nextTick(() => {
        state[key]++
        let api = !type ? openBigRRemindPopup : openNotificationPopup
        api()
    })
}

// 通知消息已读
const postReaded = () => {
    getMerchantMessageInfo({ msgId: state.notificationData.msgId }).then(() => {
        userData.getMerchantMessage()
    }).catch(() => { })
}

// 获取风控提醒弹窗数据
const getRiskControlPopupList = async () => {
    if (!commonData.currentMerchantSite.id) return (state.riskControlTimer && clearInterval(state.riskControlTimer))
    try {
        let res = await getRiskControlRemindData()
        let { data } = res
        if (!data || !data.prompt) {
            localStorage.removeItem('risk_control_popup_data')
        } else {
            let accountId = userData.userInfo.id
            let obj = localStorage.getItem('risk_control_popup_data') ? JSON.parse(localStorage.getItem('risk_control_popup_data')) : {}
            if (accountId !== obj.accountId) {
                localStorage.removeItem('risk_control_popup_data')
                obj = {}
            }
            state.riskControlData = obj.riskStatus !== data.riskStatus ? data : obj
            let { riskStatus, lastPopupTime } = state.riskControlData
            // riskStatus：-2=禁止游戏；-1=后台限制；0=预警状态；1=站点余额不足
            if ((riskStatus === 1 || riskStatus === 0) && state.riskControlData.accountId === accountId) return
            if (riskStatus === -2 || riskStatus === -1) {
                let nowMerchantTime = new Date(dateFormat(Date.now())).getTime()
                let intervalTime = riskStatus === -1 ? 1810 * 1000 : 610 * 1000
                if (lastPopupTime && ((lastPopupTime + intervalTime) > nowMerchantTime)) return
                state.riskControlData.lastPopupTime = nowMerchantTime
            }
            state.riskControlData.accountId = accountId
            localStorage.setItem('risk_control_popup_data', JSON.stringify(state.riskControlData))
            state.riskControlPopupShow = true
        }
    } catch (err) { }
}

// 获取投诉提醒弹窗数据
const getComplaintRemindList = async () => {
    if (!commonData.currentMerchantSite.id) return (state.complaintRemindTimer && clearInterval(state.complaintRemindTimer))
    try {
        let { data } = await getComplaintRemindData()
        if (data) {
            state.complaintRemindData = data || ''
            state.complaintRemindShow = true
        }
    } catch (err) { }
}

const getAccountInfo = () => {
    getAccountData({ id: userData.userInfo.id, merchantId: userData.userInfo.merchantId }).then(res => {
        userData.userInfo = Object.assign(userData.userInfo, res.data);
        localStorage.setItem('user_info', JSON.stringify(userData.userInfo))
    })
}
</script>

<style lang="scss">
.content-box {
    // .content {
    //     // width: auto;
    //     min-width: 800px;
    //     height: calc(100% - 30px);
    //     box-sizing: border-box;
    //     background-color: #fff;
    //     .page-container {
    //         width: 100%;
    //         height: 100%;
    //         padding: 20px 20px 30px;
    //         border: 20px solid #f0f0f0;
    //         border-radius: 6px;
    //         overflow: auto;
    //         box-sizing: border-box;
    //     }
    // }
    .content {
        width: auto;
        height: calc(100% - 30px);
        box-sizing: border-box;
        // background-color: #fff;
        // border-radius: 6px;
        // padding: 20px 20px 30px;
        overflow: auto;
        border: 20px solid #f5f5f9;
        background-color: #fff;
        display: flex;
        .page-container {
            flex: 1;
            flex-shrink: 0;
            // width: 100%;
            height: 100%;
            min-width: 1000px;
        }
    }
}
.page-loading {
    z-index: 9999;
    width: 100vw;
    height: 100%;
}
</style>
