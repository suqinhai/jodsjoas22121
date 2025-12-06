<template>
    <!-- 数据报表-优惠数据报表-活动 -->
    <Dialog ref="dialog" width="1400" title="活动" :isShowSubmit="false" top="6vh" @cancel="emits('close')">
        <el-table :data="props.tableData" border>
            <el-table-column prop="period_" :label="$t('日期')" min-width="100" align="center" />
            <el-table-column prop="promotion" :label="$t('领取金额')" min-width="100" align="center" />
            <!--            <el-table-column prop="promotion" :label="$t('活动名称')" min-width="100" align="center" /> -->
            <el-table-column prop="promoSign" :label="$t('签到')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="clickActivity(row,7,$t('签到'))">{{row.promoSign}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="promoRelief" :label="$t('救援金')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="clickActivity(row,8,$t('救援金'))">{{row.promoRelief}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="promoTurntable" :label="$t('幸运转盘')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="clickActivity(row,9,$t('幸运转盘'))">{{row.promoTurntable}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="promoRedEnvelope" :label="!isCustomize ? $t('红包') : $t('幸运抽奖红包')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer"
                        @click="clickActivity(row,10,!isCustomize ? $t('红包') : $t('幸运抽奖红包'))">{{row.promoRedEnvelope}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="promoAgent" :label="$t('推广')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="clickActivity(row,11,$t('推广'))">{{row.promoAgent}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="promoChallengeInvite" :label="$t('闯关邀请')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="clickActivity(row,12,$t('闯关邀请'))">{{row.promoChallengeInvite}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="promoReliefBalance" :label="$t('余额救援金')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="clickActivity(row,13,$t('余额救援金'))">{{row.promoReliefBalance}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="promoRecharge" :label="$t('充值')" min-width="100" align="center" />
            <el-table-column prop="promoPlay" :label="$t('打码')" min-width="100" align="center" />
            <el-table-column prop="promoRedeemCode" :label="$t('新人彩金')" min-width="100" align="center" />
            <el-table-column prop="promoRank" :label="$t('排行榜')" min-width="100" align="center" />
            <el-table-column prop="promoCustom" :label="$t('自定义')" min-width="100" align="center" />
            <el-table-column prop="promoChop" :label="$t('拼多多')" min-width="100" align="center" />
            <el-table-column prop="promoNewChop" :label="$t('新拼多多')" min-width="100" align="center" />
            <template v-if="hasCustomize">
              <el-table-column prop="promoDownloadApp" :label="$t('下载App')" min-width="100" align="center">
                <template v-slot="{ row }">
                  <span class="special pointer" @click="clickActivity(row, 20,$t('下载App'))">{{row.promoDownloadApp}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="promoMilestone" :label="$t('里程碑活动')" min-width="100" align="center">
                <template v-slot="{ row }">
                  <span class="special pointer" @click="clickActivity(row, 21, $t('里程碑活动'))">{{row.promoMilestone}}</span>
                </template>
              </el-table-column>
            </template>
        </el-table>
        <MoneyDetailsDialog :itemData="state.itemData" v-if="state.showMoneyDetailsDialog" @close="state.showMoneyDetailsDialog = false">
        </MoneyDetailsDialog>
    </Dialog>
</template>

<script setup>
import { reactive, defineAsyncComponent, computed } from "vue"
import commonStore from '@/store/common'
const MoneyDetailsDialog = defineAsyncComponent(() => import("./MoneyDetailsDialog.vue"))

const emits = defineEmits(['close'])
const props = defineProps({
    tableData: {
        type: Array,
        default: []
    },
})
const commonData = commonStore()

const isCustomize = computed(() => {
    let { merchantId } = props.tableData[0]
    return commonData.merchantSiteList.find(item => item.id == merchantId)?.custom
})

const hasCustomize = computed(() => {
  const { merchantId } = props.tableData[0]
  // 如果merchantId为否 则判断commonData.merchantSiteList中是否存在C版本
  return merchantId ? commonData.merchantSiteList.find(item => item.id == merchantId)?.custom : commonData.merchantSiteList.some(item => item.custom)
})


const state = reactive({
    showMoneyDetailsDialog: false,
    itemData: {},
})

const clickActivity = (data, type, title) => {
    data.type = type
    data.moneyDetailsTitle = title
    state.itemData = data
    state.showMoneyDetailsDialog = true
}

</script>

<style lang="scss">
</style>
