<template>
    <!-- 任务中心-新人福利 -->
    <div class="new-boy-welfare">
        <div class="head" v-permiss="'merchant.user-task-config.addOrEditBase'">
            <el-button v-throttle type="primary" @click="emits('showRuleDialog')">{{$t('规则设置')}}</el-button>
        </div>
        <el-table :data="state.formData.rule" border>
            <el-table-column prop="sort" :label="$t('排序')" width="60" align="center" />
            <el-table-column :label="$t('任务条件')" min-width="160" align="center">
                <template #default="{ row }">
                    {{metaData.newcomerTaskType.find(item => +item.value === row.rewardType)?.label || ''}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('图标')" min-width="120" align="center">
                <template #default="{ row }">
                    <el-image v-if="!!row.icon" class="imgs" :src="row.icon" :crossorigin="null" :preview-src-list="[row.icon]" preview-teleported
                        fit="contain" />
                </template>
            </el-table-column>
            <el-table-column prop="amount" :label="$t('奖励金额')" min-width="140" align="center" />
            <el-table-column prop="point" :label="$t('奖励活跃度')" min-width="140" align="center" />
            <el-table-column prop="name" :label="$t('任务介绍')" min-width="200" align="center" />
            <el-table-column :label="$t('是否开启')" min-width="120" align="center">
                <template #default="{ row }">
                    <el-switch disabled v-model="row.enable" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('提示气泡')" min-width="140" align="center">
                <template #default="{ row }">
                    <el-switch disabled v-model="row.tip" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="100">
                <template #default="{ $index, row }">
                    <el-button v-permiss="'merchant.user-task-config.addOrEditBase'" v-throttle type="primary" text @click="modif(row, $index)">
                        {{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <EditDialog v-if="state.showEdit" :currentIndex="state.currentIndex" :configData="state.formData" :metaData="metaData"
            @refreshData="refreshData" @close="state.showEdit = false">
        </EditDialog>

        <RegisterTask v-if="state.showRegisterEdit" :currentIndex="state.currentIndex" :configData="state.formData" :metaData="metaData"
            :merchantVendorList="state.merchantVendorList" @refreshData="refreshData" @close="state.showRegisterEdit = false">
        </RegisterTask>
    </div>
</template>s

<script setup>
import { reactive, defineAsyncComponent, defineEmits, defineExpose, onMounted } from 'vue'
import { deepClone, getGameVendorData } from '@/common/util'
const EditDialog = defineAsyncComponent(() => import('./components/EditDialog.vue'))
const RegisterTask = defineAsyncComponent(() => import('./components/RegisterTask.vue'))

const emits = defineEmits(['showRuleDialog', 'getData'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    currentIndex: 0,
    formData: {
        rule: []
    },
    itemData: {},
    merchantVendorList: [],
    showEdit: false,
    showRegisterEdit: false
})

const setData = (val) => {
    if (Object.keys(val).length) {
        state.formData = deepClone(val)
    }
}

const modif = (data, $index) => {
    state.currentIndex = $index;
    if (data.rewardType === 10) {
        state.showRegisterEdit = true
    } else {
        state.showEdit = true
    }
}

const refreshData = () => {
    emits('getData')
}

// 获取商家支持的厂家与游戏类型
const getGameVender = () => {
    getGameVendorData().then(data => {
        state.merchantVendorList = data
    })
}

onMounted(() => {
    getGameVender()
})

defineExpose({ setData })
</script>

<style lang="scss" scoped>
.new-boy-welfare {
    .head {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding-right: 20px;
        margin-bottom: 10px;
    }
}
</style>
