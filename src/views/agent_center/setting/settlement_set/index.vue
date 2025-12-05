<template>
    <!-- 代理设置-结算设置 -->
    <div class="tabs-main settlement-set">
        <el-form ref="deployForm" :disabled="state.isDisabled" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '200px' : 'auto'">
            <el-form-item :label="$t('结算周期:')">{{$t('日（正常结算为第二天的凌晨2点开始结算）')}}</el-form-item>
            <el-form-item :label="$t('佣金领取时间:')" prop="receiveTime">
                <div>
                    <el-time-picker style="width: 200px;margin-right:10px" v-model="state.formData.receiveTime" is-range value-format="HH:mm:ss"
                        :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" />{{$t('佣金结算后在前台可以手动领取的时间范围')}}</div>
            </el-form-item>
            <el-form-item :label="$t('稽核倍数:')" prop="multiple">
                <el-input-number v-model="state.formData.multiple" style="width: 200px;margin-right:10px" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入稽核倍数')" />{{$t('佣金需要达到的流水倍数')}}</el-form-item>
        </el-form>
        <div class="tips mt20">
            <div>{{ $t('说明：') }}</div>
            <div>{{ $t('佣金提现时间：') }}</div>
            <div>{{ $t('在业绩结算后（次日凌晨2点），玩家需要在系统设置的特定时间段内提现，并一次提取全部可领取佣金。') }}</div>
            <div>{{ $t('如配置佣金领取时间10：00 - 22：00，即上一日的分成最终金额在今日凌晨2点全部结算清楚并同步玩家推广赚钱的界面显示，且玩家在10：00 - 22：00时间段内皆可提现，玩家不提现，金额可以逐日累积且随时能提现。') }}</div>
        </div>
        <div class="foot" v-permiss="'admin.meta.edit-3'">
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="emits('getData')">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, watch, defineExpose } from 'vue'

const emits = defineEmits(['submit', 'getData'])
const props = defineProps({
    deployData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    isDisabled: true,
    formData: {},
    rules: {
        receiveTime: [{ required: true, message: $t('请设置佣金领取时间！'), trigger: 'change' }],
        multiple: [{ required: true, message: $t('请输入稽核倍数！'), trigger: 'blur' }],
    }
})
const deployForm = ref(null)

watch(
    () => props.deployData,
    (val) => {
        if (!Object.keys(val).length) return
        deployForm.value && deployForm.value.resetFields()
        let { cashLimitBeginTime, cashLimitEndTime, multiple } = JSON.parse(val.value)
        state.formData.receiveTime = [cashLimitBeginTime, cashLimitEndTime]
        state.formData.multiple = multiple
        state.isDisabled = true
    },
    { immediate: true }
)

const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = props.deployData.value ? JSON.parse(props.deployData.value) : {}
            let { receiveTime, multiple } = state.formData
            params.multiple = multiple
            params.cashLimitBeginTime = receiveTime[0]
            params.cashLimitEndTime = receiveTime[1]
            params.operateType = 1
            emits('submit', params)
        } else {
            ElMessage.warning($t('请完善配置内容再进行提交！'))
        }
    })
}

defineExpose({
    'success': () => { state.isDisabled = true }
})
</script>

<style lang="scss">
.settlement-set {
    width: 880px;
    .foot {
        margin-top: 50px;
        width: 400px;
        display: flex;
        justify-content: flex-end;
    }
    .tips {
        padding-left: 120px;
    }
}
</style>
