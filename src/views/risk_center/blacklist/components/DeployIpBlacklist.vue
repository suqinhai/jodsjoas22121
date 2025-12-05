<template>
    <!-- 黑名单-IP黑名单-新增黑名单 -->
    <Dialog ref="dialog" width="600" :title="$t('新增黑名单')" top="10vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-form-item :label="$t('黑名单IP:')" prop="ip">
                <el-input :disabled="state.formData.id" v-model="state.formData.ip" style="width:100%" :placeholder="$t('请输入黑名单IP')" />
            </el-form-item>
            <el-form-item :label="$t('限制类型:')" prop="limitTypes">
                <el-checkbox v-model="state.checkAll" :indeterminate="state.isIndeterminate" @change="handleCheckAllChange">{{$t('全部')}}</el-checkbox>
                <el-checkbox-group v-model="state.formData.limitTypes" @change="handleCheckedCitiesChange">
                    <el-checkbox v-for="item in metaData.limitType" :key="item.value" :label="Number(item.value)">{{item.label}}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('备注:')">
                <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')" v-model="state.formData.remark" show-word-limit
                    maxlength="50" />
            </el-form-item>

        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import { postBlacklistData } from '@/api/risk_control'
import { deepClone } from '@/common/util'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    checkAll: false,
    isIndeterminate: false,
    formData: {
        limitTypes: []
    },
    rules: {
        ip: [{ required: true, message: $t('请输入黑名单IP！'), trigger: 'blur' }],
        limitTypes: [{ required: true, message: $t('请选择限制类型！'), trigger: 'change' }],
    }
})
let metaData = reactive({
    limitType: [
        { label: $t('注册'), value: 0 },
        { label: $t('登录'), value: 1 },
    ],
})

onMounted(() => {
    state.formData = { ...props.itemData }
    state.formData.type = 1
})

const handleCheckAllChange = (val) => {
    state.formData.limitTypes = val ? metaData.limitType.map(item => item.value) : []
    state.isIndeterminate = false
}

const handleCheckedCitiesChange = (val) => {
    let num = val.length
    if (num) {
        if (num === metaData.limitType.length) {
            state.isIndeterminate = false
            state.checkAll = true
        } else {
            state.isIndeterminate = true
            state.checkAll = false
        }
    } else {
        state.isIndeterminate = false
        state.checkAll = false
    }
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            params.limitTypes = params.limitTypes.join(',')
            dialog.value.showLoading()
            postBlacklistData(params).then(() => {
                // ElMessage.success($t('提交成功！'))
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
</style>
