<template>
    <!-- 运营中心-优惠活动列表-活动列表/已关闭活动-自定义活动-奖励审核派发 -->
    <Dialog ref="dialogRef" :title="$t('奖励审核派发')" @cancel="emits('close')" top="2vh" width="1240" :isShowSubmit="false">
        <el-tabs v-model="tabItem">
            <el-tab-pane :label="$t('申请审核')" :name="0">
                <AuditTableComponent ref="auditTableRef" :activityData="itemData" :hasAudit="true" :metaData="metaData" @showDialog="showDialog"
                    @showLoading="showLoading" @closeLoading="closeLoading"></AuditTableComponent>
            </el-tab-pane>
            <el-tab-pane :label="$t('派发奖励')" :name="1">
                <AuditTableComponent ref="distributeRef" :activityData="itemData" :hasAudit="false" :metaData="metaData" @showDialog="showDialog"
                    @showLoading="showLoading" @closeLoading="closeLoading"></AuditTableComponent>
            </el-tab-pane>
        </el-tabs>

    </Dialog>
</template>

<script setup>
import { ref, defineExpose } from "vue"
import AuditTableComponent from './AuditTableComponent.vue'

const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        },
    },
    itemData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const emits = defineEmits(["close", 'showAuditDialog', 'showMemberDialog'])
const tabItem = ref(0)
const dialogRef = ref(null)
const auditTableRef = ref(null)
const distributeRef = ref(null)

const showLoading = () => {
    dialogRef.value.showLoading()
}

const closeLoading = () => {
    dialogRef.value.closeLoading()
}

const showDialog = (val) => {
    let { key, data } = val
    if (key === 'showApplyAudit' || key === 'showDistributeAward') {
        emits('showAuditDialog', val)
    } else {
        emits('showMemberDialog', data.id)
    }
}

const refreshDistribute = () => distributeRef.value.fetchData()
const refreshAudit = () => auditTableRef.value.fetchData()

defineExpose({
    refreshDistribute,
    refreshAudit,
})
</script>

<style lang="scss">
</style>
