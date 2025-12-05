<template>
    <!-- 商户账单-付款 -->
    <Dialog width="800" :title="$t('付款')" top="10vh" :operateActions="[$t('取消'), $t('确认')]" @confirm="confirmEdit" @cancel="cancel">
        <el-form :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <el-form-item :label="$t('站点名称：')">
                <span>{{ item.merchant.name }}</span>
            </el-form-item>
            <el-form-item :label="$t('账单月份：')">
                <span>{{ item.period }}</span>
            </el-form-item>
            <el-form-item :label="$t('站点账单金额：')">
                <span>{{ item.localGameFee }}</span>
            </el-form-item>
            <el-form-item :label="$t('折算汇率：')">
                <span>{{ item.exchangeRate }}</span>
            </el-form-item>
            <el-form-item :label="$t('折算金额：')">
                <span>{{ item.gameFee }}</span>
            </el-form-item>
            <el-form-item :label="$t('其他费用：')">
                <span>{{ add(item.otherFee, item.netFee)}}</span>
            </el-form-item>
            <el-form-item :label="$t('本账单合计：')">
                <span>{{ item.totalPay }}</span>
            </el-form-item>
        </el-form>

    </Dialog>
</template>

<script setup>
import { confirmBillList } from '@/api/merchant_center'
import { add } from '@/common/util'

const props = defineProps(['item'])
const emits = defineEmits(['close', 'refreshList'])

const confirmEdit = () => {
    confirmBillList({
        id: props.item.id,
        totalPay: props.item.totalPay,
        merchantId: props.item.merchant.id,
    }).then(res => {
        const { code, msg } = res
        if (code === 0) {
            emits('close')
            emits('refreshList')
        }
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang='scss'>
</style>