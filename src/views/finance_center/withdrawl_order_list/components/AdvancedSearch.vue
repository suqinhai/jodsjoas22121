<template>
    <!-- 财务中心-在线提现列表-高级搜索 -->
    <Dialog ref="dialog" width="600" :title="$t('高级搜索')" :isCancel="false" top="10vh" :operateActions="[$t('重置'), $t('确认')]" @confirm="handleSubmit"
        @cancel="cancel" @close="emits('close')">
        <el-form class="advanced-search" :model="state.formData" :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-form-item :label="$t('用户ID:')">
                <el-input v-model="state.formData.userId" :placeholder="$t('请输入用户ID')" />
            </el-form-item>
            <el-form-item :label="$t('订单号:')">
                <el-input v-model="state.formData.orderNo" :placeholder="$t('请输入订单号')" />
            </el-form-item>
            <el-form-item :label="$t('到账币种:')">
                <el-select clearable v-model="state.formData.currency" style="width: 100%" :placeholder="$t('请选择到账币种')">
                    <el-option label="BRL" value="BRL" />
                    <el-option label="USD" value="USD" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('提现金额:')">
                <el-input-number v-model="state.formData.min" style="width: 150px" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入提现金额')" @blur="inputBlur" />
                <span style="padding: 0 5px">-</span>
                <el-input-number v-model="state.formData.max" style="width: 150px" :controls="false" :precision="2" :min="0.01"
                    :placeholder="$t('请输入提现金额')" @blur="inputBlur" />
            </el-form-item>
            <el-form-item :label="$t('申请时间:')">
                <el-date-picker v-model="state.formData.createTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('VIP等级:')">
                <el-select clearable v-model="state.formData.level" style="width: 100%" :placeholder="$t('请选择VIP等级')">
                    <el-option v-for="item in metaData.userLevel" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <!-- <el-form-item :label="$t('提现方式:')">
                <el-select clearable v-model="state.formData.memberGrade" c style="width: 100%" :placeholder="$t('请选择提现方式')">
                    <el-option v-for="item in metaData.userLevel" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </el-form-item> -->
            <el-form-item :label="$t('支付通道:')">
                <el-select clearable filterable v-model="state.formData.channel" style="width: 100%" :placeholder="$t('请选择支付通道')">
                    <el-option v-for="item in metaData.payChannel" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <!-- <el-form-item :label="$t('会员提现次数:')">
                <el-select clearable v-model="state.formData.memberGrade" style="width: 100%" :placeholder="$t('请选择会员提现次数')">
                    <el-option :label="$t('首充提现')" :value="0" />
                    <el-option :label="$t('二次提现')" :value="1" />
                    <el-option :label="$t('其他')" :value="2" />
                </el-select>
            </el-form-item> -->
            <el-form-item :label="$t('订单状态:')">
                <el-select v-model="state.formData.status" clearable style="width: 100%" :placeholder="$t('请选择订单状态')">
                    <el-option v-for="item in metaData.cashStatus" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <!-- <el-form-item :label="$t('重复IP人数:')">
                <el-input-number v-model="state.formData.orderAmountDown" style="width: 197px" :controls="false" :precision="0"
                    :min="0" :placeholder="$t('请输入整数')" />
                <span style="padding: 0 5px">-</span>
                <el-input-number v-model="state.formData.orderAmountUp" style="width: 197px" :controls="false" :precision="0"
                    :min="state.formData.orderAmountDown ? state.formData.orderAmountDown : 0" :placeholder="$t('请输入整数')" />
            </el-form-item> -->
            <el-form-item :label="$t('收款人姓名:')">
                <el-input v-model="state.formData.realName" :placeholder="$t('请输入收款人姓名')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { deepClone, getShortcuts, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const emits = defineEmits(['fetchData', 'close', 'update:initData'])
const props = defineProps({
    merchantId: {
        default: 0,
    },
    initData: {
        type: Object,
        default: {}
    },
    metaData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    formData: {},
})

onMounted(() => {
    if (Object.keys(props.initData).length) {
        state.formData = deepClone(props.initData)
    }
})

const inputBlur = () => {
    let { max, min } = state.formData
    if (typeof min !== 'number' || typeof max !== 'number') return
    if (max < min) {
        state.formData.max = min
    }
}

const handleSubmit = () => {
    emits('close')
    let params = deepClone(state.formData)
    params.key = 'advancedSearch'
    if (params.createTime && params.createTime.length) {
        params['interval.begin'] = params.createTime[0]
        params['interval.end'] = params.createTime[1]
    }
    delete params.createTime
    emits('update:initData', state.formData)
    emits('fetchData', params)
}

const cancel = () => {
    state.formData = {}
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
