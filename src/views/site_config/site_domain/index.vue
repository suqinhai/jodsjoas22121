<template>
    <!-- 站点配置-站点域名 -->
    <div class="container site-domain">
        <el-tabs v-model="type">
            <el-tab-pane v-for="(item,index) in showTabList" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <!-- <div class="domain-manage-main"> -->
        <DomainManageTable :metaData="metaData" :asBack="0" v-if="type === 0"></DomainManageTable>
        <DomainManageTable :metaData="metaData" :asBack="1" v-if="type === 1"></DomainManageTable>
        <DomainManageTable :metaData="metaData" :asBack="2" v-if="type === 2"></DomainManageTable>
        <TrafficStatistics :metaData="metaData" v-if="type === 3"></TrafficStatistics>
        <!-- </div> -->
    </div>
</template>

<script setup name="siteDomain">
import { reactive, defineAsyncComponent, ref, computed, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getCommonMeta } from '@/api/common'
const DomainManageTable = defineAsyncComponent(() => import('./domain_manage/index.vue'))
const TrafficStatistics = defineAsyncComponent(() => import('./traffic_statistics/index.vue'))

const tabData = [
    { title: $t('前台域名管理'), value: 0 },
    { title: $t('后台域名管理'), value: 1, permissionCode: 'admin.domain.list-1' },
    { title: $t('推广域名'), value: 2, permissionCode: 'admin.domain.list-2' },
    { title: $t('流量统计'), value: 3, permissionCode: 'merchant.traffic-stat.list' },
    // { title: $t('WEB大厅'), value: 2, permissionCode: '' },
    // { title: $t('APP大厅'), value: 3, permissionCode: '' },
    // { title: $t('下载站域名'), value: 4, permissionCode: '' },
    // { title: $t('支付域名'), value: 5, permissionCode: '' },
    // { title: $t('自定义解析'), value: 6, permissionCode: '' },
    // { title: $t('流量统计'), value: 7, permissionCode: '' },
    // { title: $t('CDN网络质量'), value: 8, permissionCode: '' },
    // { title: $t('证书管理'), value: 9, permissionCode: '' },
]
let type = ref(0)
let tab = ref('')
let isInit = ref(true)
let route = useRoute()
let metaData = reactive({
    dnsProvider: [],
    dnsPosition: [],
})
const userData = userStore()
const commonData = commonStore()

const showTabList = computed(() => {
    return tabData.filter(item => item.value === 0 || userData.isHasPermiss(item.permissionCode))
})

getCommonMeta({ types: 'dnsProvider,dnsPosition' }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
})

onMounted(() => {
    if (commonData.isManual) isInit.value = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    if (route.query.tab && !tab.value) {
        tab.value = +route.query.tab
        type.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : showTabList.value[0] ? showTabList.value[0].value : 0
    } else if (!route.query.tab && !tab.value) {
        type.value = showTabList.value[0] ? showTabList.value[0].value : 0
    }
})

onActivated(() => {
    if (isInit.value) return isInit.value = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    if ((route.query.tab && tab.value !== +route.query.tab)) {
        tab.value = +route.query.tab
        type.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : showTabList.value[0] ? showTabList.value[0].value : 0
    }
})

</script>

<style lang="scss">
</style>
