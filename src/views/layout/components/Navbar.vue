<template>
    <!-- 顶部 -->
    <div class="header">
        <div class="timeZone" v-if="currentTime">
            <span class="currentTime">{{ currentTime }}</span>
            <span class="utc">( UTC {{userData.merchantInfo.timeZone}} )</span>
        </div>
        <div class="site-info" v-if="Object.keys(userData.merchantInfo).length">
            <el-button class="site-info-item" v-if="isShowRc" v-throttle type="primary" @click="handleGo('/merchant-center/merchant-recharge')">
                {{$t('充值U')}}</el-button>
            <div class="site-info-item currency-info" v-if="userData.merchantInfo.country === 'VN'">
                <span>{{$t('货币比例1=1000')}}</span>
                <span>{{$t('数值1=1000越南盾')}}</span>
            </div>
        </div>
        <div class="header-right">
            <div class="header-user-con">
                <!-- 消息中心 -->
                <div class="btn-bell pr" v-if="userData.menuList.length">
                    <el-popconfirm :teleported="false" :title="$t('开启相关配置后，站点会接收到系统推送的语音消息提醒，请确认接收！')" width="200px" :icon="WarningFilled"
                        icon-color="#f90" :confirm-button-text="$t('确认')" :visible="userData.isShowAcceptConfirm" @confirm="handleConfirm"
                        @cancel="handleConfirm">
                        <template #reference>
                            <el-button class="popconfirm-box pa"></el-button>
                        </template>
                    </el-popconfirm>
                    <!-- 通知 -->
                    <el-dropdown v-if="userData.isShowMsgRem" class="small-box" @command="handleMsgReminding">
                        <div class="pr tips" style="margin-top: 3px" @click="handleConfig">
                            <img src="../../../assets/img/common/message_reminding.png" alt="">
                            <div class="pa prohibit" v-if="!isCanPlayAudio && userData.hasMsgRemConfig"></div>
                            <span v-if="userData.msgRemNum" class="pa tips-num" style="top: -10px;right: -10px">{{userData.msgRemNum}}</span>
                        </div>

                        <template #dropdown>
                            <el-dropdown-menu size="small">
                                <el-dropdown-item v-for="(item,index) in MSG_REMINDING_PATH_PERMISS" :key="index"
                                    :command="item.value + '=' + item.path" :divided="!!index">
                                    {{item.label}}：{{userData.getMsgRemType(item.value)?.count || 0}}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <el-dropdown class="small-box" @command="handleGo">
                        <div class="pr tips" style="margin-top: 3px">
                            <el-icon color="#409eff" :size="26">
                                <!-- <BellFilled /> -->
                                <Avatar />
                            </el-icon>
                            <div class="title">{{$t('在线：')}}{{onlineData.total}}</div>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu size="small">
                                <el-dropdown-item v-for="(item,index) in onlineKeyData" :command="'/user-manage/all-member?flagTab=' + item.id"
                                    :key="index">
                                    {{item.title}}{{onlineData[item.key] || 0}}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <div class="small-box" @click="handleGo('/operating-center/platform-announcement')" v-if="isShowMerchantMsg && !userData.userInfo.limitMerInfo">
                        <el-tooltip effect="dark" :content="$t('有') + userData.merchantMessageNum + $t('条未读消息')" placement="bottom">
                            <div class="pr tips" style="margin-top: 3px">
                                <el-icon color="#409eff" :size="26">
                                    <BellFilled />
                                </el-icon>
                                <div class="title">{{$t('商户消息')}}</div>
                                <span class="pa tips-num" v-if="userData.merchantMessageNum">{{userData.merchantMessageNum}}</span>
                            </div>
                        </el-tooltip>
                    </div>
                    <div class="small-box">
                        <el-select v-model="locale" @change="changeLocale" placeholder="Select" size="small" style="width: 74px">
                            <el-option v-for="item in LANGLIST" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </div>
                </div>
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <div class="site-main">
                        <div class="el-dropdown-link">{{$t('当前账号')}}</div>
                        <div class="el-dropdown-link">
                            {{ userData.userInfo.username }}
                            <el-icon class="el-icon--right">
                                <arrow-down />
                            </el-icon>
                        </div>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="editPassword">{{$t('修改密码')}}</el-dropdown-item>
                            <el-dropdown-item divided command="loginout">{{$t('退出登录')}}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <div class="site-main" v-if="commonData.merchantSiteList.length > 1" @click="siteCutShow = true">
                    <div class="el-dropdown-link">{{$t('当前站点')}}</div>
                    <div class="el-dropdown-link">
                        {{ commonData.currentMerchantSite.name }}（ID：{{ commonData.currentMerchantSite.id }}）
                        <el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </div>
                </div>
            </div>
        </div>
        <EditPassword v-if="editPasswordShow" @close="editPasswordShow = false" @handleLogout="handleLogout(1)"></EditPassword>
        <SiteCut v-if="siteCutShow" @close="siteCutShow = false" @handleSite="handleSite"></SiteCut>
        <MessageRemindingDeploy v-if="msgRemDeployShow" @close="msgRemDeployShow = false"></MessageRemindingDeploy>
    </div>
</template>

<script setup>
import { ref, defineAsyncComponent, onMounted, computed, onBeforeUnmount, defineEmits, watch } from 'vue'
import useSidebarStore from '@/store/sidebar' // 保留兼容
import userStore from '@/store/user'
import commonStore from '@/store/common'
import tagsStore from '@/store/tags'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { getLastActiveCount } from '@/api/common'
import { dateFormat, playOrderReminder } from '@/common/util'
import { NO_REFRESH_PATH, MSG_REMINDING_PATH_PERMISS, LANGLIST } from '@/common/util/appConfig'
import { getRedDotTip } from '@/api/member'
import i18n from '@/i18n'
const EditPassword = defineAsyncComponent(() => import('./EditPassword.vue'))
const SiteCut = defineAsyncComponent(() => import('./SiteCut.vue'))
const MessageRemindingDeploy = defineAsyncComponent(() => import('./MessageRemindingDeploy.vue'))

const emits = defineEmits(['reload'])
const onlineKeyData = [
    { key: 'hall', title: $t('大厅在线：'), id: 90 },
    { key: 'game', title: $t('游戏在线：'), id: 91 },
]
const editPasswordShow = ref(false)
const siteCutShow = ref(false)
const msgRemDeployShow = ref(false)
const messageData = ref({
    withdrawalAudit: 0,
    riskControlAudit: 0,
    activityApplicationAudit: 0,
});
const onlineData = ref({
    total: 0,
    hall: 0,
    game: 0,
});
const router = useRouter()
const route = useRoute()
const sidebar = useSidebarStore() // 保留兼容
const userData = userStore()
const commonData = commonStore()
const tagsData = tagsStore()
const timer = ref(null)
const onlineTimer = ref(null)
const currentTime = ref()
const localStorageListener = ref(null)
const pageVisibleListener = ref(null)
const locale = ref(i18n.global.locale)
const showRedDotTip = ref(false)

const messageNum = computed(() => {
    return Object.values(messageData.value).reduce((pre, item) => { return pre + item }, 0)
})
const isShowRc = computed(() => {
    return userData.isHasMenuPermiss('merchant.merchant-recharge.products')
})
const isMerchantInfo = computed(() => {
    return userData.isHasMenuPermiss('admin.merchant.info')
})
const isShowMerchantMsg = computed(() => {
    return userData.isHasMenuPermiss('admin.merchant-msg.list') && userData.userInfo.asGroup
})
const isCanPlayAudio = computed(() => {
    let { msg, profit, cash } = userData.msgRemindingConfig
    return (!!msg || !!profit || !!cash) && !userData.isShowAcceptConfirm
})

watch(
    () => commonData.currentMerchantSite.id,
    (val, oldVal) => {
        if (val && oldVal && val !== oldVal && !commonData.isManual) {
            handleSite()
        }
    }
)

onMounted(async () => {
    onlineTimer.value && clearInterval(onlineTimer.value)
    timer.value && clearInterval(timer.value)
    if (document.body.clientWidth < 1500) {
        collapseChage()
    }
    getOnlineNumber()
    getRedDotTips()
    userData.getMerchantPayConfigFn()
    onlineTimer.value = setInterval(() => {
        getOnlineNumber()
    }, 60000)
    if (isShowMerchantMsg.value) userData.getMerchantMessage()
    localStorageListener.value = window.addEventListener('storage', ({ key, newValue }) => {
        if (key === 'token' && !newValue) {
            handleLogout(-1)
            return
        }
        if (key === 'current_merchant_site' && newValue) {
            let obj = JSON.parse(newValue) || {}
            if (obj.id && obj.id !== commonData.currentMerchantSite.id && commonData.currentMerchantSite.id) {
                handleSite(obj.id)
            }
        }
    })
    await userData.getMerchantDetail()
    getCurrentTime()
    pageVisibleListener.value = document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            getCurrentTime()
        } else if (document.visibilityState === 'hidden') {
            timer.value && clearInterval(timer.value)
        }
    })
})

onBeforeUnmount(() => {
    onlineTimer.value && clearInterval(onlineTimer.value)
    timer.value && clearInterval(timer.value)
    window.removeEventListener('storage', localStorageListener.value)
    window.removeEventListener('visibilitychange', pageVisibleListener.value)
})

const changeLocale = (() => {
    tagsData.clearTags()
    localStorage.setItem('locale', locale.value)
    location.reload()
})

// 获取商户当地时间
const getCurrentTime = () => {
    if (timer.value) clearInterval(timer.value)
    timer.value = setInterval(() => {
        currentTime.value = dateFormat(Date.now(), 'MM/DD hh:ii:ss')
    }, 1000)
}

// 获取在线人数
const getOnlineNumber = () => {
    if (!commonData.currentMerchantSite.id) return (onlineTimer.value && clearInterval(onlineTimer.value))
    getLastActiveCount().then(res => {
        onlineData.value = { ...res.data }
    }).catch(err => { })
}

// 侧边栏折叠
const collapseChage = () => {
    sidebar.handleCollapse()
}

// 站点切换
const handleSite = async (val) => {
    if (commonData.currentMerchantSite.id === val) return
    let siteListJson = localStorage.getItem('merchant_site_list')
    if (siteListJson && siteListJson !== JSON.stringify(commonData.merchantSiteList)) {
        await commonData.getMerchantSiteData()
    }
    if (val) {
        commonData.currentMerchantSite = commonData.merchantSiteList.find(item => item.id === val) || {}
        localStorage.setItem('current_merchant_site', JSON.stringify(commonData.currentMerchantSite))
        // const curItem = tagsData.list.filter(item => {
        //     return item.fullPath === route.fullPath
        // });
        // if (NO_REFRESH_PATH.includes(route.path)) {
        //     tagsData.clearTags()
        // } else {
        //     tagsData.closeTagsOther(curItem)
        // }
    }
    const curItem = tagsData.list.filter(item => {
        return item.fullPath === route.fullPath
    })
    tagsData.closeTagsOther(curItem)
    // tagsData.resetTags(route.path)
    userData.msgRemindingTimer && clearInterval(userData.msgRemindingTimer)
    userData.msgRemindingConfig = {}
    userData.msgRemindingData = []
    emits('reload', val)
    userData.getSiteInfo()
    userData.initGetTemplateConfig()
    userData.getMerchantPayConfigFn()
    clearInterval(onlineTimer.value)
    getRedDotTips()
    getOnlineNumber()
    onlineTimer.value = setInterval(() => {
        getOnlineNumber()
    }, 60000)
};

// 用户名下拉菜单选择事件
const handleCommand = (command) => {
    if (command == 'loginout') {
        ElMessageBox.confirm($t('确定退出登录状态吗？'), $t('提示'), {
            type: 'warning'
        }).then(() => {
            handleLogout(0)
        }).catch(() => { })
    } else if (command == 'editPassword') {
        editPasswordShow.value = true
    }
};

// 登出
const handleLogout = (type) => {
    userStore().logout(type).then(() => {
        tagsStore().clearTags()
        commonData.resetCommonData()
        router.replace('/login')
    })
}

// 通知下拉菜单选择事件
const handleMsgReminding = (command) => {
    let arr = command.split('=')
    if (arr[1] === route.path) return userData.postRemindingRead(+arr[0])
    router.push(arr[1])
}

const handleGo = (url) => {
    if (url.indexOf(route.path) > -1) return
    if (url.indexOf('/user-manage/all-member') > -1 && !userData.isHasMenuPermiss('admin.user.list')) return
    if (url.indexOf('/merchant-center/merchant-info') > -1 && !isMerchantInfo.value) return
    router.push(url)
}
const handleVipLimitingGame = () => {
    router.replace({
        path: '/user-manage/vip-limiting-game'
    })
}

const handleConfig = () => {
    if (!userData.hasMsgRemConfig) return
    msgRemDeployShow.value = true
}

const handleConfirm = () => {
    playOrderReminder(true)
    userData.isShowAcceptConfirm = false
}
const getRedDotTips = () => {
    if(!userData.isHasMenuPermiss('merchant.vip-balance-ctrl.levelLimitList')) return
    getRedDotTip().then(res => {
        showRedDotTip.value = res.data === 1 ? true : false
    }).catch(err => { })
}
</script>
<style scoped lang="scss">
.header {
    position: relative;
    box-sizing: border-box;
    width: 100vw;
    height: 70px;
    font-size: 22px;
    color: var(--app-header-text, #fff7e6);
    background-color: var(--app-header-bg, #1a0f05);
    display: flex;
}

.header .logo {
    display: flex;
    align-items: center;
    padding: 0 20px;
    white-space: nowrap;
    color: var(--app-header-logo-text, #f59e0b);
    font-weight: bold;
}

.header-right {
    flex-shrink: 0;
    margin-left: auto;
    padding-right: 50px;
}

.header-user-con {
    display: flex;
    height: 70px;
    align-items: center;
}

.btn-fullscreen {
    transform: rotate(45deg);
    margin-right: 5px;
    font-size: 24px;
}

.btn-bell {
    flex-shrink: 0;
    height: 50px;
    text-align: center;
    border-radius: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 20px;

    ::v-deep(.el-popconfirm) .el-popconfirm__action .el-button:nth-child(1) {
        display: none !important;
    }

    .popconfirm-box {
        width: 0;
        opacity: 0;
    }

    .small-box {
        cursor: pointer;

        .tips {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;

            img {
                width: 30px;
            }

            .prohibit {
                left: -2px;
                top: 13px;
                width: 35px;
                height: 3px;
                border-radius: 2px;
                background: #f59e0b;
                transform: rotate(45deg);
                box-shadow: 0 3px var(--app-header-bg, #1a0f05);
            }
        }

        .title {
            font-size: 12px;
            color: #f59e0b;
            line-height: 16px;
            transform: scale(0.9);
        }

        .tips-num {
            top: -5px;
            right: -5px;
            width: 20px;
            height: 20px;
            line-height: 20px;
            color: #fff;
            font-size: 10px;
            text-align: center;
            border-radius: 50%;
            background-color: #f56c6c;
        }
    }
    .small-box + .small-box {
        margin-left: 15px;
    }
}

.btn-bell-badge {
    position: absolute;
    right: 4px;
    top: 0px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: #f56c6c;
    color: #fff;
}

.user-avator {
    margin-left: 20px;
}

.site-main {
    flex-shrink: 0;
    font-size: 14px;
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .el-dropdown-link {
        line-height: 20px;
    }
}

.el-dropdown-link {
    color: var(--app-header-text, #fff7e6);
    cursor: pointer;
    display: flex;
    align-items: center;
}

.el-dropdown-menu__item {
    text-align: center;
}

.timeZone {
    flex-shrink: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    span {
        font-size: 14px;
    }
}

.site-info {
    flex-shrink: 0;
    float: left;
    width: fit-content;
    height: 100%;
    display: flex;
    font-size: 14px;
    font-weight: normal;
    align-items: center;

    &-item {
        margin-left: 30px;
    }
    &-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        .status-box {
            width: 100px;
            height: 20px;
        }
        .status-title {
            white-space: nowrap;
            line-height: 20px;
        }
    }
    &-amount {
        display: flex;
        flex-direction: column;
        align-items: center;
        span {
            white-space: nowrap;
            line-height: 20px;
        }
    }
    .currency-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #fbbf24;
    }
}

.limitin-w {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: 5px;
    margin-left: 10px;
    position: relative;

    .limiting-icon {
        width: 23px;
        height: 23px;
        margin-right: 5px;
        margin-bottom: 2px;
        img {
            width: 100%;
            height: 100%;
        }
    }

    .limiting-title {
        font-size: 12px;
        color: #f59e0b;
        line-height: 16px;
        transform: scale(0.9);
    }

    .tips-num {
        top: 0px;
        right: 3px;
        width: 10px;
        height: 10px;
        line-height: 20px;
        color: #fff;
        font-size: 10px;
        text-align: center;
        border-radius: 50%;
        background-color: #f56c6c;
    }
}
</style>
