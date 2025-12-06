<template>
    <!-- 推广账号设置-新增/修改 -->
    <Dialog ref="dialog" width="600" :title="!itemData.id ? $t('搜索新增已有账号'):$t('修改')" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)"
        @cancel="cancel">
        <el-form ref="deployFormRef" class="create-order" :model="state.formData" :rules="state.rules"
            :label-width="$locale == 'zh' ? '100px' : 'auto'">
            <el-form-item :label="$t('会员ID:')" prop="userId" v-if="!itemData.id">
                <el-input :disabled="state.isSearch" @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    style="width: 210px;margin-right: 10px" :placeholder="$t('请输入会员ID')" />
                <el-button v-throttle type="primary" @click="handleSearch">{{state.isSearch ?$t('重 置'): $t('搜 索')}}</el-button>
            </el-form-item>
            <el-row>
                <el-col :span="11">
                    <el-form-item :label="$t('会员ID:')">
                        <span>{{state.memberInfo.id}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="13">
                    <el-form-item :label="$t('会员账号:')">
                        <span>{{state.memberInfo.name}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item :label="$t('游戏限制:')">{{$t('只可进、TTT、、游戏')}}
                <!-- <el-radio-group v-model="state.formData.playLimit">
                    <el-radio :label="0">{{$t('无')}}</el-radio>
                    <el-radio :label="1">{{$t('游戏限制（只可进游戏）')}}</el-radio>
                </el-radio-group> -->
            </el-form-item>
            <el-form-item :label="$t('禁止提现:')">
                <el-switch v-model="state.formData.cashLimit" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item :label="$t('添加金额:')" prop="amount">
                <el-input-number v-if="!userData.userInfo.rechargeAmountMax && userData.userInfo.rechargeAmountMax != 0" style="width: 400px"
                    v-model="state.formData.amount" :controls="false" :precision="2" :min="0.01" :max="999999999999" :placeholder="$t('请输入大于0的整数')" />
                <el-input-number v-else style="width: 400px" v-model="state.formData.amount" :controls="false" :precision="2" :min="0.01"
                    :max="999999999999" :placeholder="$t('请输入大于0的整数且不得大于单笔加款限额(') + userData.userInfo.rechargeAmountMax +')'" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { postPromotionAccountData } from '@/api/member'
import { getUserBaseDetail } from '@/api/common'
import { ref, reactive, onMounted } from 'vue'
import userStore from '@/store/user'

const userData = userStore()
const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    isSearch: false,
    formData: {
        cashLimit: 1,
        playLimit: 1,
    },
    memberInfo: {},
    rules: {
        userId: { required: true, message: $t('请输入会员ID！'), trigger: 'blur' },
        amount: [
            { required: true, message: $t('请输入金额！'), trigger: 'blur' },
            { type: 'number', max: userData.userInfo.rechargeAmountMax || userData.userInfo.rechargeAmountMax == 0 ? userData.userInfo.rechargeAmountMax : 999999999999, min: 1, message: $t('请输入正确的金额！'), trigger: 'change' }
        ],
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)

onMounted(() => {
    let { id, username, cashLimit } = props.itemData
    if (id) {
        state.formData = {
            userId: id,
            cashLimit,
            playLimit: 1,
        }
        state.memberInfo.id = id
        state.memberInfo.name = username
        state.isSearch = true
    }
    userData.getUserInfoDetail()
})

const handleSearch = () => {
    if (state.isSearch) {
        delete state.formData.userId
        state.memberInfo = {}
        state.isSearch = false
    } else {
        if (!state.formData.userId) {
            return ElMessage.warning($t('请输入会员ID再进行搜索！'))
        }
        dialog.value.showLoading()
        getUserBaseDetail({ id: state.formData.userId }).then((res) => {
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

const handleSubmit = (el) => {
    if (!state.memberInfo.id) return ElMessage.warning($t('请输入正确的会员ID再进行提交！'))
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postPromotionAccountData(state.formData).then(() => {
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

<style lang="scss">
.create-order {
}
</style>
