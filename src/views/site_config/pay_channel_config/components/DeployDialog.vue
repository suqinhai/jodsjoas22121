<template>
    <!-- 站点配置-支付通道配置-新增/编辑支付平台 -->
    <Dialog ref="dialog" width="700" :title="state.title" top="5vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" class="deploy-form" :model="state.formData" :rules="state.rules" label-width="auto">
            <el-form-item :label="$t('支付通道:')" v-if="!itemData.edit" prop="channel">
                <el-select :disabled="!!itemData.channel_" v-model="state.formData.channel" filterable :placeholder="$t('请选择支付通道')"
                    @change="getFormKey">
                    <el-option v-for="item in state.payChannel" :key="item.value" :label="item.defName" v-show="item.value !== '0'"
                        :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('支付通道:')" v-else>
                {{itemData.channel_}}
            </el-form-item>
            <template v-if="type === 1">
                <el-form-item :label="$t('支付方式:')" prop="payScopes" :rules="{ required: true, message: $t('请设置支付方式！'), trigger: 'change' }">
                    <el-checkbox-group v-model="state.formData.payScopes">
                        <el-checkbox v-for="item in state.payTypeData" :key="item.value" :value="+item.value" :label="+item.value">{{ item.label }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </template>
            <template v-if="type === 0">
                <el-form-item :label="$t('支付方式:')" prop="payScopes" :rules="{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }">
                    <el-select v-model="state.formData.payScopes" filterable :placeholder="$t('请选择支付方式')">
                        <el-option v-for="(item,index) in payScopeList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
            </template>
            <el-form-item v-for="item in state.keyData" :key="item.name" :label="item.label + ':'" :prop="'config.' + item.name"
                :rules="[{ required: item.required, message: $t('请输入') + item.label +'！', trigger: 'blur' }]">
                <el-input v-model="state.formData.config[item.name]" style="width: 100%"
                    :type="['merchantId','realName'].includes(item.name) ? '' : 'textarea'" :rows="4" :placeholder="item.placeholder"
                    :show-word-limit="item.name === 'remark'" :maxlength="item.name === 'remark' ? 500 : ''" />
                <span class="red" v-if="item.name === 'merchantPrivateKey'">{{$t('请确认商户私钥配置，并在三方后台配置对应公钥')}}</span>
                <span class="red" v-if="item.name === 'remark'">{{$t('注：可输入开户行等信息（显示为前端内容）')}}</span>
            </el-form-item>
            <el-form-item :label="$t('备注:')">
                <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')" v-model="state.formData.desc" show-word-limit
                    maxlength="255" />
            </el-form-item>
            <el-form-item :label="$t('是否启用:')" v-if="state.isShowEnabled">
                <el-switch v-model="state.formData.enabled" />
                <div v-if="type === 1" style="color: #F94D64">{{$t('提示：启用后将会调用第三方接口检测配置')}}</div>
            </el-form-item>
            <el-form-item :label="$t('支持站点:')" v-if="merchantSiteList.length" prop="scopes">
                <MerchantSiteSelect :optionData="merchantSiteList" style="width: 100%" multiple isShowAll :isClassify="false"
                    v-model="state.formData.scopes">
                </MerchantSiteSelect>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { getFormConfig, addMerchantPayConfig, editMerchantPayConfig, getPayChannelList } from '@/api/finance'
import { deepClone } from '@/common/util'

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
    payScopeList: {
        type: Array,
        default: () => []
    },
    type: {
        default: 1,
    }
})
const dialog = ref(null)
const deployForm = ref(null)
const state = reactive({
    title: '',
    keyData: [],
    formData: {
        enabled: 0,
        config: {},
        scopes: [],
    },
    rules: {
        channel: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        scopes: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        name: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        account: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
    },
    payChannel: [],
    payTypeData: [],
    isShowEnabled: true,
})
const userData = userStore()

onMounted(() => {
    if (props.type === 1) {
        state.title = props.itemData.edit ? $t('编辑在线支付平台') : $t('新增在线支付平台')
    } else {
        state.title = props.itemData.edit ? $t('编辑转账支付平台') : $t('新增转账支付平台')
    }
    dialog.value.showLoading()
    getPayChannelList({ tab: props.type }).then(res => {
        if (res.data && res.data.length) {
            state.payChannel = res.data.filter(item => +item.value)
        }
        if (!props.itemData.edit && state.payChannel.length) {
            state.formData.channel = +state.payChannel[0].value
            state.payTypeData = state.payChannel[0].payTypes || []
        }
        if (props.itemData.edit) {
            state.payTypeData = props.itemData.payTypes
            state.formData = deepClone(props.itemData)
            if (!state.formData.scopes) state.formData.scopes = [0]
            if (!props.type) state.formData.payScopes = props.itemData.payScopes[0]
        }
        if (props.type && (!state.formData.payScopes || !state.formData.payScopes.length)) {
            state.formData.payScopes = state.payTypeData.map(item => +item.value)
        }
        getFormKey(state.formData.channel)
    }).catch(() => {
        dialog.value.closeLoading()
    })
})

const getFormKey = (channel) => {
    let sameObj = state.payChannel.find((item) => {
        return item.value == channel
    })
    if (!props.itemData.edit) {
        state.payTypeData = sameObj.payTypes || []
        !!props.type && (state.formData.payScopes = state.payTypeData.map(item => +item.value))
    }
    dialog.value.showLoading()
    state.isShowEnabled = sameObj?.setting?.r || false
    getFormConfig({ channel }).then(res => {
        if (res.data?.length) {
            res.data.forEach(item => {
                if (item.name === 'publicKey') {
                    item.placeholder = $t('输入') + item.label + $t('，从三方支付后台获取')
                } else if (item.name === 'merchantPrivateKey') {
                    item.placeholder = $t('输入') + item.label + $t('，商户自己根据三方支付要求的规则生成，生成的私钥配置在这里，公钥配置到三方支付后台')
                } else {
                    item.placeholder = $t('输入') + item.label
                }
            })
        }
        state.keyData = res.data
        dialog.value.closeLoading()
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            if (params.scopes.includes(0)) delete params.scopes
            if (params.scopes) params.scopes = params.scopes.join(',')
            if (props.type === 1) params.payScopes = params.payScopes.join(',')
            let api = params.channel_ ? editMerchantPayConfig : addMerchantPayConfig
            dialog.value.showLoading()
            api(params).then(res => {
                cancel()
                emits('fetchData')
            }).catch(err => {
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
.deploy-form {
    .el-form-item__label {
        text-align: right;
    }
}
.red {
    color: #f94d64;
}
</style>
