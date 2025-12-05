<template>
    <!-- 黑名单-会员黑名单-新增/修改 -->
    <Dialog ref="dialog" width="600" :title="state.title" top="10vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-form-item :label="$t('会员ID:')" prop="userId">
                <el-input :disabled="!!itemData.id" @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    style="width:100%" :placeholder="$t('请输入会员ID')" />
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
                    maxlength="255" />
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
    metaData: {
        type: Object,
        default: {}
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    title: $t('新增'),
    checkAll: false,
    isIndeterminate: false,
    formData: {
        type: []
    },
    rules: {
        userId: [{ required: true, message: $t('请输入会员ID！'), trigger: 'blur' }],
        limitTypes: [{ required: true, message: $t('请选择限制类型！'), trigger: 'change' }],
    }
})

onMounted(() => {
    state.formData = { ...props.itemData }
    state.formData.type = 0
    state.formData.id && (state.title = $t('修改'))
})

const handleCheckAllChange = (val) => {
    state.formData.limitTypes = val ? props.metaData.limitType.map(item => +item.value) : []
    state.isIndeterminate = false
}
const handleCheckedCitiesChange = (val) => {
    let num = val.length
    if (num) {
        if (num === props.metaData.limitType.length) {
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
