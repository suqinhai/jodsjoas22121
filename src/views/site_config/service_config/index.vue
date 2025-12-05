<!--
 * @Author: yilaisai
 * @Date: 2025-04-18 10:36:14
 * @LastEditors: yilaisai
 * @LastEditTime: 2025-04-18 11:00:26
-->
<template>
    <!-- 站点配置-客服配置 -->
    <div class="tabs service_manage">
        <el-tabs v-model="activeName" class="demo-tabs">
            <template v-if="!isCustomize">
                <el-tab-pane :label="$t('在线客服')" name="1">
                    <OnlineService></OnlineService>
                </el-tab-pane>
                <el-tab-pane :label="$t('其他客服')" name="2">
                    <OtherService></OtherService>
                </el-tab-pane>
                <el-tab-pane :label="$t('常见问题')" name="3">
                    <CommonProblem></CommonProblem>
                </el-tab-pane>
            </template>
            <template v-else>
                <el-tab-pane :label="$t('客服配置')" name="1">
                    <ServiceSet></ServiceSet>
                </el-tab-pane>
                <el-tab-pane :label="$t('首页悬浮球配置')" name="2">
                    <HomeFloatBall></HomeFloatBall>
                </el-tab-pane>
                <el-tab-pane :label="$t('常见问题')" name="3">
                    <CommonProblem></CommonProblem>
                </el-tab-pane>
            </template>
        </el-tabs>
    </div>
</template>

<script setup name="serviceConfig">
import { defineAsyncComponent, ref, onMounted, onActivated, computed } from "vue"
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
const OnlineService = defineAsyncComponent(() => import('./online_service/index.vue'))
const OtherService = defineAsyncComponent(() => import('./other_service/index.vue'))
const CommonProblem = defineAsyncComponent(() => import('./common_problem/index.vue'))
const ServiceSet = defineAsyncComponent(() => import('./service_set/index.vue'))
const HomeFloatBall = defineAsyncComponent(() => import('./home_float_ball/index.vue'))

let activeName = ref('1')
let isInit = ref(true)
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

const isCustomize = computed(() => {
    return userData.getTemplateType() === 4
})

onMounted(() => {
    if (commonData.isManual) isInit.value = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
})

onActivated(() => {
    if (isInit.value) return isInit.value = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
    if (isCustomize.value && activeName.value === '2' && userData.getTemplateColor() !== 3003) activeName.value === '1'
})
</script>

<style lang="scss" scoped></style>
