<template>
    <!-- 代理中心-返佣设置 -->
    <div class="container rebate-setting">
        <el-tabs v-if="userData.siteInfo.agentMode === 1" v-model="tabItem">
            <el-tab-pane v-for="(item, index) in metaData.gameType" :key="item.value" :label="item.label + $t('佣金')" :name="item.value">
                <template v-if="(index + 1) === metaData.gameType?.length" #label>
                    <div class="flex algin-center last">
                        <div class="mr10">{{ item.label + $t('佣金') }}</div>
                        <el-tooltip placement="right" popper-class="tooltip-max-width tooltip-icon">
                            <template #content>
                                <div>{{ $t('返佣设置说明：') }}</div>
                                <div>{{ $t('对游戏类型设置返佣比例；') }}</div>
                                <div>{{ $t('有效投注业绩（单元：万）：有效投注以万起步计算，可设置0-0.0001万（如0.1为1千，0.01为1百）；') }}</div>
                                <div>{{ $t('每万返佣比例：如配置1万返佣0.5，则会员该游戏类型投注达到1万获得奖励0.5。') }}</div>
                            </template>
                            <el-icon :size="15">
                                <QuestionFilled />
                            </el-icon>
                        </el-tooltip>
                    </div>
                </template>
            </el-tab-pane>
        </el-tabs>

        <TableComponentBet v-if="userData.siteInfo.agentMode === 1" :type="tabItem" :metaData="metaData"></TableComponentBet>
        <TableComponentLoss v-if="userData.siteInfo.agentMode === 2"></TableComponentLoss>
    </div>
</template>

<script setup name='rebateSetting'>
import { defineAsyncComponent, ref, reactive, onActivated, onMounted } from "vue"
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getCommonMeta, getLevelConfig } from "@/api/common"
const TableComponentBet = defineAsyncComponent(() => import("./components/TableComponentBet.vue"))
const TableComponentLoss = defineAsyncComponent(() => import("./components/TableComponentLoss.vue"))

let tabItem = ref('1')
let isInit = ref(true)
let metaData = reactive({
    gameType: [],
    fixedLevel: [],
})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

getCommonMeta({ types: 'gameType' }).then(res => {
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
})

onActivated(() => {
    if (isInit.value) return isInit.value = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
})
</script>

<style lang="scss" scoped>
.last {
    position: relative;
    .el-tooltip__trigger {
        position: absolute;
        right: -68px;
        color: #333;
    }
}
</style>
