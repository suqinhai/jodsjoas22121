<template>
    <!-- 运营中心-活动中心 -->
    <div class="container activity-center" :class="'activity-center_' + $locale">
        <el-tabs v-if="tabItem" v-model="tabItem">
            <el-tab-pane v-for="item in showTabList" :key="item.value" :label="item.title" :name="item.value"></el-tab-pane>
        </el-tabs>
        <ActivityTableComponent v-if="tabItem === 1" :type="1" :initData="state.formData1" :metaData="metaData" :keyDatas="keyData" @setSearchData="setSearchData">
        </ActivityTableComponent>
        <ActivityTableComponent v-if="tabItem === 2" :type="2" :initData="state.formData2" :metaData="metaData" :keyDatas="keyData" @setSearchData="setSearchData">

        </ActivityTableComponent>
        <DiscountsDetail v-if="tabItem === 3"></DiscountsDetail>
        <RechargePromotionAssociation v-if="tabItem === 4 && isHaveCustom"></RechargePromotionAssociation>
        <LotteryNumber v-if="tabItem === 5"></LotteryNumber>
    </div>
</template>

<script setup name='activityCenter'>
import { defineAsyncComponent, ref, reactive, onMounted, onActivated, computed } from "vue"
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getTypeList } from '@/api/discounts_center'
import { getCommonMeta } from '@/api/common'
const ActivityTableComponent = defineAsyncComponent(() => import("./discounts_activity/index.vue"));
const DiscountsDetail = defineAsyncComponent(() => import("./discounts_detail/index.vue"));
const RechargePromotionAssociation = defineAsyncComponent(() => import("./recharge_promotion_association/index.vue"));
const LotteryNumber = defineAsyncComponent(() => import("./lottery_number/index.vue"));
// const AuditComponent = defineAsyncComponent(() => import("./components/AuditComponent.vue"));

const tabData = [
    { value: 1, title: $t('活动列表') },
    { value: 2, title: $t('已关闭活动') },
    { value: 3, title: $t('活动奖励'), permissionCode: 'merchant.user-coin-log.rewardDetail' },
    { value: 4, title: $t('充值促销关联列表') },
    { value: 5, title: $t('新拼多多抽奖人数'), permissionCode: 'merchant.promotion-review-log.newChopCount' },
]
const userData = userStore()
const commonData = commonStore()
const route = useRoute()
let tabItem = ref('')
let tab = ref('')
let state = reactive({
    formData1: {},
    formData2: {},
    isInit: true
});
let metaData = reactive({
    promotionType: [],
    bonusType: [],
    dispatchMode: [],
    promotionCond: [],
    auditMode: [],
    cycleMode: [],
    promotionStatus: [],
    signCycle: [],
    client: [],
    redEnvelopeCondType: [],
    agentLimitType: [],
    promotionAuditStatus: [],
    popMode: [],
    ctrlPools: [],
    ctrlLoseType: [],
    gameType: [],
    gameVendor: [],
    rankingDuration: [],
    rankingType: [],
    minAmountDuration: [],
    ticketType: [],
    registerTaskType: [],
    signCycleMode: [],
    luckyRedType: [],
    // keyData: [
    //     { key: 'playVendors', value: 'playVendorList', type: 'vendor' },
    //     { key: 'auditVendors', value: 'auditVendorList', type: 'auditVendor' }
    // ],
})
const keyData = [
    { key: 'playVendors', value: 'playVendorList', type: 'vendor' },
    { key: 'auditVendors', value: 'auditVendorList', type: 'auditVendor' }
]

const showTabList = computed(() => {
    return tabData.filter(item => {
        const hasPermission = item.permissionCode 
            ? userData.isHasPermiss(item.permissionCode)
            : true;
        if (item.value === 3) {
            return hasPermission;
        } else if (item.value === 5) {
            return hasPermission && isContain28.value;
        } else if (item.value === 4) {
            return userData.getTemplateType() === 4;
        }
        return true;
    });
})
const isHaveCustom = computed(() => {
    return commonData.merchantSiteList.some(item => item.custom)
})
const isCanClassify = computed(() => {
    return commonData.merchantSiteList.some(item => item.custom) && commonData.merchantSiteList.some(item => !item.custom)
})

const isContain28 = computed(() => {
    return metaData.promotionType.some(item => +item.value === 28)
})
onMounted(async () => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    await getCommonMeta({ types: Object.keys(metaData).join(',') }).then(res => {
        metaData = Object.assign(metaData, res.data || {})
    })

    await getTypeList().then(({ data }) => {
        metaData.promotionType = data || []
        if (!isCanClassify.value) {
            let arr = isHaveCustom.value ? [5, 6, 7, 8, 10, 12] : [21, 22, 23, 24, 25, 26]
            metaData.promotionType = data.filter(item => !arr.includes(+item.value))
        }
        if(userData.getTemplateType() === 4){
            metaData.promotionType = metaData.promotionType.filter(item => +item.value !== 27 && +item.value !== 28)
        }
    })

    metaData.merchantSiteList = commonData.merchantSiteList
    metaData.isHaveCustom = isHaveCustom.value
    if (route.query.tab && !tab.value) {
        tab.value = +route.query.tab
        tabItem.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : 1
    } else if (!route.query.tab && !tab.value) {
        tabItem.value = 1
    }
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    if ((route.query.tab && tab.value !== +route.query.tab)) {
        tab.value = +route.query.tab
        tabItem.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : 1
    }
})

const setSearchData = (data) => {
    state['formData' + tabItem.value] = { ...data }
}
</script>

<style lang="scss">
.activity-center_en {
    .el-form > .el-form-item {
        margin-bottom: 25px;
    }
}
</style>
