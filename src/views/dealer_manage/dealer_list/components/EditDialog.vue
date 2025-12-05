<template>
    <!-- 经销商列表-修改返佣比例 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? 600 : 800" :title="$t('修改返佣比例')" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)"
        @cancel="emits('close')">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" label-width="auto">
            <el-row v-if="itemData.id">
                <el-col :span="11">
                    <el-form-item :label="$t('会员ID:')">
                        {{itemData.user?.id || ''}}
                    </el-form-item>
                </el-col>
                <el-col :span="13">
                    <el-form-item :label="$t('会员账号:')">
                        {{itemData.user?.name || ''}}
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item :label="$t(typeText) + ':'">
                {{itemData.limitAmount}} {{$t(`（${typeText}最低达到该值才算有效会员）`)}}
            </el-form-item>
            <el-form-item :label="$t('经销商返佣配置:')" prop="rate">
                <el-input-number v-model="state.formData.rate" :controls="false" :precision="2" :min="itemData.minRate || 0" :max="100"
                    :placeholder="$t('请输入返佣比例')" />
                %
                <div>{{$t('修改后将实时生效，下级之后产生的返佣按最新计算')}}</div>
            </el-form-item>
            <el-form-item :label="$t('返佣比例:')">
                {{itemData.rate}}%
            </el-form-item>
            <el-form-item :label="$t('可修改额度范围:')">
                {{itemData.minRate || 0}}-100{{$t('（不可超过100%）')}}
            </el-form-item>
            <!-- <el-form-item :label="$t('审核备注:')">
                <el-input v-model="state.formData.verifyFrontRemark" type="textarea" :rows="4" :placeholder="$t('请输入审核备注')" />
            </el-form-item> -->
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { postDealerData } from '@/api/dealer'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    formData: {},
    rules: {
        rate: { required: true, message: $t('请输入返佣比例！'), trigger: 'blur' },
    },
})
const deployFormRef = ref(null)
const dialog = ref(null)

const typeText = computed(() => {
    return props.itemData.rateType === 1 ? '首充金额' : '累充金额'
})

onMounted(() => {
    let { user = {}, rate } = props.itemData
    state.formData = {
        id: user.id,
        rate,
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postDealerData(state.formData).then(() => {
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
