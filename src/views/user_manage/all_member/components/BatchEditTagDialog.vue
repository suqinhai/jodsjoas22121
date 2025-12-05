<template>
    <!-- 所有会员-操作会员 -->
    <Dialog ref="dialog" width="550" :title="$t('批量修改标签')" top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <div class="tips">{{$t('已选择')}}<span style="padding: 0 5px">{{itemData.memberNum}}</span>{{$t('条')}}</div>
            <el-form-item :label="$t('操作类型:')" prop="changeType">
                <el-radio-group v-model="state.formData.changeType">
                    <el-radio :label="1">{{$t('批量修改标签')}}</el-radio>
                    <el-radio :label="2">{{$t('增加标签')}}</el-radio>
                    <el-radio :label="3">{{$t('取消标签')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('选择标签:')" prop="userTagId">
                <el-select style="width: 100%" v-model="state.formData.userTagId" clearable multiple :multiple-limit="3" filterable
                    :placeholder="$t('请选择会员标签')">
                    <el-option v-for="item in metaData.memberTag" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { operateMemberConfig } from '@/api/member'
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
    formData: {},
    rules: {
        changeType: [{ required: true, message: $t('请选择操作类型！'), trigger: 'change' }],
        userTagId: [{ required: true, message: $t('请选择会员标签！'), trigger: 'change' }],
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            params.ids = [...props.itemData.ids]
            params.userTagId = params.userTagId.join(',')
            params.type = 11
            dialog.value.showLoading()
            operateMemberConfig(params).then(res => {
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

<style scoped lang="scss">
.tips {
    margin-bottom: 20px;
    padding-left: 10px;
}
</style>
