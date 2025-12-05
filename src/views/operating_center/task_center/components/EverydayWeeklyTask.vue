<template>
    <!-- 任务中心-每日/每周任务 -->
    <div class="container-main task-deploy">
        <div class="head">
            <div class="tab-box">
                <div v-for="item in childTaskData" :key="item.value" class="tab-small pointer" :class="{'active':state.currentIndex === +item.value}"
                    @click="handleTab(+item.value)">{{ item.label }}</div>
            </div>
            <el-button v-permiss="'merchant.user-task-config.addOrEditBase'" v-throttle type="primary" @click="emits('showRuleDialog')">{{$t('规则设置')}}
            </el-button>
        </div>
        <div class="tips">{{$t('满足所有阶梯奖励均可领取；奖励金额和奖励票券必须配置一种，都未配置的数据行保存时会被过滤！')}}</div>
        <el-table class="table-box" :data="state.ruleData" border>
            <el-table-column v-if="state.currentIndex === +childTaskData[0].value" :label="$t('累计充值金额')" min-width="160" align="center">
                <template #default="{ row }">
                    <el-input-number :disabled="state.isDisabled" style="width: 100%" v-model="row.amount" :controls="false" :precision="2"
                        :placeholder="$t('请输入累计充值金额')" />
                </template>
            </el-table-column>
            <el-table-column v-if="state.currentIndex === +childTaskData[1].value" :label="$t('累计打码金额')" min-width="160" align="center">
                <template #default="{ row }">
                    <el-input-number :disabled="state.isDisabled" style="width: 100%" v-model="row.amount" :controls="false" :precision="2"
                        :placeholder="$t('请输入累计打码金额')" />
                </template>
            </el-table-column>
            <el-table-column v-if="state.currentIndex === +childTaskData[2].value" :label="$t('单局打码金额')" min-width="160" align="center">
                <template #default="{ row }">
                    <el-input-number :disabled="state.isDisabled" style="width: 100%" v-model="row.amount" :controls="false" :precision="2"
                        :placeholder="$t('请输入单局打码金额')" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('奖励金额')" min-width="160" align="center">
                <template #default="{ row }">
                    <div>
                        <el-input-number :disabled="state.isDisabled" style="width: 100%" v-model="row.reward" :controls="false" :precision="2"
                            :placeholder="$t('请输入奖励金额')" />
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('奖励活跃度')" min-width="160" align="center">
                <template #default="{ row }">
                    <el-input-number :disabled="state.isDisabled" style="width: 100%" v-model="row.point" :controls="false" :precision="0"
                        :placeholder="$t('请输入奖励活跃度')" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('任务介绍')" min-width="300" align="center">
                <template #default="{ row }">
                    <el-input :disabled="state.isDisabled" v-model="row.name" :placeholder="$t('请输入任务介绍')" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('奖励票券类型')" min-width="160" align="center">
                <template #default="{ row }">
                    <el-select :disabled="state.isDisabled" style="width: 100%" v-model="row.ticketType" :placeholder="$t('请选择票券类型')"
                        @change="row.ticketId = ''">
                        <el-option v-for="ims in metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column :label="$t('奖励票券')" min-width="200" align="center">
                <template #default="{ row }">
                    <el-select style="width: 100%" :disabled="state.isDisabled" filterable clearable v-model="row.ticketId"
                        :placeholder="$t('请选择票券')">
                        <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(row)" :key="ims.id" :label="ims.name"
                            :value="ims.id">
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column :label="$t('操作')" width="140" align="center" v-if="userData.isHasPermiss('merchant.user-task-config.addOrEditBase')">
                <template #default="{ $index }">
                    <el-button v-throttle :disabled="state.isDisabled" class="but" type="primary" @click="handleAdd($index)" :icon="Plus">
                    </el-button>
                    <el-button v-throttle :disabled="state.isDisabled" class="but" v-if="state.ruleData.length > 1" type="danger"
                        @click="handleDel($index)" :icon="Minus">
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="btn" v-permiss="'merchant.user-task-config.addOrEditBase'">
            <el-button v-throttle size="large" v-if="!state.isDisabled" @click="handleCancel">{{$t('取 消')}}</el-button>
            <el-button v-throttle style="margin-left:30px" type="primary" size="large" v-if="!state.isDisabled" @click="handleSave">{{$t('保 存')}}
            </el-button>
            <el-button v-throttle type="primary" size="large" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { reactive, defineExpose, computed, inject } from 'vue'
import userStore from '@/store/user'
import { Plus, Minus } from "@element-plus/icons-vue"
import { ElMessage } from 'element-plus'
import { deepClone } from '@/common/util'

const emits = defineEmits(['showRuleDialog', 'handleSubmit'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    taskType: {
        type: Number,
        default: 1
    },
})
const state = reactive({
    initData: {},
    ruleData: [
        { amount: undefined, point: undefined, reward: undefined, name: '', ticketType: 0, ticketId: '' }
    ],
    currentIndex: 13,
    isDisabled: true,
})
const userData = userStore()
const provideData = inject('provideData')

const childTaskData = computed(() => {
    return (props.taskType === 1 ? props.metaData.dayTaskType : props.metaData.weekTaskType)
})

const setData = (val, type) => {
    !!type && (state.isDisabled = true)
    if (!val.id) {
        state.currentIndex = childTaskData.value[0].value * 1
        state.initData = {}
        state.ruleData = [
            { amount: undefined, point: undefined, reward: undefined, name: '', ticketType: 0, ticketId: '' }
        ]
        state.isDisabled = false
        return
    }
    if (type === 2) state.currentIndex = childTaskData.value[0].value * 1
    state.initData = deepClone(val)
    if (Object.keys(val).length && val.rule && val.rule[state.currentIndex] && val.rule[state.currentIndex].length && !!type) {
        state.ruleData = val.rule[state.currentIndex]
    }
}

const handleTab = (val) => {
    if (state.currentIndex !== val) {
        state.currentIndex = val
        let { rule = '' } = state.initData
        state.ruleData = rule && rule[val] && rule[val].length ? deepClone(rule[val]) : [
            { amount: undefined, point: undefined, reward: undefined, name: '', ticketType: 0, ticketId: '' }
        ]
        // state.isDisabled = true
    }
}

const handleCancel = (val) => {
    state.isDisabled = true
    let { rule = '' } = state.initData
    state.ruleData = rule && rule[state.currentIndex] && rule[state.currentIndex].length ? deepClone(rule[state.currentIndex]) : [
        { amount: undefined, point: undefined, reward: undefined, name: '', ticketType: 0, ticketId: '' }
    ]
}

// 增加
const handleAdd = (index) => {
    state.ruleData.splice(index + 1, 0, {
        amount: undefined,
        point: undefined,
        reward: undefined,
        name: '',
        ticketType: 0,
        ticketId: ''
    })
}

// 删除
const handleDel = (index) => {
    state.ruleData.splice(index, 1)
}

const handleSave = () => {
    if (!state.initData.id) return ElMessage.warning($t('请先配置任务规则在进行操作！'))
    let arr = deepClone(state.ruleData).filter(item => typeof item.amount === 'number' || item.ticketId)
    let obj = state.initData.rule ? deepClone(state.initData.rule) : {}
    obj[state.currentIndex] = arr
    emits('handleSubmit', obj)
}

defineExpose({ setData })
</script>

<style lang="scss" scoped>
.task-deploy {
    .table-box {
        flex: 1;
    }
    .head {
        min-height: 10px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
        padding-right: 20px;
        .tab-box {
            white-space: nowrap;
            // width: 300px;
            height: 36px;
            border: 1px solid #409eff;
            border-radius: 2px;
            display: flex;
            margin: 0 20px;

            .tab-small {
                padding: 0 15px;
                min-width: 100px;
                // flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #409eff;
                padding: 0 10px;
            }

            .tab-small + .tab-small {
                border-left: 1px solid #409eff;
            }

            .active {
                color: #fff;
                background-color: #409eff;
            }
        }
    }
    .tips {
        padding-left: 5px;
        color: #666;
        line-height: 24px;
    }
    .but {
        width: 40px;
    }
    .btn {
        display: flex;
        justify-content: center;
        padding-top: 30px;
        .el-button {
            min-width: 80px;
        }
    }
}
</style>
