<template>
    <!-- 经销商配置-结算配置 -->
    <div class="dealer-settlement-config">
        <el-form ref="deployForm" :disabled="state.isDisabled" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '200px' : 'auto'">
            <el-form-item :label="$t('阶段周期:')">{{$t('日')}}</el-form-item>
            <el-form-item :label="$t('最低领取额度:')" prop="cashMinLimit">
                <el-input-number v-model="state.formData.cashMinLimit" :min="0.01" :precision="2" :controls="false"
                    :placeholder="$t('请输入最低领取额度')" />
            </el-form-item>
        </el-form>
        <div class="foot" v-permiss="'merchant.dealer.awardCfgEdit'">
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMetaData, postMetaData } from '@/api/common'

const props = defineProps({
    metaData: {
        type: Object,
        default: {}
    },
})
const deployForm = ref(null)
const state = reactive({
    isDisabled: true,
    id: '',
    formData: {},
    rules: {
        cashMinLimit: [{ required: true, message: $t('请输入最低领取额度！'), trigger: 'change' }]
    }
})

onMounted(() => {
    getData()
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 35 }).then(res => {
        let { data } = res
        if (data) {
            let obj = data[$t('经销商结算设置')]
            !!obj && (state.id = obj.id || '')
            if (obj && obj.value) {
                state.formData.cashMinLimit = JSON.parse(obj.value).cashMinLimit || undefined
            }
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch((err) => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 保存
const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            globalVBus.$emit('globalLoading', true)
            postMetaData({
                id: state.id,
                type: 35,
                label: $t('经销商结算设置'),
                config: JSON.stringify({ cashMinLimit: state.formData.cashMinLimit })
            }).then(() => {
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
.dealer-settlement-config {
    .foot {
        width: 240px;
    }
}
</style>