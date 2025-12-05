<template>
    <!-- 商户账单-详情 -->
    <div>
        <Dialog ref="detailDialog" width="1000" :title="$t('账单详情')" top="10vh" :isShowSubmit="showPayBtn" :operateActions="[$t('取消'), $t('核对无误并付款')]"
            @cancel="cancel" @confirm="confirmEdit">
            <div class="merchant-bill-detail-page">
                <el-form :label-width="$locale == 'zh' ? '120px' : 'auto'">
                    <el-form-item :label="$t('账单月份:')">
                        <span>{{detail.period}}</span>
                    </el-form-item>
                    <el-form-item :label="$t('经营地(含时区):')">
                        <span>（UTC {{userData.merchantInfo.timeZone}}）</span>
                    </el-form-item>
                </el-form>
                <el-table :data="tableData" :span-method="arraySpanMethod" border>
                    <el-table-column prop="currency" :label="$t('币种')" min-width="120" align="center">
                        <template #default="{row, $index}">
                            <div style="text-align: right;">
                                {{$index === 0?row.currency:$index === 1?$t('其他费用'):$index === 2?$t('路线维护费(U)'):$index === 3?$t('本账单合计(U)'):$index === 4?$t('优惠额度(U)'):$t('调整后实际支付(U)') }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="winCoin" :label="$t('盈亏金额')" min-width="120" align="center" />
                    <el-table-column prop="exchangeRate" :label="$t('折算汇率')" min-width="120" align="center" />
                    <el-table-column :label="$t('账单金额(U)')" min-width="120" align="center">
                        <template #default="{row, $index}">
                            {{ !$index ? row.gameFee : $index === 1? row.otherFee : $index === 2? row.netFee : $index === 3? toolPoint(add(row.totalPay, row.freeAmount), 2): $index == 4? row.freeAmount: row.totalPay }}
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" :label="$t('操作')" min-width="250" align="center">
                        <template #default="{row, $index}">
                            <el-button v-throttle type="primary" link v-if="$index === 0" @click="examineDetail">{{$t('核对')}}</el-button>
                            <span
                                v-else>{{ $index === 1?$t('域名CDN费用'):$index === 2?$t('固定费用'):$index === 4?`${$t('当前站点余额')}${userData.merchantInfo.activeAmount || 0}${$t('(U)，账单无误记得点击付款！')}`:'' }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </Dialog>

        <CheckDialog v-if="showCheckDialog" :totalDetail="props.detail" :merchantDetail="detail" @close="showCheckDialog = false">
        </CheckDialog>
    </div>
</template>

<script setup>
import { defineAsyncComponent, onMounted, ref, computed } from 'vue'
import userStore from '@/store/user'
import { confirmBillList } from '@/api/merchant_center'
import { toolPoint, add } from '@/common/util'
const CheckDialog = defineAsyncComponent(() => import('./CheckDialog.vue'))

const emits = defineEmits(['close', 'refreshList'])
const props = defineProps(['detail', 'isMerchant'])
const showCheckDialog = ref(false)
const detailDialog = ref(null)
const userData = userStore()

const showPayBtn = computed(() => {
    return props.detail.status !== 9 && props.isMerchant
})

const arraySpanMethod = ({ row, column, rowIndex, columnIndex }) => {
    if (rowIndex !== 0) {
        if (columnIndex === 0) {
            return [1, 3]
        } else if (columnIndex === 1 || columnIndex === 2) {
            return [0, 0]
        }
    }
}

const tableData = computed(() => {
    let list = []
    if (props.detail) {
        for (var i = 0; i < 6; i++) {
            list[i] = props.detail
        }
    }
    return list
})

const cancel = () => {
    emits('close')
}

const examineDetail = () => {
    showCheckDialog.value = true
}

const confirmEdit = () => {
    detailDialog.value.showLoading()
    confirmBillList({
        id: props.detail.id,
        totalPay: props.detail.totalPay,
        merchantId: props.detail.merchant.id,
    }).then(res => {
        emits('close')
        emits('refreshList')
    }).catch(err => {
        detailDialog.value.closeLoading()
    })
}

onMounted(() => {
    detailDialog.value.showLoading()
    userData.getMerchantDetail().then(() => {
        detailDialog.value.closeLoading()
    }).catch(err => {
        detailDialog.value.closeLoading()
    })
})

</script>

<style lang='scss'>
.merchant-bill-detail-page {
}
</style>