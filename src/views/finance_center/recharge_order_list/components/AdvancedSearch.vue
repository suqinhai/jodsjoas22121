<template>
    <!-- 财务中心-充值订单列表-高级搜索 -->
    <Dialog width="600" :title="$t('高级搜索')" :isCancel="false" top="10vh" :operateActions="[$t('重置'), $t('确认')]" @confirm="handleSubmit"
        @cancel="cancel" @close="emits('close')">
        <el-form class="advanced-search" :model="state.formData" :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <!-- <div class="box"> -->
            <!-- <div class="box-small"> -->
            <el-form-item :label="$t('会员ID:')">
                <el-input v-model="state.formData.userId" :placeholder="$t('请输入会员会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('订单状态:')">
                <el-select clearable v-model="state.formData.status" style="width: 100%">
                    <el-option v-for="item in metaData.rechargeStatus" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('操作人:')">
                <el-input v-model="state.formData.registeredSource" :placeholder="$t('请输入操作人')" />
            </el-form-item>
            <el-form-item :label="$t('创建时间:')">
                <el-date-picker v-model="state.formData.createTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('成功时间:')">
                <el-date-picker v-model="state.formData.successTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>

            <el-form-item :label="$t('会员层级:')">
                <el-select clearable v-model="state.formData.memberRemark" style="width: 100%">
                    <el-option v-for="item in metaData.rechargeStatus" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('VIP等级:')">
                <el-select clearable v-model="state.formData.firstPayType" style="width: 100%">
                    <el-option v-for="item in metaData.userLevel" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('订单号:')">
                <el-input v-model="state.formData.orderNo" :placeholder="$t('请输入订单号')" />
            </el-form-item>
            <el-form-item :label="$t('订单金额:')">
                <el-input-number v-model="state.formData.orderAmountDown" style="width: 48%" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入整数')" />
                <span style="padding: 0 5px">-</span>
                <el-input-number v-model="state.formData.orderAmountUp" style="width: 48%" :controls="false" :precision="0"
                    :min="state.formData.orderAmountDown ? state.formData.orderAmountDown : 0" :placeholder="$t('请输入整数')" />

            </el-form-item>
            <el-form-item :label="$t('总上分金额:')">
                <el-input-number v-model="state.formData.scoreAmountDown" style="width: 48%" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入整数')" />
                <span style="padding: 0 5px">-</span>
                <el-input-number v-model="state.formData.scoreAmountUp" style="width: 48%" :controls="false" :precision="0"
                    :min="state.formData.scoreAmountDown ? state.formData.scoreAmountDown : 0" :placeholder="$t('请输入整数')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { deepClone, getShortcuts, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const emits = defineEmits(['fetchData', 'close', 'update:initData'])
const props = defineProps({
    initData: {
        type: Object,
        default: {}
    },
    metaData: {
        type: Object,
        default: {}
    }
})
const state = reactive({
    formData: {
        createTime: [],
        successTime: [],
        orderAmountDown: undefined,
        orderAmountUp: undefined,
        scoreAmountDown: undefined,
        scoreAmountUp: undefined,
    },
})

onMounted(() => {
    if (Object.keys(props.initData).length) {
        state.formData = deepClone(props.initData)
    }
})

const handleSubmit = () => {
    emits('close')
    let params = deepClone(state.formData)
    params.key = 'advancedSearch'
    let { createTime, successTime } = params
    if (createTime && createTime.length) {
        params['interval.begin'] = createTime[0]
        params['interval.end'] = createTime[1]
    }
    if (successTime && successTime.length) {
        params['accountBeginTime'] = successTime[0]
        params['accountEndTime'] = successTime[1]
    }
    delete params.createTime
    delete params.successTime
    emits('fetchData', params)
    emits('update:initData', state.formData)
}

const cancel = () => {
    state.formData = {
        createTime: [],
        successTime: [],
        orderAmountDown: undefined,
        orderAmountUp: undefined,
        scoreAmountDown: undefined,
        scoreAmountUp: undefined,
    }
    emits('update:initData', {})
}
</script>

<style lang="scss">
.advanced-search {
    .box {
        width: 100%;
        display: flex;
        justify-content: space-between;
        &-small {
            width: 450px;
        }
        .combine {
            > .el-form-item__content {
                display: flex;
                .combine-left {
                    width: 86px;
                }
                .combine-right {
                    width: 224px;
                }
                .combine-item {
                    .el-form-item__label {
                        width: 0 !important;
                        padding: 0;
                    }
                    .el-form-item__content {
                        margin-left: 0px !important;
                    }
                }
            }
        }
    }
}
</style>
