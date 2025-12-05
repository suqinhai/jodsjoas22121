<template>
    <!-- 会员调控-数据列表（专业模式）-新增/编辑会员控制 -->
    <Dialog ref="dialog" width="500" :title="state.title" top="10vh" :isCancel="!itemData.userIds" :operateActions="state.operateActions"
        @confirm="handleSubmit(deployFormRef)" @cancel="cancel" @close="emits('close')">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('会员ID:')" prop="userIds" v-if="!itemData.userIds">
                <el-input :disabled="state.isSearch" @input="(val) => state.formData.userIds = val.replace(/\D/g,'')" v-model="state.formData.userIds"
                    style="width: 250px;margin-right: 10px" :placeholder="$t('请输入会员ID')" />
                <el-button v-throttle type="primary" @click="handleSearch">{{state.isSearch ?$t('重 置'): $t('搜 索')}}</el-button>
            </el-form-item>
            <el-row v-if="!itemData.type">
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
            <el-form-item :label="$t('控制类型:')" prop="type">
                <el-select :disabled="!state.isSearch" v-model="state.formData.type" style="width:  100%" :placeholder="$t('控制类型')">
                    <el-option v-for="item in ( itemData.asTeam ? metaData.ctrlPools : showData)" :key="item.value" :label="item.label"
                        :value="Number(item.value)" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('控制方式:')" v-if="!!itemData.userIds">
                <el-radio-group v-model="state.type">
                    <el-radio :label="0">{{$t('金额')}}</el-radio>
                    <el-radio :label="1">{{$t('次数')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('输入金额:')" prop="amount" v-if="!state.type">
                <el-input-number :disabled="!state.isSearch" v-model="state.formData.amount" style="width:  100%" :controls="false" :precision="2"
                    :min="0" :placeholder="$t('请输入金额')" />
            </el-form-item>
            <el-form-item :label="$t('控制次数:')" prop="count" v-if="!!state.type">
                <el-input-number v-model="state.formData.count" style="width:  100%" :controls="false" :precision="0" :min="0" :placeholder="$t('控制次数')" />
            </el-form-item>
            <el-form-item v-if="state.formData.type && isShow && !!state.type && !itemData.asTeam" :label="$t('余额限制:')">
                <el-input-number style="width: 100%" v-model="state.formData.balanceLimit" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入限制金额')" />
            </el-form-item>
        </el-form>
        <div v-if="state.formData.type && isShow && !!state.type && !itemData.asTeam">
            <div>{{$t('温馨提示：')}}</div>
            <div>{{$t('1.建议您设置大于100%返奖率时，设置会员余额限制，避免产生大的会员余额和打码量；')}}</div>
            <div>{{$t('2.如果您不设置，将按VIP余额限制处理。')}}</div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { postUserLevelControl, overUserLevelControl } from '@/api/risk_control'
import { getUserBaseDetail } from '@/api/common'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
    metaData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    type: 0,
    formData: {},
    isSearch: false,
    title: $t('新增会员控制'),
    rules: {
        userIds: { required: true, message: $t('请输入会员ID！'), trigger: 'blur' },
        type: { required: true, message: $t('请选择控制类型！'), trigger: 'change' },
        pattern: { required: true, message: $t('请选择控制方式！'), trigger: 'change' },
        amount: { required: true, message: $t('请输入金额！'), trigger: 'blur' },
        count: [
            { required: true, message: $t('请输入控制次数！'), trigger: 'blur' },
            { type: 'number', max: 10, message: $t('控制次数最大值为10！'), trigger: 'change' }
        ],
    },
    memberInfo: {},
    operateActions: [$t('取消'), $t('提交')]
})
const deployFormRef = ref(null)
const dialog = ref(null)

const showData = computed(() => {
    return props.metaData.controlTypeList.filter(item => +item.value)
})
const isShow = computed(() => {
    return !props.metaData.ctrlLoseType.some(item => state.formData.type === +item.value)
})

onMounted(() => {
    if (props.itemData.userIds) {
        state.isSearch = true
        let { userIds, type, controlTotalAmount = undefined, controlTotalCount = undefined, controlType = '', balanceLimit = undefined, user = {} } = props.itemData
        state.title = !type ? $t('修改会员控制') : $t('批量修改会员控制')
        state.type = controlTotalCount === undefined ? 0 : 1
        state.formData = {
            userIds,
            balanceLimit,
            type: controlType,
            count: controlTotalCount,
            amount: controlTotalAmount,
        }
        state.memberInfo.id = userIds || ''
        state.memberInfo.name = user.name || ''
        state.operateActions[0] = $t('结束控制')
    }
})

const handleSearch = () => {
    if (state.isSearch) {
        delete state.formData.userIds
        state.memberInfo = {}
        state.isSearch = false
    } else {
        if (!state.formData.userIds) {
            return ElMessage.warning($t('请输入会员ID再进行搜索！'))
        }
        dialog.value.showLoading()
        getUserBaseDetail({ id: state.formData.userIds }).then((res) => {
            if (res.data) {
                state.memberInfo = res.data
                state.isSearch = true
            } else {
                ElMessage.warning($t('未查询到此会员ID信息！'))
            }
            dialog.value.closeLoading()
        }).catch((data) => {
            state.tips = data.msg || ''
            dialog.value.closeLoading()
        })
    }
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            if (state.type) {
                delete params.amount
            } else {
                delete params.count
            }
            if (!isShow.value || !state.type || props.itemData.asTeam) delete params.balanceLimit
            dialog.value.showLoading()
            postUserLevelControl(params).then(() => {
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
    if (!props.itemData.userIds) return emits('close')
    dialog.value.showLoading()
    overUserLevelControl({ userIds: props.itemData.userIds }).then(res => {
        emits('close')
        emits('fetchData')
    }).catch(err => {
        dialog.value.closeLoading()
    })
}
</script>

<style lang="scss" >
.member-control {
}
</style>
