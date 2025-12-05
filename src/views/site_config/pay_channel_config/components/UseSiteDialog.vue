<template>
    <!-- 站点配置-支付通道配置-使用站点 -->
    <Dialog ref="dialog" width="600" :title="$t('使用站点')" :isShowSubmit="false" top="5vh" @cancel="emits('close')">
        <div>{{$t('通道名称：')}}{{itemData.channel_}}</div>
        <el-table :data="merchantSiteList" border>
            <el-table-column prop="id" :label="$t('站点ID')" min-width="100" align="center" />
            <el-table-column prop="name" :label="$t('站点名称')" min-width="120" align="center" />
            <el-table-column :label="$t('充值金额')" min-width="160" align="center">
                <template #default="{ row }">
                    {{getRechargeAmount(row.id)}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('状态')" min-width="100" align="center">
                <template #default="{ row }">
                    {{ !itemData.scopes || ( itemData.scopes && itemData.scopes.includes(row.id)) ? $t('已使用') : $t('未使用')}}
                </template>
            </el-table-column>
        </el-table>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    merchantSiteList: {
        type: Array,
        default: () => []
    },
})

const getRechargeAmount = (id) => {
    return props.itemData.dataList.find(item => item.merchantId === id)?.rechargeAmount || 0
}
</script>

<style lang="scss">
</style>
