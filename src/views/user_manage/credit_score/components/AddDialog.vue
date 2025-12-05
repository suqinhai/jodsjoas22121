<template>
    <!-- 用户管理-信誉管理-修改 -->
    <Dialog ref="dialog" width="600" :title="$t('修改')" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)"
        @cancel="cancel">
        <el-form ref="deployFormRef" class="create-order" :model="state.formData" :rules="state.rules"
            :label-width="$locale == 'zh' ? '120px' : 'auto'">
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
            <el-form-item :label="$t('信誉分:')" prop="score">    
                <el-input-number :placeholder="$t('请输入整数0-100')" :controls="false" :max="100" :min="0" v-model="state.formData.score" style="width: 210px;margin-right: 10px"></el-input-number>
            </el-form-item>
            <el-form-item :label="$t('个人显示开关:')">
                <el-checkbox v-model="state.formData.creditSwitch" :label="$t('开启')" :true-label="1" :false-label="0" @change="changeCreditSwitch"></el-checkbox>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { postPromotionAccountData } from '@/api/member'
import { getUserBaseDetail } from '@/api/common'
import { ref, reactive, onMounted } from 'vue'
import userStore from '@/store/user'
import {getCreditList, postCreditEdit, postCreditImport } from '@/api/member'

const userData = userStore()
const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    isBatch: {
        type: Boolean,
        default: false
    }
})
const state = reactive({
    isSearch: false,
    formData: {
    },
    memberInfo: {},
    rules: {
        userId: { required: true, message: $t('请输入会员ID！'), trigger: 'blur' },
        score: { required: true, message: $t('请输入信誉分！'), trigger: 'change' },
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)

onMounted(() => {
    let { id, user, score, status } = props.itemData
    if (id) {
        state.formData = {
            id: id,
            userId: user.id,
            score: score || 0,
            creditSwitch: status,
        }
        state.memberInfo.id = user.id
        state.memberInfo.name = user.name
        state.isSearch = true
    }
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
            let {creditScore, creditStatus} = res?.ext
            if (res.data) {
                state.memberInfo = res.data
                state.isSearch = true
                state.formData.score = creditScore
                state.formData.creditSwitch = creditStatus
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
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            const params = {
                ids: props.itemData.id ? state.formData.id : state.memberInfo.id,
                score: state.formData.score,
                status: state.formData.creditSwitch,
            }
            postCreditEdit(params).then(() => {
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
