<template>
    <!-- BBGT会员调控-返奖率预设列表-新增 -->
    <Dialog ref="dialog" width="550" :title="$t('新增')" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('设置类型:')" prop="type">
                <el-radio-group v-model="state.formData.type">
                    <el-radio v-for="item in simpleCtrlType" :key="item.value" :label="+item.value">{{item.label}}
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="state.formData.type === 2" :label="$t('代理ID:')" prop="agentIds">
                <el-input @input="(val) => state.formData.agentIds = val.replace('，','')" v-model="state.formData.agentIds" style="width: 100%"
                    type="textarea" :rows="4" :placeholder="$t('请输入代理ID，多个请用英文逗号隔开')" />
            </el-form-item>
            <el-form-item v-if="state.formData.type === 1" :label="$t('自动层级')" prop="autoLayerId">
                <el-select v-model="state.formData.autoLayerId" clearable :placeholder="$t('请选择自动层级')">
                    <el-option v-for="item in metaData.autoLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item v-if="state.formData.type === 0" :label="$t('固定层级')" prop="fixedLayerId">
                <el-select v-model="state.formData.fixedLayerId" clearable :placeholder="$t('请选择固定层级')">
                    <el-option v-for="item in metaData.fixedLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('返奖率:')" prop="controlType">
                <el-select v-model="state.formData.controlType" :placeholder="$t('请选择返奖率')">
                    <el-option v-for="item in metaData.ctrlPools" :key="item.value" :label="item.label" :value="Number(item.value)" />
                </el-select>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import userStore from '@/store/user'
import { addSimpleRuleData } from '@/api/risk_control'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    metaData: {
        type: Object,
        default: {}
    },
    simpleCtrlType: {
        type: Array,
        default: () => []
    },
})
const state = reactive({
    formData: {},
    rules: {
        type: { required: true, message: $t('请选择设置类型！'), trigger: 'change' },
        agentIds: { required: true, message: $t('请输入代理ID！'), trigger: 'blur' },
        autoLayerId: { required: true, message: $t('请选择自动层级！'), trigger: 'change' },
        fixedLayerId: { required: true, message: $t('请选择固定层级！'), trigger: 'change' },
        controlType: { required: true, message: $t('请选择返奖率！'), trigger: 'change' },
    },
})
const deployFormRef = ref(null)
const dialog = ref(null)
const userData = userStore()

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { agentIds, type, controlType, autoLayerId, fixedLayerId, balanceLimit } = state.formData
            let params = { type, controlType, balanceLimit, gameProvider: 'BGT' }
            switch (type) {
                case 0:
                    params.fixedLayerId = fixedLayerId
                    break
                case 1:
                    params.autoLayerId = autoLayerId
                    break
                case 2:
                    params.agentIds = agentIds
                    break
            }
            dialog.value.showLoading()
            addSimpleRuleData(params).then(() => {
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

<style lang="scss" >
</style>
