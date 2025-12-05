<template>
    <div class="container custom-agent-config">
        <el-tabs v-model="state.type">
            <el-tab-pane v-for="(item,index) in state.showTabList" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <CustomOverviewConfig v-if="state.type == 1" />
        <CustomBasicsConfig v-if="state.type == 2" />
        <SeoSet v-if="state.type == 3 && userData.isHasPermiss('merchant.agent.linkMethod')" />
    </div>
</template>

<script setup>
import { defineAsyncComponent, reactive, onMounted, onActivated } from "vue"
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import userStore from '@/store/user'
const CustomBasicsConfig = defineAsyncComponent(() => import('./components/CustomBasicsConfig.vue'))
const CustomOverviewConfig = defineAsyncComponent(() => import('./components/CustomOverviewConfig.vue'))
const SeoSet = defineAsyncComponent(() => import("../setting/seo/index.vue"))

const state = reactive({
    isInit: true,
    type: 1,
    showTabList: [
        { title: $t('定制版概览配置'), value: 1 },
        { title: $t('定制版基础配置'), value: 2 },
        { title: $t('代理推广链接方式'), value: 3 },
    ]
})
const route = useRoute()
const commonData = commonStore()
const userData = userStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
})
</script>

<style scoped></style>