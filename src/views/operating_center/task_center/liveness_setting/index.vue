<template>
    <!-- 任务中心-活跃度设置 -->
    <div class="liveness-setting">
        <div class="head" v-permiss="'merchant.user-task-config.addOrEditBase'">
            <el-button v-throttle type="primary" @click="emits('showRuleDialog')">{{$t('规则设置')}}</el-button>
        </div>
        <el-table :data="state.formData.rule" border>
            <el-table-column prop="name" :label="$t('宝箱名称')" min-width="140" align="center" />
            <el-table-column prop="point" :label="$t('所需活跃度')" min-width="140" align="center" />
            <el-table-column :label="$t('奖励类型')" min-width="140" align="center">
                <template #default="{ row }">
                    {{row.random ? $t('随机') : $t('固定')}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('奖励金额')" min-width="140" align="center">
                <template #default="{ row }">
                    <span v-if="!row.random">{{row.reward}}</span>
                    <span v-if="row.random">{{row.min}} ~ {{row.max}}</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="100">
                <template #default="{ $index }">
                    <el-button v-permiss="'merchant.user-task-config.addOrEditBase'" v-throttle type="primary" text
                        @click="state.currentIndex = $index,state.showEdit = true">{{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <EditTreasureBoxDialog v-if="state.showEdit" :currentIndex="state.currentIndex" :configData="state.formData" :metaData="metaData"
            @refreshData="refreshData" @close="state.showEdit = false">
        </EditTreasureBoxDialog>
    </div>
</template>

<script setup>
import { reactive, defineAsyncComponent, defineEmits, defineExpose } from 'vue'
import { deepClone } from '@/common/util'
const EditTreasureBoxDialog = defineAsyncComponent(() => import('./components/EditTreasureBoxDialog.vue'))

const emits = defineEmits(['showRuleDialog', 'getData'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    currentIndex: 0,
    formData: {
        rule: []
    },
    showEdit: false,
})

const setData = (val) => {
    if (Object.keys(val).length) {
        state.formData = deepClone(val)
    }
}

const refreshData = () => {
    emits('getData')
}

defineExpose({ setData })
</script>

<style lang="scss" scoped>
.liveness-setting {
    .head {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding-right: 20px;
        margin-bottom: 10px;
    }
}
</style>
