<template>
    <!-- 风险中心-刷子监控 -->
    <div class="tabs brush-monitoring">
        <el-tabs v-model="tabItem">
            <el-tab-pane :label="$t('同关联监控')" name="1">
                <SameRelevanceMonitoring :metaData="metaData"></SameRelevanceMonitoring>
            </el-tab-pane>
            <el-tab-pane :label="$t('同关联处罚记录')" name="2">
                <CrimeSheet :metaData="metaData"></CrimeSheet>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup name='brushMonitoring'>
import { defineAsyncComponent, ref, reactive, onMounted, onActivated } from "vue"
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { getCommonMeta, getLevelConfig } from '@/api/common'
const SameRelevanceMonitoring = defineAsyncComponent(() => import("./components/SameRelevanceMonitoring.vue"));
const CrimeSheet = defineAsyncComponent(() => import("./components/CrimeSheet.vue"));

let userId = ref('')
let tabItem = ref('1')
let isInit = ref(true)
let metaData = reactive({
    botSpyType: [],
    botSpyPunish: [],
    botSpyRange: [],
    fixedLevel: [],
});
const route = useRoute()
const commonData = commonStore()

getCommonMeta({ types: 'botSpyType,botSpyPunish,botSpyRange' }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
})

getLevelConfig({ type: 1 }).then(res => {
    metaData.fixedLevel = res.data || []
})

onMounted(() => {
    if (commonData.isManual) isInit.value = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    if (route.query.userId && !userId.value) {
        userId.value = route.query.userId
        tabItem.value = '2'
    }
})

onActivated(() => {
    if (isInit.value) return isInit.value = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    if (route.query.userId && userId.value !== route.query.userId) {
        userId.value = route.query.userId
        tabItem.value = '2'
    }
})
</script>

<style lang="scss">
.brush-monitoring {
    // min-width: 1300px;
}
</style>
