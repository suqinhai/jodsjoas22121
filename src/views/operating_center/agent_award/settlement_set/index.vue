<template>
    <!-- 代理奖励-结算设置 -->
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
        <div class="foot" v-permiss="'admin.meta.edit-3'">
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="emits('getData')">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMetaData, postMetaData } from "@/api/common.js"

const state = reactive({
    isDisabled: true,
    deployData: {},
    formData: {},
    rules: {
        receiveTime: [{ required: true, message: $t('请设置佣金领取时间！'), trigger: 'change' }],
        multiple: [{ required: true, message: $t('请输入稽核倍数！'), trigger: 'blur' }],
    }
})
const deployForm = ref(null)

onMounted(() => {
    getData()
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 3 }).then((res) => {
        if (res.data) {
            let arr = Object.values(res.data)
            if (arr[0] && arr[0].id) {
                state.deployData = arr[0]
                if (!Object.keys(state.deployData).length) return
                deployForm.value && deployForm.value.resetFields()
                let { cashLimitBeginTime, cashLimitEndTime, multiple } = JSON.parse(state.deployData.value)
                state.formData.receiveTime = [cashLimitBeginTime, cashLimitEndTime]
                state.formData.multiple = multiple
            }
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let obj = state.deployData.value ? JSON.parse(state.deployData.value) : {}
            let { receiveTime, multiple } = state.formData
            obj.multiple = multiple
            obj.cashLimitBeginTime = receiveTime[0]
            obj.cashLimitEndTime = receiveTime[1]
            let params = {
                config: JSON.stringify(obj),
                type: 3,
                name: 'agent_settle_config',
                label: $t('代理结算设置'),
                id: state.deployData.id || '',
            }
            globalVBus.$emit('globalLoading', true)
            postMetaData(params).then(() => {
                getData()
            }).catch(() => {
                globalVBus.$emit('globalLoading', false)
            })
        } else {
            ElMessage.warning($t('请完善配置内容再进行提交！'))
        }
    })
}
</script>

<style lang="scss">
.settlement-set {
    width: 800px;
    .foot {
        margin-top: 50px;
        width: 400px;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
