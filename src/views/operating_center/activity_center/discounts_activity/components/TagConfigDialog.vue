<template>
    <!-- 运营中心-优惠活动列表-活动列表/已关闭活动-新人彩金活动-兑换码管理-生成兑换码 -->
    <Dialog ref="dialog" width="400" :title="!itemData.id ? $t('新增') : $t('修改')" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)"
        @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" label-width="auto">
            <el-form-item :label="$t('标签名称:')" prop="name">
                <el-input style="width: 100%" v-model="state.formData.name" maxlength="30" show-word-limit :placeholder="$t('请输入标签名称')" />
            </el-form-item>
            <el-form-item :label="$t('排序:')" prop="sort">
                <el-input-number style="width: 100%" v-model="state.formData.sort" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入排序值')" />
            </el-form-item>
            <div>{{$t('1.数值越小排在越前面；')}}</div>
            <div>{{$t('2.标签名称不可超过30字符。')}}</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { postActivityTagData } from '@/api/discounts_center'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    formData: {},
    rules: {
        name: { required: true, message: $t('请输入标签名称！'), trigger: 'blur' },
        sort: { required: true, message: $t('请输入排序值！'), trigger: 'blur' },
    }
})
const userData = userStore()
const dialog = ref(null)
const operateForm = ref(null)

onMounted(() => {
    state.formData = { ...props.itemData }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postActivityTagData({ ...state.formData, merchantId: userData.userInfo.groupId }).then(() => {
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

<style scoped lang="scss">
</style>
