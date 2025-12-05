<template>
    <!-- 站点配置-模版仓库 -->
    <div class="container template-store">
        <el-tabs v-model="activeTab">
            <el-tab-pane v-for="(item,index) in showTabList" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <Templates v-if="activeTab === 1"></Templates>
        <FestivalStyle v-if="activeTab === 2"></FestivalStyle>
    </div>
</template>

<script setup name="templateStore">
import { defineAsyncComponent, ref, computed, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import userStore from '@/store/user'
const Templates = defineAsyncComponent(() => import("./templates/index.vue"))
const FestivalStyle = defineAsyncComponent(() => import("./festival_style/index.vue"))

const tabData = [
    { title: $t('模版设置'), value: 1 },
    { title: $t('节日风格模版'), value: 2, permissionCode: 'merchant.app.layout-festivalStyle' },
]
let activeTab = ref(1)
let tab = ref('')
let isInit = ref(true)
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

const showTabList = computed(() => {
    return tabData.filter(item => item.value === 1 || userData.isHasPermiss(item.permissionCode))
})

onMounted(() => {
    if (commonData.isManual) isInit.value = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    if (route.query.tab && !tab.value) {
        tab.value = +route.query.tab
        activeTab.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : 1
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
        activeTab.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : 1
    }
})
</script>

<style lang="scss">
.template-store {
}
</style>
