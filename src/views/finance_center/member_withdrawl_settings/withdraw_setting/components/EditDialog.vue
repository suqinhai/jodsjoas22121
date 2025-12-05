<template>
    <!-- 财务中心-会员提现配置-提现设置-修改 -->
    <Dialog ref="dialog" width="550" :title="$t('修改')" buttonCenter top="10vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form class="withdrawal-channel-deploy" ref="operateForm" :rules="state.rules" :model="state.formData"
            :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <el-form-item v-if="!state.formData.cashScopes.includes('BANK_OFF')" :label="$t('支付方式:')" prop="cashScopes"
                :rules="[{ required: true, message: $t('请设置支付方式！'), trigger: 'change' }]">
                <el-checkbox-group v-model="state.formData.cashScopes">
                    <el-checkbox v-for="item in itemData.payTypes" :key="item.value" :label="item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item v-if="(!itemData.asUsdt || country == 'UZ') && !state.formData.cashScopes.includes('BANK_OFF')" :label="$t('手续费:')" prop="fee">
                <el-input-number v-model="state.formData.fee" style="width: 150px;margin-right: 5px" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入手续费')" /> {{state.formData.rateType == 0 ? '%' : $t('如：配置2，提现10则实际到账8USDT') }}
            </el-form-item>
            <el-form-item :label="$t('是否开启通道:')" prop="status">
                <el-switch v-model="state.formData.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <!-- <el-form-item :label="$t('允许绑定账号数量:')" prop="accountNum">
                <el-input-number v-model="state.formData.accountNum" style="width: 150px" :min="0" :step-strictly="true"
                    :controls="false"/>
            </el-form-item> -->
            <el-form-item v-if="!state.formData.cashScopes.includes('BANK_OFF')" :label="$t('单笔限额:')" class="items-box">
                <el-form-item prop="cashMin" label-width="0">
                    <el-input-number style="width: 150px" v-model="state.formData.cashMin" :controls="false" :precision="2" :min="0"
                        :placeholder="$t('请输入单笔限额')" />
                </el-form-item>
                <span style="margin: 0 3px">~</span>
                <el-form-item prop="cashMax" label-width="0">
                    <el-input-number style="width: 150px" v-model="state.formData.cashMax" :controls="false" :precision="2" :min="0"
                        :placeholder="$t('请输入单笔限额')" />
                </el-form-item>
            </el-form-item>
            <el-form-item :label="$t('支持站点:')" v-if="merchantSiteList.length" prop="scopes">
                <MerchantSiteSelect :optionData="merchantSiteList" :isClassify="false" style="width: 100%" multiple isShowAll
                    v-model="state.formData.scopes">
                </MerchantSiteSelect>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted, computed } from 'vue'
import { postMerchantCashConfigData } from '@/api/finance'
import { deepClone } from '@/common/util'
import userStore from '@/store/user'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    merchantSiteList: {
        type: Array,
        default: () => []
    },
})
const userData = userStore()
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        cashScopes: [{ required: true, message: $t('请设置支付方式！'), trigger: 'change' }],
        fee: [{ required: true, message: $t('请输入手续费！'), trigger: 'blur' }],
        status: [{ required: true, message: $t('请选择是否开启通道！'), trigger: 'change' }],
        // accountNum: [{ required: true, message: $t('请输入允许绑定账号数量'), trigger: 'blur' }],
        cashMin: { required: true, message: $t('请输入单笔限额！'), trigger: 'blur' },
        cashMax: [
            { required: true, message: $t('请输入单笔限额！'), trigger: 'blur' },
            {
                validator: (rule, value, callback) => {
                    if (value >= 0 && state.formData.cashMin >= 0 && value < state.formData.cashMin) {
                        callback(new Error(`${$t('请输入大于等于')}${state.formData.cashMin}${$t('的数值！')}`))
                    } else {
                        callback()
                    }
                }, trigger: 'change'
            }
        ],
        scopes: [{ required: true, message: $t('请选择站点！'), trigger: 'blur' }],
    }
})

const country = computed(() => {
    return userData.merchantInfo.country
})

onMounted(() => {
    state.formData = { ...props.itemData }
    if (!props.itemData.scopes) state.formData.scopes = [0]
    if (Array.isArray(props.itemData.cashScopes)) {
        state.formData.cashScopes.filter(item => props.itemData.payTypes.some(its => its.value === item))
    } else {
        state.formData.cashScopes = props.itemData.payTypes.map(item => item.value)
    }
    // if (!props.itemData.cashScopeLabel || props.itemData.cashScopeLabel === '全部') {
    //     state.formData.cashScopes = props.itemData.payTypes.map(item => item.value)
    // } else {
    //     let arr = props.itemData.cashScopeLabel.split(',')
    //     state.formData.cashScopes = []
    //     arr.forEach(item => {
    //         props.itemData.payTypes.forEach(its => {
    //             if (its.label === item) state.formData.cashScopes.push(its.value)
    //         })
    //     })
    // }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            props.itemData.asUsdt && country.value != 'UZ' && (params.fee = 0)
            if (params.scopes.includes(0)) delete params.scopes
            if (params.scopes) params.scopes = params.scopes.join(',')
            if (params.cashScopes.includes('BANK_OFF')) {
                params.cashMin = 10
                params.cashMax = 50000
                params.fee = 0
            }
            if (params.cashScopes) params.cashScopes = params.cashScopes.join(',')
            dialog.value.showLoading()
            postMerchantCashConfigData(params).then(() => {
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

<style lang="scss">
.withdrawal-channel-deploy {
    .items-box {
        .el-form-item__content {
            display: flex;
            .el-form-item {
                width: 150px;
            }
            .el-form-item__label {
                display: none;
            }
        }
    }
}
</style>
