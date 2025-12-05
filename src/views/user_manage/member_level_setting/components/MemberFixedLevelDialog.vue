<template>
    <!-- 用户管理-层级设置-固定层级-新增/编辑 -->
    <Dialog ref="dialog" :width="memberLevelInfo.ids ? 400 : memberLevelInfo.user ? 480 : 550" :title="state.title" buttonCenter top="15vh"
        @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '85px' : '100px'">
            <el-row v-if="memberLevelInfo.user">
                <el-col :span="11">
                    <el-form-item :label="$t('会员ID:')">
                        {{memberLevelInfo.user?.id || ''}}
                    </el-form-item>
                </el-col>
                <el-col :span="13">
                    <el-form-item :label-width="$locale == 'zh' ? '85px' : '130px'" :label="$t('会员账号:')">
                        {{memberLevelInfo.user?.name || ''}}
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item :label="$t('会员ID:')" prop="userIds" v-if="!memberLevelInfo.ids && !memberLevelInfo.user">
                <el-input @input="(val) => state.formData.userIds = val.replace('，','')" v-model="state.formData.userIds" style="width: 100%"
                    type="textarea" :rows="4" :placeholder="$t('请输入会员ID，多个请用英文逗号隔开')" />
            </el-form-item>
            <el-form-item :label="$t('固定层级:')" prop="layerId">
                <el-select class="select-box" v-model="state.formData.layerId" :placeholder="$t('请选择固定层级')">
                    <el-option v-for="item in dataList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import { postMemberLevelData } from '@/api/risk_control.js'

const emits = defineEmits(['fetchData', 'refreshData', 'close'])
const props = defineProps({
    memberLevelInfo: {
        Object,
        default: () => {
            return {}
        }
    },
    dataList: {
        Array,
        default: () => []
    },
    merchantId: {
        default: ''
    }
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    title: $t('新增'),
    formData: {},
    rules: {
        userIds: [
            { required: true, message: $t('请输入会员ID！'), trigger: 'change' },
            {
                pattern: /^\d[0-9,]*$/,
                message: $t('请输入正确的会员ID，多个需要用英文逗号隔开！'),
                trigger: 'change',
            },
        ],
        layerId: [
            { required: true, message: $t('请选择固定层级！'), trigger: 'change' },
        ],
    }
})

onMounted(() => {
    let { user, ids, layerId } = props.memberLevelInfo
    if (user) {
        state.title = $t('修改')
        state.formData = { layerId, userIds: user.id }
    }
    if (ids) {
        state.formData.userIds = ids
        state.title = $t('批量修改')
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            state.formData.merchantId = props.merchantId
            dialog.value.showLoading()
            postMemberLevelData(state.formData).then(() => {
                cancel()
                if (!props.memberLevelInfo.user && !props.memberLevelInfo.ids) emits('fetchData')
                if (props.memberLevelInfo.user || props.memberLevelInfo.ids) emits('refreshData')
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
</style>
