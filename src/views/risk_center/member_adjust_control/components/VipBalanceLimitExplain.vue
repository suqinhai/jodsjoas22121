<template>
    <Dialog ref="dialog" width="500" :title="$t('VIP余额限制说明')" top="5vh" :isShowSubmit="false" @cancel="cancel">
        <el-table :data="balanceLimitData" style="width: 100%" border>
            <el-table-column prop="level_" :label="$t('VIP等级')" min-width="120" align="center" />
            <el-table-column prop="balanceLimit" :label="$t('余额限制')" min-width="140" align="center" />
        </el-table>
        <div class="tips">
        	<div>{{$t('注：商户对会员进行控制时，根据系统和商户的配置，取最小值；')}}</div>
        	<div>{{$t('如：系统限制VIP3余额上限1000，商户配置余额限制200，则以200为准，商户余额限制配置1300，则以1000为准。')}}</div>
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const props = defineProps({
    balanceLimitData: {
        type: Array,
        default: () => []
    },
})

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
.tips {
    color: red;
    margin-top: 10px;
    line-height: 16px;
}
</style>
