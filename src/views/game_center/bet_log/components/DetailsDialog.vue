
<template>
    <!-- 投注记录-投注明细-详情 -->
    <Dialog :title="$t('详情')" :isShowSubmit="false" @cancel="emit('close')" width="400">
        <el-form :model="detailsForm" :label-width="$locale == 'zh' ? '100px' : 'auto'" :inline="false">
            <el-form-item :label="$t('会员ID:')">
                {{ props.detailsForm.userId }}
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                {{ props.detailsForm.user?.name || '' }}
            </el-form-item>
            <el-form-item :label="$t('牌局编号:')">
                {{ props.detailsForm.playNo }}
            </el-form-item>
            <el-form-item :label="$t('子游戏名称:')">
                {{ props.detailsForm.gameName }}
            </el-form-item>
            <el-form-item :label="$t('结算状态:')">
                {{ props.detailsForm.status_ }}
            </el-form-item>
            <el-form-item :label="$t('投注时间:')">
                {{ dateFormat(props.detailsForm.beginTime) }}
            </el-form-item>
            <el-form-item :label="$t('有效投注:')">
                {{ props.detailsForm.validCoin }}
            </el-form-item>
            <el-form-item :label="$t('玩家输赢:')">
                {{ props.detailsForm.winLoseCoin }}
            </el-form-item>
            <el-form-item :label="$t('结算时间:')">
                {{ dateFormat(props.detailsForm.endTime) }}
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { dateFormat } from "@/common/util/index.js"

const props = defineProps({
    detailsForm: {
        type: Object,
        default: () => { },
    },
})
const emit = defineEmits(["close"])
</script>

<style lang="scss">
</style>
