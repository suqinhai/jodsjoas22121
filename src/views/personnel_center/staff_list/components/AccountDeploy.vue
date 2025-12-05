<template>
    <!-- 人事列表-新增/修改 -->
    <Dialog ref="dialog" width="600" :title="state.title" top="10vh" buttonCenter @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '130px' : 'auto'">
            <el-form-item :label="$t('人员ID:')" v-if="props.itemData.id">
                <span>{{ state.formData.id }}</span>
            </el-form-item>
            <el-form-item :label="$t('登录账号:')" prop="username">
                <el-input :disabled="!!itemData.id" v-model="state.formData.username" :placeholder="$t('请输入登录账号')" />
            </el-form-item>
            <el-form-item :label="$t('登录密码:')" prop="password" :rules="[
                { required: !itemData.id, message: $t('请输入登录密码！'), trigger: 'blur' },
                {
                    pattern: PASSWORD_REG,
                    message: $t('请输入6~16个字符，支持字母、数字、符号！'),
                    trigger: 'change',
                },
            ]">
                <!-- <el-input v-model.trim="state.formData.password" :placeholder="$t('请输入登录密码')" show-password autocomplete="new-password" /> -->
                <el-input v-model.trim="state.formData.password" :placeholder="$t('请输入登录密码')" />
            </el-form-item>
            <el-form-item :label="$t('人员名称:')" prop="nickname">
                <el-input v-model="state.formData.nickname" :placeholder="$t('请输入昵称')" maxlength="20" show-word-limit />
            </el-form-item>
            <el-form-item :label="$t('工资接收账号:')">
                <el-input v-model="state.formData.walletAddr" :placeholder="$t('请输USDT钱包地址')"/>
            </el-form-item>
            <el-form-item :label="$t('来自哪里:')">
                <el-input v-model="state.formData.addr" />
            </el-form-item>
            <el-form-item :label="$t('所属角色:')" prop="roleId" v-if="!props.itemData.id || (props.itemData.id && isPremiss)">
                <el-select :disabled="!!state.formData.isAdmin" v-model="state.formData.roleId" :placeholder="$t('请选择角色')">
                    <el-option v-for="item in showRoleData" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('敏感信息隐藏:')">
                <div>
                    <el-checkbox :label="$t('不可查看')" v-model="state.formData.anonymous" />
                    <el-checkbox :label="$t('不可导出')" v-model="state.formData.limitExport" />
                    <el-checkbox :label="$t('不可编辑')" v-model="state.formData.limitEditSecret" />
                </div>
                <div>{{$t('敏感信息包括：手机号码，提现账号，提现姓名')}}</div>
            </el-form-item>
            <el-form-item :label="$t('商户顶部权限:')">
                <div>
                    <el-checkbox :label="$t('不可查看状态')" v-model="state.formData.limitMerStatus" />
                    <el-checkbox :label="$t('不可查看额度')" v-model="state.formData.limitMerAccount" />
                    <el-checkbox :label="$t('不可查看消息')" v-model="state.formData.limitMerInfo" />
                </div>
            </el-form-item>
            <el-form-item :label="$t('限制批量出款:')">
                <el-switch v-model="state.formData.batchCashLimit" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item :label="$t('人工单笔加款限额:')">
                <el-input-number :controls="false" :precision="0" :min="0" v-model="state.formData.rechargeAmountMax" :placeholder="$t('请输入人工单笔加款限额')"
                    style="width: 180px" />
                <span class="red">{{$t('注：包括会员余额修正-增加余额')}}</span>
            </el-form-item>
            <el-form-item :label="$t('人工单笔出款限额:')">
                <el-input-number v-model="state.formData.cashAmountMax" :placeholder="$t('请输入人工单笔出款限额')" :controls="false" :precision="0" :min="0"
                    style="width: 180px" />
            </el-form-item>
            <el-form-item :label="$t('管理站点:')" v-if="(isCanSetSite && commonData.merchantSiteList.length ) && (!props.itemData.id || (props.itemData.id && isPremiss))">
                <!-- <el-checkbox v-model="state.checkAllSite" @change="checkChange">{{$t('全部站点')}}</el-checkbox>
                <el-checkbox-group v-model="state.formData.sites">
                    <el-checkbox :disabled="state.checkAllSite" v-for="item in commonData.merchantSiteList" :key="item.id" :label="item.id">
                        {{ item.name }}
                    </el-checkbox>
                </el-checkbox-group> -->
                <!-- <el-select style="width: 100%" v-model="state.formData.sites" multiple filterable clearable :reserve-keyword="false"
                    :placeholder="$t('请选择站点')" @change="selectChange">
                    <el-option :label="$t('全部站点')" :value="0" />
                    <el-option :disabled="state.formData.sites.includes(0)" v-for="item in commonData.merchantSiteList" :key="item.id"
                        :label="item.name + `（ID：${item.id}）`" :value="item.id" />
                </el-select> -->
                <MerchantSiteSelect style="width: 100%" multiple isShowAll v-model="state.formData.sites"></MerchantSiteSelect>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { addAccountData, editAccountData } from '@/api/manage_config'
import { PASSWORD_REG } from '@/common/util/appConfig'
import userStore from '@/store/user'
const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    roleList: {
        type: Array,
        default: () => [],
    },
    merchantSiteList: {
        type: Array,
        default: () => [],
    },
    itemData: {
        type: Object,
        default: () => {
            return {}
        },
    }
})
const userData = userStore()
const commonData = commonStore()
const dialog = ref(null)
const deployForm = ref(null)
const state = reactive({
    checkAllSite: false,
    formData: {
        batchCashLimit: 1,
        rechargeAmountMax: 0,
        sites: [0],
        anonymous:[]
    },
    title: $t('创建账号'),
    rules: {
        username: [
            { required: true, message: $t('请输入登录账号！'), trigger: 'blur' },
            {
                pattern: /^[a-zA-Z][a-zA-Z0-9]{3,15}$/,
                message: $t('请输入4~16位英文数字组合，且必须以字母开头！'),
                trigger: 'change',
            },
        ],
        nickname: [
            { required: true, message: $t('请输入昵称！'), trigger: 'blur' },
            {
                pattern: /^[a-zA-Z0-9]{1,20}$/,
                message: $t('请输入1~20位英文数字组合！'),
                trigger: 'change',
            }
        ],
        roleId: [{ required: true, message: $t('请选择角色！'), trigger: 'change' }],
    }
})

const isCanSetSite = computed(() => {
    return props.roleList.find(item => item.id === state.formData.roleId)?.canSetSite || ''
})
const showRoleData = computed(() => {
    return props.itemData.roles && props.itemData.roles.length ? props.itemData.roles : props.roleList
})

onMounted(() => {
    state.formData = { ...props.itemData }
    state.title = $t('创建账号')
    if (props.itemData.id) {
        let { sites, needAnonymous, batchCashLimit, roleId, roleName } = props.itemData
        state.title = $t('修改账号')
        // if (sites) {
        //     state.checkAllSite = sites.includes(0)
        // }
        state.formData.anonymous = needAnonymous 
        state.formData.batchCashLimit = batchCashLimit ? 1 : 0
        // if (props.roleList.every(item => item.id !== roleId)) state.formData.roleId = roleName
    }
})

const isPremiss = computed(() => {
    return userData.userInfo.asSuper
})

// const checkChange = (val) => {
//     if (val) {
//         state.formData.sites = [0]
//     } else {
//         state.formData.sites = []
//     }
// }

const selectChange = (val) => {
    if (val && val.length > 1 && val.includes(0)) {
        state.formData.sites = [0]
    }
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { batchCashLimit, cashAmountMax, nickname, rechargeAmountMax, roleId, username, anonymous, limitExport, limitEditSecret, limitMerStatus, limitMerAccount, limitMerInfo, addr, walletAddr, password, id, sites, merchantId } = state.formData
            let params = { batchCashLimit, cashAmountMax, nickname, rechargeAmountMax, roleId, username, anonymous, limitExport, limitEditSecret, limitMerStatus, limitMerAccount, limitMerInfo, addr, walletAddr, password, id }
            if (isCanSetSite.value && sites && sites.length) params.merchantScope = sites.join(',')
            // if (roleId === props.itemData.roleName) params.roleId = props.itemData.roleId
            let api = editAccountData
            if (!id) {
                api = addAccountData
                params.status = 1
            } else {
                params.merchantId = merchantId
            }
            params.anonymous = params.anonymous?1:0
            params.limitExport = params.limitExport?1:0
            params.limitEditSecret = params.limitEditSecret?1:0
            params.limitMerStatus = params.limitMerStatus?1:0
            params.limitMerAccount = params.limitMerAccount?1:0
            params.limitMerInfo = params.limitMerInfo?1:0
            dialog.value.showLoading()
            api(params).then(() => {
                cancel()
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
.red {
    color: red;
    margin-left: 8px;
}
</style>
