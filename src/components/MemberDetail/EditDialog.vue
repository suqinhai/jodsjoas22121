<template>
    <!-- 会员详情弹窗-提现账户-修改/新增 -->
    <Dialog ref="dialogRef" width="500" :title="itemData.channel_ === 'BANK_OFF' ? $t('线下转账') : itemData.channel_" buttonCenter top="12vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" class="add-member" :rules="state.rules" :model="state.formData" label-width="auto">
            <template v-if="itemData.channel !== 0">
                <el-form-item :label="$t('类型:')" prop="subtype" :rules="{ required: true, message: $t('请选择类型！'), trigger: 'change' }">
                    <el-select style="width: 100%" :disabled="!!itemData.id" v-model="state.formData.subtype" :placeholder="$t('请选择类型')">
                        <el-option v-for="item in itemData.cashAccountSubtype" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('支付方式:')" prop="bankCode" v-if="itemData.channel === 3">
                    <el-select style="width: 100%" :disabled="!!itemData.id" v-model="state.formData.bankCode" clearable :placeholder="$t('请选择支付方式')">
                        <el-option v-for="item in itemData.payScopeList" :key="item.label" :label="item.label" :value="item.label" />
                    </el-select>
                </el-form-item>
                
                <el-form-item :label="$t('姓名:')" prop="realName">
                    <el-input v-model="state.formData.realName" :placeholder="$t('请输入姓名')" maxlength="50"/>
                </el-form-item>
                <!-- <el-form-item :label="$t('姓名:')" prop="realName" v-if="country === 'CO' && ![1].includes(itemData.channel)">
                    <el-input v-model="state.formData.realName" :placeholder="$t('请输入姓名')" maxlength="50"/>
                </el-form-item> -->
                <el-form-item v-if="itemData.channel === 1 && country !== 'IN' && country !== 'CO'" :label="$t('账号:')" prop="accountNo" :rules="[{ required: true, message: $t('请输入账号！'), trigger: ['change', 'blur']},
            { pattern: keyObj[country].walletPattern,  message: keyObj[country].walletMessage, trigger: ['change', 'blur'], }]">
                    <el-input @change="(val) =>{ if(country != 'UZ') {state.formData.accountNo = val.replace(/\D/g,'')}}" v-model="state.formData.accountNo" maxlength="50"
                        :placeholder="keyObj[country].walletPlaceholder" />
                </el-form-item>
                <el-form-item v-if="itemData.channel === 1 && country == 'IN'" :label="$t('账号:')" prop="accountNo"
                    :rules="{ required: true, message: $t('请输入账号！'), trigger: ['change', 'blur']}">
                    <el-input v-model="state.formData.accountNo" :placeholder="$t('请输入账号')" maxlength="50" />
                </el-form-item>
                <el-form-item v-if="itemData.channel === 2" :label="$t('账号:')" prop="accountNo" :rules="[{ required: true, message: $t('请输入账号！'), trigger: ['change', 'blur']},
            { pattern: keyObj[country].bankPattern,  message: keyObj[country].bankMsg + '！', trigger:  ['change', 'blur'], }]">
                    <el-input @change="(val) => state.formData.accountNo = val.replace(/\D/g,'')" v-model="state.formData.accountNo" maxlength="50"
                        :placeholder="keyObj[country].bankMsg" />
                </el-form-item>
                <el-form-item v-if="itemData.channel === 3 && country == 'UZ'" :label="$t('账号:')" prop="accountNo"
                    :rules="[{ required: true, message: $t('请输入账号！'), trigger: ['change', 'blur']},{ pattern: /^[a-zA-Z0-9]{34}$/,  message: $t('账号请输入34位以内数字、字母组合！'), trigger: ['change', 'blur'], }]">
                    <el-input v-model="state.formData.accountNo" :placeholder="$t('请输入账号')" maxlength="50" />
                </el-form-item>
                <el-form-item v-else-if="itemData.channel === 3 && country !== 'VN'" :label="$t('账号:')" prop="accountNo"
                    :rules="[{ required: true, message: $t('请输入账号！'), trigger: ['change', 'blur']},{ pattern: /^\d{1,34}$/,  message: $t('账号请输入34位以内数字！'), trigger: ['change', 'blur'], }]">
                    <el-input v-model="state.formData.accountNo" :placeholder="$t('请输入账号')" maxlength="50" />
                </el-form-item>
                <el-form-item v-if="itemData.channel === 3 && country === 'VN'" :label="$t('账号:')" prop="accountNo"
                    :rules="[{ required: true, message: $t('请输入账号！'), trigger: ['change', 'blur']},{ pattern: keyObj[country].bankPattern,  message: keyObj[country].bankMsg + '！', trigger: ['change', 'blur'], }]">
                    <el-input v-model="state.formData.accountNo" :placeholder="$t('请输入账号')" maxlength="50" />
                </el-form-item>
                <el-form-item v-if="country === 'IN' && itemData.channel !== 3" label="IFSC:" prop="bankCode" :rules="[{ required: true, message: $t('请输入IFSC！'), trigger: ['change', 'blur']},
            { pattern: keyObj[country].codePattern,  message: keyObj[country].codeMsg + '！', trigger: ['change', 'blur'], }]">
                    <el-input v-model="state.formData.bankCode" :placeholder="keyObj[country].codeMsg" maxlength="50" />
                </el-form-item>
                <el-form-item 
                v-if="[1,3].includes(itemData.channel) && country === 'PK'" 
                :label="'CNIC:'" 
                prop="certNo"
                :rules="[
                    { required: true, message: $t('请输入身份证CNIC'), trigger: ['change', 'blur']},
                    { pattern: keyObj[country].cnicPattern,  message: keyObj[country].cnicMsg, trigger: ['change', 'blur'], }]">
                    <el-input v-model="state.formData.certNo" :placeholder="$t('请输入身份证CNIC')" maxlength="50" />
                </el-form-item>
                
                <el-form-item 
                v-if="country === 'CO' && [1].includes(itemData.channel) " 
                :label="'NEQUI:'" 
                prop="accountNo"
                :rules="[
                    { required: true, message: keyObj[country].walletMessage, trigger: ['change', 'blur']},
                    { pattern: keyObj[country].walletPattern,  message: keyObj[country].walletMessage, trigger: ['change', 'blur'], }]">
                    <el-input v-model="state.formData.accountNo" :placeholder="keyObj[country].walletPlaceholder" maxlength="50" />
                </el-form-item>

                <el-form-item 
                v-if="country === 'CO' && [1,2].includes(itemData.channel) " 
                :label="'CNIC:'" 
                prop="certNo"
                :rules="[
                    { required: true, message: keyObj[country].cnicMsg + '！', trigger: ['change', 'blur']},
                    { pattern: keyObj[country].cnicPattern,  message: keyObj[country].cnicMsg, trigger: ['change', 'blur'], }]">
                    <el-input v-model="state.formData.certNo" :placeholder="keyObj[country].cnicMsg" maxlength="50" />
                </el-form-item>

                <el-form-item 
                v-if="country === 'AR'&& itemData.channel_ === 'BANK'" 
                :label="'CUIT:'"
                prop="certNo">
                    <el-input v-model="state.formData.certNo" :placeholder="$t('请输入身份证号CUIT-11位数字')" maxlength="50" />
                </el-form-item>
            </template>
            <template v-if="itemData.channel === 0">
                <el-form-item :label="$t('协议:')" prop="subtype" :rules="{ required: true, message: $t('请选择协议！'), trigger: ['change', 'blur'] }">
                    <el-select style="width: 100%" :disabled="!!itemData.id" v-model="state.formData.subtype" :placeholder="$t('请选择协议')">
                        <el-option v-for="item in itemData.cashAccountSubtype" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('钱包地址:')" prop="accountNo" :rules="[{ required: true, message: $t('请输入钱包地址！'), trigger: ['change', 'blur']},
                { pattern: /^[a-zA-Z0-9]{34}$/,  message: $t('钱包地址请输入34位数字、字母组合！'), trigger: ['change', 'blur'], }]">
                    <el-input v-model="state.formData.accountNo" :placeholder="$t('请输入钱包地址')" maxlength="50" />
                </el-form-item>
            </template>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, defineEmits, defineProps, computed } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { postWithdrawAccount } from '@/api/member'

const keyObj = {
    PH: {
        walletPattern: /^0\d{10}$/,
        walletMessage: $t('账号请输入以0开头的11位数字！'),
        walletPlaceholder: $t('账号请输入以0开头的11位数字'),
        bankPattern: /^\d{16}$/,
        bankMsg: $t('账号请输入16位数字')
    },
    ID: {
        walletPattern: /^0\d{10,12}$/,
        walletMessage: $t('账号请输入以0开头的11~13位数字！'),
        walletPlaceholder: $t('账号请输入以0开头的11~13位数字'),
        bankPattern: /^\d{8,16}$/,
        bankMsg: $t('账号请输入8~16位数字')
    },
    IN: {
        bankPattern: /^\d{10,16}$/,
        bankMsg: $t('账号请输入10~16位数字'),
        codePattern: /^[a-zA-Z0-9]{11}$/,
        codeMsg: $t('IFSC请输入11位数字、字母组合'),
    },
    VN: {
        bankPattern: /^\d{5,20}$/,
        bankMsg: $t('账号请输入5~20位数字'),
    },
    PK: {
        walletPattern: /^0\d{10}$/,
        walletMessage: $t('账号请输入以0开头的11位数字！'),
        walletPlaceholder: $t('账号请输入以0开头的11位数字'),
        cnicPlaceholder: $t('请输入身份证CNIC'),
        cnicPattern: /^\d{13}$/,
        cnicMsg: $t('账号请输入13位数字'),
    },
    BD: {
        walletPattern: /^0\d{10}$/,
        walletMessage: $t('账号请输入以0开头的11位数字！'),
        walletPlaceholder: $t('账号请输入以0开头的11位数字'),
    },
    MX: {
        walletPattern: /^\d{18}$/,
        walletMessage: $t('账号请输入18位数字！'),
        walletPlaceholder: $t('账号请输入18位数字'),
    },
    NG: {
        walletPattern: /^\d{10}$/,
        walletMessage: $t('账号请输入10位数字！'),
        walletPlaceholder: $t('账号请输入10位数字'),
        bankPattern: /^\d{10}$/,
        bankMsg: $t('账号请输入10位数字'),
    },
    AR: {
        walletPattern: /^\d{22}$/,
        walletMessage: $t('账号请输入22位数字！'),
        walletPlaceholder: $t('账号请输入22位数字'),
        bankPattern: /^\d{22}$/,
        bankMsg: $t('账号请输入22位数字'),
        cnicPattern: /^\d{11}$/,
        cnicMsg: $t('请输入身份证号CUIT-{number}位数字', { number: '11' }),
    },
    CO: {
        walletPattern: /^\d{10}$/,
        walletMessage: $t('请输入NEQUI账号{number}位数字！', { number: '10' }),
        walletPlaceholder: $t('请输入NEQUI账号{number}位数字', { number: '10' }),
        bankPattern: /^\d{8,24}$/,
        bankMsg: $t('请输入账号{number}位数字', { number: '8~24' }),
        cnicPattern: /^\d{8,11}$/,
        cnicMsg: $t('请输入身份证号{number}位数', { number: '8~11' }),
    },
    UZ: {
        walletPattern: /^[a-zA-Z0-9]{1,34}$/,
        walletMessage: $t('请输入账号'),
        walletPlaceholder: $t('账号请输入34位以内数字、字母组合！'),
    },
}
const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    memberId: {
        default: ''
    },
    merchantId: {
        default: ''
    }
})
const userData = userStore()
const dialogRef = ref(null)
const deployForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        realName: [
            { required: true, message: $t('请输入姓名！'), trigger: 'blur' },
            { pattern: /^(?!\d+$).*$/u, message: $t('姓名不能为纯数字!'), trigger: ['blur', 'change']}
        ],
        firstName: [
            { required: true, message: $t('请输入姓'), trigger: ['blur', 'change']},
            { pattern: /^\S+$/, message: $t('姓不能包含空格'), trigger: ['blur', 'change']}
        ],
        lastName: [
            { required: true, message: $t('请输入名'), trigger: ['blur', 'change']}
        ],
    }
})

const country = computed(() => {
    return userData.merchantInfo.country || ''
})

onMounted(() => {
    state.formData = { ...props.itemData }
    if (state.formData.channel === 1 && state.formData.accountNo && !['IN', 'MX','NG','AR'].includes(country.value)) state.formData.accountNo = state.formData.accountNo.replace(userData.merchantInfo.phoneCode + '-', '')
    if (country.value === 'AR' && state.formData.channel_ === "BANK") {
        if (state.formData.bankCode) {
            state.formData.subtype = state.formData.bankCode;
        }
    }
    if (country.value === 'CO' && state.formData.channel_ === "BANK") {
        if (state.formData.bankCode) {
            state.formData.subtype = state.formData.bankCode;
        }
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            if (state.formData.channel === 1 && !['IN', 'MX','NG','AR','CO','UZ'].includes(country.value)) params.accountNo = userData.merchantInfo.phoneCode + '-' + params.accountNo
            // params.bankCode && (params.bankCode = params.bankCode.toUpperCase())
            params.account = params.accountNo
            params.userId = props.memberId
            params.merchantId = props.merchantId
            delete params.accountNo
            delete params.subtype_
            delete params.cashAccountSubtype
            delete params.payScopeList
            if ((userData.merchantInfo.country === 'AR' || userData.merchantInfo.country === 'CO') && params.channel_ === "BANK") {
                params.bankCode = params.subtype
                params.subtype = props.itemData.fixSubtype || ''
            }
            delete params.channel_
            params.fixSubtype && delete params.fixSubtype
            dialogRef.value.showLoading()
            postWithdrawAccount(params).then(res => {
                cancel()
                emits('fetchData', 'withdrawalRef')
            }).catch(err => {
                dialogRef.value.closeLoading()
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
</style>
