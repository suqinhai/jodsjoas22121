<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗 -->
    <div class="activity-deploy">
        <Dialog ref="dialogRef" top="2vh" :width="dialogWidth" :title="itemData.type_ +  (![9, 26].includes(itemData.type) ? $t(' 活动') : '') + title"
            @confirm="handleConfirm(2)" @cancel="handleConfirm(0)" @close="emits('close')" :isCancel="isCancel" :operateActions="operateActions"
            :otherActions="otherActions" @otherEvent="handleConfirm(1)" :isShowSubmit="itemData.operationType !== 2" :styleCustom="{'flex-direction': 'row'}">
            <div class="pr" style="flex: 1;">
                <div class="issue pa" :style="{'right': !isShowContentEdit ? '10px' : '-360px'}" v-if="[1,2,4,5,6,7,8,9,10,12,13,3,27,28].includes(state.currentActivityType) && userData.getTemplateType() !== 4">
                    <el-icon class="pointer" :size="24" @click="state.showExplain = true">
                        <QuestionFilled />
                    </el-icon>
                </div>
                <div class="issue pa" :style="{'right': !isShowContentEdit ? '10px' : '-360px'}" v-if="[1,2,4,5,6,7,8,9,10,12,13,3,21,22,23,24,25,26,27,28].includes(state.currentActivityType) && userData.getTemplateType() === 4">

                    <el-icon class="pointer" :size="24" @click="state.showExplain = true">
                        <QuestionFilled />
                    </el-icon>
                </div>

                <!-- <RechargeActivityDeploy v-if="state.currentActivityType === 1" ref="deployRef" :deployData="state.deployData" :isDisabled="isDisabled"
                    :disabledDate="disabledDate">
                </RechargeActivityDeploy>
                <BetActivityDeploy v-if="state.currentActivityType === 2" ref="deployRef" :deployData="state.deployData" :isDisabled="isDisabled"
                    :disabledDate="disabledDate">
                </BetActivityDeploy>
                <SignActivityDeploy v-if="state.currentActivityType === 3" ref="deployRef" :deployData="state.deployData" :isDisabled="isDisabled"
                    :disabledDate="disabledDate">
                </SignActivityDeploy>
                <RescueActivityDeploy v-if="state.currentActivityType === 4" ref="deployRef" :deployData="state.deployData" :isDisabled="isDisabled"
                    :disabledDate="disabledDate">
                </RescueActivityDeploy>
                <LuckyTurntableDeploy v-if="state.currentActivityType === 5" ref="deployRef" :deployData="state.deployData" :isDisabled="isDisabled"
                    :disabledDate="disabledDate">
                </LuckyTurntableDeploy>
                <RedPacketActivityDeploy v-if="state.currentActivityType === 6" ref="deployRef" :deployData="state.deployData"
                    :isDisabled="isDisabled" :disabledDate="disabledDate">
                </RedPacketActivityDeploy>
                <PopularizeActivityDeploy v-if="state.currentActivityType === 7" ref="deployRef" :deployData="state.deployData"
                    :isDisabled="isDisabled" :disabledDate="disabledDate">
                </PopularizeActivityDeploy>
                <HandselActivityDeploy v-if="state.currentActivityType === 8" ref="deployRef" :deployData="state.deployData" :isDisabled="isDisabled"
                    :disabledDate="disabledDate">
                </HandselActivityDeploy>
                <CustomActivityDeploy v-if="state.currentActivityType === 9" ref="deployRef" :deployData="state.deployData" :isDisabled="isDisabled"
                    :disabledDate="disabledDate">
                </CustomActivityDeploy>
                <CompleteLevelsActivityDeploy v-if="state.currentActivityType === 10" ref="deployRef" :deployData="state.deployData"
                    :isDisabled="isDisabled" :disabledDate="disabledDate">
                </CompleteLevelsActivityDeploy>
                <BalanceRescueActivityDeploy v-if="state.currentActivityType === 12" ref="deployRef" :deployData="state.deployData"
                    :isDisabled="isDisabled" :disabledDate="disabledDate">
                </BalanceRescueActivityDeploy>
                <RankingActivityDeploy v-if="state.currentActivityType === 13" ref="deployRef" :deployData="state.deployData" :isDisabled="isDisabled"
                    :disabledDate="disabledDate">
                </RankingActivityDeploy>
                <RedeemCodeActivityDeploy v-if="state.currentActivityType === 21" ref="deployRef" :deployData="state.deployData"
                    :isDisabled="isDisabled" :disabledDate="disabledDate">
                </RedeemCodeActivityDeploy>
                <RegisterActivityDeploy v-if="state.currentActivityType === 22" ref="deployRef" :deployData="state.deployData"
                    :isDisabled="isDisabled" :disabledDate="disabledDate">
                </RegisterActivityDeploy>
                <LuckyRedPacketActivityDeploy v-if="state.currentActivityType === 23" ref="deployRef" :deployData="state.deployData"
                    :isDisabled="isDisabled" :disabledDate="disabledDate">
                </LuckyRedPacketActivityDeploy> -->
                <component v-if="!!state.currentActivityType" :is="activityComponent" ref="deployRef" :deployData="state.deployData"
                    :isDisabled="isDisabled" :disabledDate="disabledDate" @updateContentEdit="updateContentEdit" :dialogWidth="dialogWidth">
                </component>
            </div>
            <div class="w370" v-if="isShowContentEdit">
                <ContentEdit :itemData="{...contentEdit}" ref="contentEditRef"></ContentEdit>
            </div>

            
        </Dialog>

        <ProbabilityDeployialog v-if="state.showProbabilityDeploy" :probabilityData="state.probabilityData"
            @close="state.showProbabilityDeploy = false" @save="save">
        </ProbabilityDeployialog>
        <ExplainDialog v-if="state.showExplain" :activityType="state.currentActivityType" :title="itemData.type_" @close="state.showExplain = false">
        </ExplainDialog>
    </div>
</template>

<script setup>
import { defineAsyncComponent, reactive, ref, shallowRef, computed, onMounted, provide, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { deepClone, dateFormat, getTimeZoneOffset } from "@/common/util/index"
import { promotionEditApi, promotionAddApi } from "@/api/discounts_center.js"

// const RechargeActivityDeploy = defineAsyncComponent(() => import("./RechargeActivityDeploy.vue"))
// const BetActivityDeploy = defineAsyncComponent(() => import("./BetActivityDeploy.vue"))
// const SignActivityDeploy = defineAsyncComponent(() => import("./SignActivityDeploy.vue"))
// const RescueActivityDeploy = defineAsyncComponent(() => import("./RescueActivityDeploy.vue"))
// const LuckyTurntableDeploy = defineAsyncComponent(() => import("./LuckyTurntableDeploy.vue"))
// const RedPacketActivityDeploy = defineAsyncComponent(() => import("./RedPacketActivityDeploy.vue"))
// const PopularizeActivityDeploy = defineAsyncComponent(() => import("./PopularizeActivityDeploy.vue"))
// const HandselActivityDeploy = defineAsyncComponent(() => import("./HandselActivityDeploy.vue"))
// const CustomActivityDeploy = defineAsyncComponent(() => import("./CustomActivityDeploy.vue"))
// const CompleteLevelsActivityDeploy = defineAsyncComponent(() => import("./CompleteLevelsActivityDeploy.vue"))
// const BalanceRescueActivityDeploy = defineAsyncComponent(() => import("./BalanceRescueActivityDeploy.vue"))
// const RankingActivityDeploy = defineAsyncComponent(() => import("./RankingActivityDeploy.vue"))
// const RedeemCodeActivityDeploy = defineAsyncComponent(() => import("./RedeemCodeActivityDeploy.vue"))
// const RegisterActivityDeploy = defineAsyncComponent(() => import("./RegisterActivityDeploy.vue"))
// const LuckyRedPacketActivityDeploy = defineAsyncComponent(() => import("./LuckyRedPacketActivityDeploy.vue"))

// const PriceDownDwploy = defineAsyncComponent(() => import("./PriceDownDwploy.vue"))
const ProbabilityDeployialog = defineAsyncComponent(() => import("./ProbabilityDeployialog.vue"))
const ExplainDialog = defineAsyncComponent(() => import("./ExplainDialog.vue"))
const ContentEdit = defineAsyncComponent(() => import("@/views/operating_center/operation_risk_set/components/contentEdit.vue"));

const activityNameList = {
    1: 'RechargeActivityDeploy',
    2: 'BetActivityDeploy',
    3: 'SignActivityDeploy',
    4: 'RescueActivityDeploy',
    5: 'LuckyTurntableDeploy',
    6: 'RedPacketActivityDeploy',
    7: 'PopularizeActivityDeploy',
    8: 'HandselActivityDeploy',
    9: 'CustomActivityDeploy',
    10: 'CompleteLevelsActivityDeploy',
    12: 'BalanceRescueActivityDeploy',
    13: 'RankingActivityDeploy',
    21: 'RedeemCodeActivityDeploy',
    22: 'RegisterActivityDeploy',
    23: 'LuckyRedPacketActivityDeploy',
    24: 'DownloadAppActivityDeploy',
    25: 'LoginActivityDeploy',
    26: 'MilestoneActivityDeploy',
    27: 'PriceDownDwploy',
    28: 'pinduoduoDeploy'
}
const emits = defineEmits(['fetchData', 'close', 'previewPicture'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        },
    },
    keyDatas: {
        type: Array,
        default: () => {
            return []
        },
    },

    itemData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const state = reactive({
    currentActivityType: '',
    deployData: {},
    probabilityData: {},
    submitType: '',
    showProbabilityDeploy: false,
    showExplain: false,
})
const modules = import.meta.glob('@/views/operating_center/activity_center/discounts_activity/deploy_dialog/*.vue');
const activityComponent = shallowRef(null)
const dialogRef = ref(null)
const deployRef = ref(null)
const timeZoneOffset = getTimeZoneOffset()
const userData = userStore()
const contentEditRef = ref(null)
// const commonData = commonStore()

// 是否可编辑内容
const isDisabled = computed(() => {
    return props.itemData.status !== 1 && props.itemData.status !== 2 && props.itemData.operationType === 1
})
// 是否显示左边风险控制
const isShowContentEdit = computed(() => {
    return !((props.itemData.merchant.custom && [1,9,21,23].includes(state.currentActivityType)) || 
    (!props.itemData.merchant.custom && [9,12,28].includes(state.currentActivityType)))
})

// 弹窗宽度
const dialogWidth = computed(() => {
    // 活动类型type: 1: 充值活动; 2: 打码活动; 3: 签到活动; 4: 救援金活动; 5: 幸运转盘; 6: 红包活动; 7: 推广活动; 8: 新人彩金活动; 9: 自定义活动;
    //  10: 闯关邀请活动; 12: 余额救援金活动; 13: 排行榜活动; 21: 兑换码; 22: 注册; 23: 幸运红包抽奖; 24: 下载APP; 25: 登录奖励;
    let width = 1200
    switch (props.itemData.type) {
        case 8:
        case 22:
            width = 1000
            break
        case 2:
        case 6:
            width = 1100
            break
        case 7:
        case 10:
            width = 1400
            break
        case 3:
            width = $locale === 'zh' ? 1500 : 1650
            if (isCustomize.value) width -= 200
            break
        case 4:
            width = $locale === 'zh' ? 1230 : 1120
            break
        case 1:
            width = $locale === 'zh' ? 1320 : 1270
            break
        case 13:
            width = $locale === 'zh' ? 1290 : 1180
            break
        case 21:
            width = $locale === 'zh' ? 1010 : 1100
            break
        case 23:
            width = $locale === 'zh' ? 1050 : 1100
            break

    }
    return isShowContentEdit.value ? width + 370 : width
})
// 弹窗类型
const title = computed(() => {
    let { operationType } = props.itemData
    return !operationType ? $t(' 新增') : operationType === 1 ? $t(' 修改') : $t(' 详情')
})
// 判断按钮是否为取消
const isCancel = computed(() => {
    let { operationType, status } = props.itemData
    return operationType === 2 || (operationType === 1 && status === 3)
})
// 弹窗其他按钮
const otherActions = computed(() => {
    let { operationType, status } = props.itemData
    return !operationType || (operationType === 1 && status === 1) ? [$t('保存草稿')] : []
})
// 弹窗常规按钮
const operateActions = computed(() => {
    let arr = []
    let { status, operationType } = props.itemData
    if (operationType === 2) {
        arr = [$t('关闭')]
    } else {
        if (status === 3) {
            arr = [$t('关闭'), $t('提交')]
        } else {
            arr = [$t('立即开始'), $t('发布')]
        }
    }
    return arr
})
// 活动站点是否为定制版皮肤模版
const isCustomize = computed(() => {
    return props.itemData.merchant.custom || false
    // return ((!id || id === -1) && custom) || (id > 0 && merchant.custom)
    // return ((!id || id === -1) && commonData.currentMerchantSite.custom) || (id > 0 && merchant.custom)
})
const country = computed(() => {
    return userData.merchantInfo.country || ''
})

const contentEdit = computed(() => {
    let val = state.currentActivityType
    let promotionCond = state.deployData.promotionCond ? state.deployData.promotionCond : 1
    let condition = val === 1 ? (val + ',' + promotionCond) : val
    return {
        type: 0,
        condition,
        merchantId: props.itemData.merchantId,
        isCustomTemplate: props.itemData.merchant.custom
    }
})

onMounted(async () => {
    // 活动类型type: 1: 充值活动; 2: 打码活动; 3: 签到活动; 4: 救援金活动; 5: 幸运转盘; 6: 红包活动; 7: 推广活动; 8: 新人彩金活动; 9: 自定义活动;
    //  10: 闯关邀请活动; 12: 余额救援金活动; 13: 排行榜活动; 21: 兑换码; 22: 注册; 23: 幸运红包抽奖; 24: 下载APP; 25: 登录奖励;
    state.deployData = deepClone(props.itemData)
    let { userLevel, memberLevel, merchantVendorList, tagList} = props.metaData
    let { auditVendors_ = [], levels = '', playVendors_ = [], fixLayers, type, playGames_ = [], attachConfig } = state.deployData
    if (state.deployData.id) {
        if (levels) {
            state.deployData.levelList = levels ? levels.split(",").filter(item => userLevel.some(its => its.value === item)) : []
            const checkLevelCount = state.deployData.levelList.length
            state.deployData.isCheckedAllLevel = checkLevelCount === userLevel.length
            state.deployData.isIndeterminateLevel = checkLevelCount > 0 && checkLevelCount < userLevel.length
        }
        if (fixLayers) {
            state.deployData.fixLayerList = []
            fixLayers.split(",").forEach((item) => {
                if (memberLevel.some(its => its.id === +item)) state.deployData.fixLayerList.push(+item)
            })
        }
        if (attachConfig && attachConfig.tags) {
            state.deployData.attachConfig.tags = attachConfig.tags.filter(item => tagList.some(its => +its.value === +item))
        }
    } else {
        if(!props.itemData.merchant.custom && type == 9) {
            state.deployData.levelList = userLevel.map(item => item.value)
            state.deployData.isCheckedAllLevel = true
            state.deployData.isIndeterminateLevel = false
        }
        if(props.itemData.merchant.custom && [1, 4, 9].includes(type)) {
            state.deployData.levelList = userLevel.map(item => item.value)
            state.deployData.isCheckedAllLevel = true
            state.deployData.isIndeterminateLevel = false
            if(type === 1) {
                state.deployData.fixLayerList = memberLevel.filter(item => !item.type).map(item => item.id)
                state.deployData.isCheckedAllLayer = true
                state.deployData.isIndeterminateLayer = false
            }
        }
    }
    if (type === 13 && state.deployData.id && state.deployData.id !== -1 && state.deployData.fixLayerList&& state.deployData.fixLayerList.length) state.deployData.initMemberLevel = [...state.deployData.fixLayerList]
    delete state.deployData.levels
    delete state.deployData.fixLayers
    if (type !== 9) {
        let keyData = [{ key: 'auditVendorList', value: 'auditVendors_' }]
        // state.deployData.auditVendors = auditVendors ? JSON.parse(auditVendors) : []
        state.deployData.auditVendorList = []
        state.deployData.auditVendor = auditVendors_.length ? 2 : 1
        if ([2, 4, 5, 7, 12].includes(type)) {
            state.deployData.playVendorList = []
            state.deployData.vendor = playVendors_.length ? 2 : 1
            keyData.push({ key: 'playVendorList', value: 'playVendors_' })
        }
        if (type === 10) state.deployData.playGameConfig = []
        merchantVendorList.forEach(item => {
            let { value, label, vendorList, vendorName } = item
            keyData.forEach(ims => {
                let selectList = []
                let obj = state.deployData[ims.value] ? state.deployData[ims.value].find(its => +value === +its.type) : ''
                if (obj) {
                    obj.vendors.split(",").forEach(its => {
                        if (vendorList.some(im => im === its)) {
                            selectList.push(its)
                        }
                    })
                }
                state.deployData[ims.key].push({
                    type: +value,
                    label,
                    vendorName,
                    vendorList,
                    checkAll:
                        item.vendorList.length ===
                        selectList.length,
                    isIndeterminate: !!selectList.length &&
                        item.vendorList.length >
                        selectList.length,
                    playVendors: selectList,
                })
            })
            if (type === 10) {
                let dataList = []
                vendorList.forEach((its, index) => {
                    let obj = {
                        alias: its,
                        vendor_: vendorName[index],
                        checkedGameData: []
                    }
                    let sameObj = playGames_.filter(ims => +value === +ims.type && ims.alias === its)
                    if (sameObj.length) {
                        sameObj.forEach(ims => {
                            obj.checkedGameData.push({
                                gId: ims.gId,
                                gameName: ims.gameName
                            })
                        })
                    }
                    dataList.push(obj)
                })
                state.deployData.playGameConfig.push({
                    type: +value,
                    type_: label,
                    games: dataList
                })
            }
        })

        delete state.deployData.playVendors_
        delete state.deployData.auditVendors_
    }
    activityComponent.value = await defineAsyncComponent(modules[`/src/views/operating_center/activity_center/discounts_activity/deploy_dialog/${activityNameList[type]}.vue`])
    state.currentActivityType = type
})

const updateContentEdit = (val) => {
    state.deployData.promotionCond = val
    nextTick(() => { contentEditRef.value.update() })
}

// 获取指定类型的票券数据
const getOptionData = ({ ticketType, ticketName, ticketId }) => {
    let arr = props.metaData.ticketList.filter(item => item.type == ticketType)
    if (ticketId && arr.every(item => item.id !== ticketId) && ticketName) arr.unshift({
        id: ticketId,
        type: ticketType,
        name: ticketName + $t('（已停用）'),
        isDisabled: true
    })
    return arr
}

// 选择所有厂家
const checkAllVendor = (row) => {
    row.playVendors = row.checkAll
        ? [...row.vendorList]
        : []
    row.isIndeterminate = false
}

// 厂家勾选变化
const handleCheckVendor = (row) => {
    const checkedCount = row.playVendors.length
    row.checkAll = checkedCount === row.vendorList.length
    row.isIndeterminate =
        checkedCount > 0 && checkedCount < row.vendorList.length
}

// 复选框选择变化
const checkboxChange = ({ currentValue, metaKey, key = 'value', dependData, targetKey, indeterminateKey, type }) => {
    if (type === 1) {
        dependData[targetKey] = currentValue
            ? props.metaData[metaKey].map((item) => item[key])
            : []
        dependData[indeterminateKey] = false

    } else {
        const checkedCount = currentValue.length;
        dependData[targetKey] = checkedCount === props.metaData[metaKey].length
        dependData[indeterminateKey] =
            checkedCount > 0 && checkedCount < props.metaData[metaKey].length
    }
}

//禁止选中当前日期之前的时间
const disabledDate = (time) => {
    return time.getTime() < Date.now() + timeZoneOffset - 8.64e7
}

// 概率弹窗展示
const probabilityDeployShow = (val) => {
    state.probabilityData = { ...val }
    state.showProbabilityDeploy = true
}

// 概率设置
const save = (val) => {
    deployRef.value.setProbability(val)
}

// 弹窗按钮点击处理
const handleConfirm = (submitType) => {
    // submitType 0:立即开始，1:保存草稿，2:发布
    state.submitType = submitType
    let { operationType, status } = props.itemData
    if (operationType === 2 || (!submitType && operationType === 1 && status === 3)) return emits('close')
    if (!props.itemData.type) return
    deployRef.value.valid()
}

// 提交数据
const submit = (params) => {
    let { beginTime, endTime, showBeginTime, showEndTime, levelList, rules_, id = '', attachConfig } = params
    if(userData.getTemplateType() == 4){
        params.image = params.image.split(',')[0]
    }
    if (!state.submitType) {
        params.beginTime = ''
        params.showBeginTime = ''
    } else {
        let nowTime = new Date(dateFormat(Date.now())).getTime()
        if (state.submitType === 2 && (!id || id === -1 || (!!id && status === 1)) && new Date(beginTime).getTime() <= nowTime) return ElMessage.warning($t('活动开始时间必须晚于当前时间！'))
        if (new Date(beginTime).getTime() >= new Date(endTime).getTime()) return ElMessage.warning($t('活动结束时间必须晚于活动开始时间！'))
        if (new Date(showBeginTime).getTime() >= new Date(showEndTime).getTime()) return ElMessage.warning($t('活动展示结束时间必须晚于活动展示开始时间！'))
    }

    if (state.currentActivityType < 12 || [21, 22, 23, 24, 26].includes(state.currentActivityType) || (state.currentActivityType === 12 && !rules_.canCtrlGame) || (state.currentActivityType === 13 && rules_.type !== 2)) {
        let refuseType = ''  
        let keyList = [2, 4, 5, 7, 12].includes(params.type) ? props.keyDatas : [props.keyDatas[1]]
        // let keyList = [2, 3, 4, 5, 7].includes(params.type) ? props.metaData.keyData : [props.metaData.keyData[1]]
        for (let index = 0; index < keyList.length; index++) {
            let { key, value, type } = keyList[index]
            if (params[type] == 2) {
                let arr = []
                params[value].forEach((item) => {
                    if (item.playVendors.length) {
                        arr.push({
                            type: item.type,
                            vendors: item.playVendors.join(","),
                        })
                    }
                })
                if (!arr.length) {
                    refuseType = key
                    break
                }
                params[key] = JSON.stringify(arr)
            }
        }
        if (refuseType) return ElMessage.warning(`${$t('请至少选择一个')}${refuseType === 'auditVendors' ? $t('稽核') : $t('游戏')}${$t('平台！')}`)
    }
    if (![12, 21, 22, 23, 24].includes(state.currentActivityType) && levelList) {
        params.levels = levelList.join(",")
    }
    params.rules = JSON.stringify(rules_)
    if (attachConfig) params.attachConfig = JSON.stringify(attachConfig)
    params.bizType = state.submitType === 1 ? 1 : 2
    if (params.id === -1) {
        delete params.id
        delete params.status
        delete params.status_
        delete params.emp
    }
    if (props.itemData.id >= 1) {
        params.merchantId = props.itemData.merchant.id
    } else {
        params.targetMIds = props.itemData.merchant.id
        // params.targetMIds = props.itemData.targetMIds
        // params.targetMIds = commonData.currentMerchantSite.id
        // params.targetMIds = props.metaData.merchantSiteList.length <= 1 ? commonData.currentMerchantSite.id :
        //     (props.itemData.targetMIds.includes(0) ? props.metaData.merchantSiteList.map(item => item.id).join(',') : props.itemData.targetMIds.join(','))
    }
    if (isCustomize.value) params.isCustom = true
    // 显示左边风险控制,去除等级，层级
    if(isShowContentEdit.value && !params.id){
        delete params.levels
        delete params.fixLayers
    }
    delete params.merchant
    delete params.levelList
    delete params.rules_
    delete params.operationType
    delete params.vendor
    delete params.playVendorList
    delete params.auditVendor
    delete params.auditVendorList
    delete params.isCheckedAllLevel
    delete params.isIndeterminateLevel

    params.id ? params.editType = 0 : params.addType = 1
    let api = params.id ? promotionEditApi : promotionAddApi
    dialogRef.value.showLoading()
    api(params).then(() => {
        emits('close')
        emits('fetchData')
    }).catch(err => {
        dialogRef.value.closeLoading()
    })
}

provide('provideData', {
    'metaData': props.metaData,
    'checkAllVendor': (val) => checkAllVendor(val),
    'handleCheckVendor': (val) => handleCheckVendor(val),
    'checkboxChange': (val) => checkboxChange(val),
    'submit': (val) => submit(val),
    'probabilityDeployShow': (val) => probabilityDeployShow(val),
    'previewPicture': (val) => emits('previewPicture', val),
    'showLoading': () => dialogRef.value.showLoading(),
    'hideLoading': () => dialogRef.value.closeLoading(),
    'getOptionData': (val) => getOptionData(val),
    'isCustomize': () => isCustomize.value,
    'showTagCheck': () => props.metaData.tagList && props.metaData.tagList.length && isCustomize.value,
    'tagList': () => props.metaData.tagList || [],
    'inputNumberMax': ['ID', 'VN'].includes(country.value) ? 999999999 : 9999999,
    'isShowLevels': false,
    'isShowFixLayers': false,
    // 'isShowLevels': !!props.itemData.id && props.itemData.id !== -1 && props.itemData.levels ? true : false,  //会员等级
    // 'isShowFixLayers': !!props.itemData.id && props.itemData.id !== -1 && props.itemData.fixLayers ? true : false, // 会员层级
})
</script>


<style lang="scss">
.activity-deploy {
    .issue {
        top: -56px;
    }
}
.w370 {
    width: 370px;
}
</style>
