<template>
    <!-- 站点配置-广告埋点配置-Adjust配置-新增/编辑 -->
    <Dialog ref="dialog" width="580" :title="state.title" buttonCenter top="10vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '135px' : 'auto'">
          
            <div class="tips">{{$t('投放H5，应用类型选择H5，投放APP外跳H5，应用类型选择APP，选错类型会影响事件上报')}}</div>

            <el-form-item :label="$t('应用类型:')" prop="type">
                <el-select style="width: 100%" v-model="state.formData.type" :placeholder="$t('请选择应用类型')">
                    <el-option v-for="item in state.launchTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('应用标识:')" prop="name">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入应用标识')" />
            </el-form-item>
             <el-form-item :label="$t('应用备注:')" prop="remark">
                <el-input style="width: 100%" type="textarea" :rows="5" :placeholder="$t('请输入备注')" v-model="state.formData.remark" show-word-limit
                    maxlength="100" />
            </el-form-item>
            <el-form-item :label="$t('事件标识(注册):')" prop="registerEvent">
                <el-input v-model="state.formData.registerEvent" :placeholder="$t('请输入事件标识(注册)')" />
            </el-form-item>
            <el-form-item :label="$t('事件标识(首充):')" prop="firstPurchaseEvent">
                <el-input v-model="state.formData.firstPurchaseEvent" :placeholder="$t('请输入事件标识(首充)')" />
            </el-form-item>
            <el-form-item :label="$t('事件标识(复充):')" prop="purchaseEvent">
                <el-input v-model="state.formData.purchaseEvent" :placeholder="$t('请输入事件标识(复充)')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { postAdjustConfig, getAdjustDetail } from '@/api/data_center.js'

import { getDomainDnsConfig } from '@/api/common'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    channelPattern: {
        type: Array,
        default: () => [],
    },
})
const requiredRule = { required: true, trigger: ['change', 'blur'] }
const noChineseRule = { pattern: /^[a-zA-Z0-9]*$/, trigger: ['change', 'blur'] }
const maxLengthRule = { max: 20, trigger: ['change', 'blur'] }
const state = reactive({
    title: $t('新增'),
    launchTypeList: [
        {
            label: 'H5',
            value: 0,
        },
        {
            label: 'APP',
            value: 1,
        }
    ],
    formData: {
        id: '',
        type: '',
        name: '',
        remark: '',
        registerEvent: '',
        firstPurchaseEvent: '',
        purchaseEvent: '',
        merchantId: '',

    },
    
    rules: {
        type: [{ required: true, message: $t('请选择应用类型！'), trigger: 'change' }],
        name: [
            { ...requiredRule, message: $t('请输入应用标识！') },
            { ...noChineseRule, message: $t('只能输入字母和数字！') },
            { ...maxLengthRule, message: $t('最多输入20个字符！') }
        ],
        remark: [{ ...requiredRule, message: $t('请输入应用备注！') }],
        registerEvent: [
            { ...requiredRule, message: $t('请输入事件标识(注册)！') },
            { ...noChineseRule, message: $t('只能输入字母和数字！') },
            { ...maxLengthRule, message: $t('最多输入20个字符！') }
        ],
        firstPurchaseEvent: [
            { ...requiredRule, message: $t('请输入事件标识(首充)！') },
            { ...noChineseRule, message: $t('只能输入字母和数字！') },
            { ...maxLengthRule, message: $t('最多输入20个字符！') }
        ],
        purchaseEvent: [
            { ...requiredRule, message: $t('请输入事件标识(复充)！') },
            { ...noChineseRule, message: $t('只能输入字母和数字！') },
            { ...maxLengthRule, message: $t('最多输入20个字符！') }
        ],
    },
    domainDnsList: []
})
const commonData = commonStore()
const dialog = ref(null)
const operateForm = ref(null)

onMounted(() => {
    if (props.itemData.id) {
        let { type = '', name = '', remark = '', registerEvent = '', firstPurchaseEvent = '', purchaseEvent = '', id = '', merchantId = '' } = props.itemData

        state.formData = {
            ...state.formData,
            type,
            name,
            remark,
            registerEvent,
            firstPurchaseEvent,
            purchaseEvent,
            id,
            merchantId
        }
        state.title = $t('修改')
    } else {
        state.formData.merchantId = commonData.currentMerchantSite.id || ''
    }
})
const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postAdjustConfig(state.formData).then(() => {
                emits('close')
                emits('fetchData')
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}

</script>

<style scoped lang="scss">
.tips {
    font-size: 14px;
    color: var(--el-text-color-regular);
    line-height: 24px;
    margin-left: 60px;
    margin-bottom: 20px;
}

</style>
