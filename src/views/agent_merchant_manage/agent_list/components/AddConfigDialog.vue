<template>
    <!-- 代理商列表-新增代理商 -->
    <Dialog ref="dialog" width="900" :title="$t('新增代理商-') + (isBetMode ? $t('打码模式（NEWPG、NEWjili、NEWPP）'): $t('损益模式'))" top="10vh"
        :operateActions="[$t('取消'), $t('提交')]" @confirm="confirmEdit(addFrom)" @cancel="cancel">
        <el-form ref="addFrom" :model="form" :label-width="$locale == 'zh' ? '170px' : 'auto'" :rules="form.rules">
            <el-form-item :label="$t('后台登录账号:')" prop="username">
                <el-input v-model="form.username" :placeholder="$t('请输入用户名是4~16位，且必须以字母开头！')" :maxlength="20" />
            </el-form-item>
            <el-form-item :label="$t('后台登录密码:')" prop="password">
                <el-input v-model="form.password" :placeholder="$t('请输入密码是6~20个字符，支持字母/数字/符号！')" :maxlength="20" />
            </el-form-item>
            <el-form-item :label="$t('会员ID:')" prop="userId">
                <el-input :disabled="state.isSearch" @input="(val) => form.userId = val.replace(/\D/g,'')" v-model="form.userId"
                    style="width: 370px;margin-right: 10px" :placeholder="$t('输入绑定代理的会员ID，进行搜索确认会员存在')" />
                <el-button v-throttle type="primary" @click="handleSearch">{{state.isSearch ?$t('重 置'): $t('搜 索')}}</el-button>
            </el-form-item>
            <el-row v-if="state.memberInfo.id">
                <el-col :span="9">
                    <el-form-item :label="$t('会员ID:')">
                        <span>{{state.memberInfo.id}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="15">
                    <el-form-item :label="$t('会员账号:')">
                        <span>{{state.memberInfo.name}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item :label="$t('rtp > 100抽成%:')" prop="rtpUpRate" v-if="isBetMode">
                <el-input-number class="special-input" v-model="form.rtpUpRate" :max="100" :controls="false" :min="0"
                    :placeholder="$t('请输入rtp > 100抽成%')" style="width: 100%;" />
            </el-form-item>
            <el-form-item :label="$t('rtp < 100抽成%:')" prop="rtpDnRate" v-if="isBetMode">
                <el-input-number class="special-input" v-model="form.rtpDnRate" :max="100" :controls="false" :min="0"
                    :placeholder="$t('请输入rtp < 100抽成%')" style="width: 100%;" />
            </el-form-item>
            <el-form-item :label="$t('游戏抽成%:')" prop="playRate">
                <el-input-number class="special-input" v-model="form.playRate" :controls="false" :min="0" :placeholder="$t('请输入')" />
                <div>{{$t('建议配置不可超过100%')}}</div>
            </el-form-item>
            <el-form-item :label="$t('分成比例%:')" prop="shareRate">
                <el-input-number class="special-input" v-model="form.shareRate" :controls="false" :min="0" :placeholder="$t('请输入')" />
                <div>{{$t('建议配置不可超过100%')}}</div>
            </el-form-item>
            <el-form-item :label="$t('充值支付通道费率%:')" prop="payRate">
                <el-input-number class="special-input" v-model="form.payRate" :controls="false" :min="0" :placeholder="$t('请输入')" />
                <div>{{$t('建议配置不可超过2%')}}</div>
            </el-form-item>
            <!-- 		<el-form-item :label="$t('出款审核开关:')">
			    <el-switch v-model="form.cashOpen" :active-value="1" :inactive-value="0" />
			</el-form-item> -->
            <el-form-item :label="$t('会员角色:')" prop="roleId">
                <el-select v-model="form.roleId">
                    <el-option v-for="(item,index) in form.roleList" :key="index" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted, computed, ref } from 'vue'
import { postAddAagentManage } from '@/api/agent_system'
import userStore from '@/store/user'
import { getUserBaseDetail, getCommonMeta } from '@/api/common'

const addFrom = ref(null)
const dialog = ref(null)
const userData = userStore()
const emits = defineEmits(['close', 'refresh'])
const state = reactive({
    isSearch: false,
    memberInfo: {}
})
const form = reactive({
    cashOpen: false,
    roleList: [],
    rules: {
        username: [{ required: true, message: $t('请输入后台登录账号'), trigger: 'change' }],
        password: [{ required: true, message: $t('请输入后台登录密码'), trigger: 'change' }],
        userId: [{ required: true, message: $t('请输入会员ID'), trigger: 'change' }],
        rtpUpRate: [{ required: true, message: $t('请输入rtp > 100抽成%'), trigger: 'change' }],
        rtpDnRate: [{ required: true, message: $t('请输入rtp < 100抽成%'), trigger: 'change' }],
        playRate: [{ required: true, message: $t('请输入游戏抽成%'), trigger: 'change' }],
        shareRate: [{ required: true, message: $t('请输入分成比例%'), trigger: 'change' }],
        payRate: [{ required: true, message: $t('请输入充值支付通道费率%'), trigger: 'change' }],
        roleId: [{ required: true, message: $t('请选择所属角色'), trigger: 'change' }]
    }
})

onMounted(() => {
    getRoleData()
})

const isBetMode = computed(() => {
    return userData.siteInfo.commissionMode && userData.siteInfo.commissionMode === 2
})

const getRoleData = async () => {
    let res = await getCommonMeta({ types: 'agentRoleItems' })
    form.roleList = res.data?.agentRoleItems || []
}

const handleSearch = () => {
    if (state.isSearch) {
        form.userId = undefined
        state.memberInfo = {}
        state.isSearch = false
    } else {
        if (!form.userId) {
            return ElMessage.warning($t('请输入会员ID再进行搜索！'))
        }
        dialog.value.showLoading()
        getUserBaseDetail({ id: form.userId }).then((res) => {
            if (res.data) {
                state.memberInfo = res.data
                state.isSearch = true
            } else {
                ElMessage.warning($t('未查询到此会员ID信息！'))
            }
            dialog.value.closeLoading()
        }).catch((data) => {
            dialog.value.closeLoading()
        })
    }
}

const confirmEdit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { username, password, userId, playRate, shareRate, payRate, rtpUpRate, rtpDnRate, cashOpen, roleId } = form
            let data
            isBetMode ? data = { username, password, userId, playRate, shareRate, payRate, rtpUpRate, rtpDnRate, cashOpen, roleId }
                : data = { username, password, userId, playRate, shareRate, payRate, cashOpen, roleId }
            if (rtpUpRate?.toString().length > 8) {
                return ElMessage.warning($t('rtp > 100抽成的值最多为6位小数'))
            }
            if (rtpDnRate?.toString().length > 8) {
                return ElMessage.warning($t('rtp < 100抽成的值最多为6位小数'))
            }
            if (playRate?.toString().length > 8) {
                return ElMessage.warning($t('游戏抽成的值最多为6位小数'))
            }
            if (shareRate?.toString().length > 8) {
                return ElMessage.warning($t('分成比例的值最多为6位小数'))
            }
            if (payRate?.toString().length > 8) {
                return ElMessage.warning($t('充值支付通道费率的值最多为6位小数'))
            }
            dialog.value.showLoading()
            postAddAagentManage(data).then(res => {
                if (res.code === 0) {
                    emits('close')
                    emits('refresh')
                }
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

<style lang='scss'>
.red {
    color: red;
}
</style>