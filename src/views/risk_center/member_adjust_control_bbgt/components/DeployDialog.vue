<template>
    <!-- BBGT会员调控-数据列表-操作 -->
    <Dialog ref="dialog" width="410" :title="title" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form class="member-control-deploy" ref="deployFormRef" :model="state.formData" :rules="state.rules"
            :label-width="$locale == 'zh' ? '70px' : 'auto'">
            <el-form-item :label="$t('返奖率:')" prop="controlType">
                <el-select v-model="state.formData.controlType" style="width:  100%" :placeholder="$t('请选择返奖率')">
                    <el-option v-for="item in metaData.ctrlPools" :key="item.value" :label="item.label" :value="Number(item.value)" />
                </el-select>
            </el-form-item>
            <div v-if="itemData.operateType === 2" class="control-deploy-tips">
                {{$t('一键设置：一键设置玩家的返奖率，不包含推广账号')}}
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { postSimpleDefaultConfig, postSimpleControlOnekey } from '@/api/risk_control'
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
    formData: {},
    rules: {
        controlType: { required: true, message: $t('请选择返奖率！'), trigger: 'change' }
    },
})
const deployFormRef = ref(null)
const dialog = ref(null)

const title = computed(() => {
    let { operateType } = props.itemData
    if (operateType === 1) return $t('默认设置')
    if (operateType === 2) return $t('一键设置')
    // if (operateType === 3) return $t('文件导入')
    // if (operateType === 4) return $t('批量操作')
    // if (operateType === 5) return $t('一键同步推广账号返奖率设置')
    return ''
})

onMounted(() => {
    state.formData = { ...props.itemData }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            let { operateType } = props.itemData
            let api = postSimpleDefaultConfig
            if (operateType === 2) {
                params.tab = 1
                api = postSimpleControlOnekey
            }
            delete params.operateType
            params.gameProvider = 'BGT'
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

<style lang="scss" >
.member-control-deploy {
    .control-deploy-tips {
        // text-align: center;
    }
}
</style>
