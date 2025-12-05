<template>
    <!-- 游戏获利监控-详情 -->
    <Dialog :title="$t('详情')" @cancel="emit('close')" width="400" :isShowSubmit="false">
        <el-form :label-width="$locale == 'zh' ? '100px' : 'auto'">
            <el-form-item :label="$t('会员账号:')">
                <span>{{ detailsForm.user?.name || '' }}</span>
            </el-form-item>
            <el-form-item :label="$t('牌局编号:')">
                <span>{{ detailsForm.playNo }}</span>
            </el-form-item>
            <el-form-item :label="$t('子游戏名称:')">
                <span>{{ detailsForm.gameName }}</span>
            </el-form-item>
            <el-form-item :label="$t('结算状态:')">
                <span>{{ detailsForm.status_ }}</span>
            </el-form-item>
            <el-form-item :label="$t('投注时间:')">
                <span>{{ dateFormat(detailsForm.beginTime) }}</span>
            </el-form-item>
            <el-form-item :label="$t('有效投注:')">
                <span>{{ detailsForm.validCoin }}</span>
            </el-form-item>
            <el-form-item :label="$t('玩家输赢:')">
                <span>{{ detailsForm.outCoin }}</span>
            </el-form-item>
            <el-form-item :label="$t('结算时间:')">
                <span>{{ dateFormat(detailsForm.endTime) }}</span>
            </el-form-item>
            <!-- <el-form-item :label="$t('游戏结果:')">
                <el-link type="primary" :underline="false" :href="detailsForm.gameResultUrl" target="_blank">{{$t('点击查看')}}</el-link>
            </el-form-item> -->
        </el-form>
    </Dialog>
</template>

<script setup>
import { dateFormat } from "@/common/util/index.js"

const emit = defineEmits(["close"])
const props = defineProps({
    detailsForm: {
        type: Object,
        default: () => { },
    },
});
</script>

<style lang="scss" scoped></style>
  