<template>
    <!-- 用户管理-信誉管理-批量修改信誉分 -->
    <Dialog ref="dialog" width="600" :title="$t('批量修改信誉分')" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)"
        @cancel="cancel">
        <el-form ref="deployFormRef" class="create-order" :model="state.formData" :rules="state.rules"
            :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <el-form-item :label="$t('信誉分:')" prop="score">    
                <el-input-number :placeholder="$t('请输入整数0-100')" :controls="false" :max="100" :min="0" v-model="state.formData.score" style="width: 210px;margin-right: 10px"></el-input-number>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { postPromotionAccountData } from '@/api/member'
import { getUserBaseDetail } from '@/api/common'
import { ref, reactive, onMounted } from 'vue'
import userStore from '@/store/user'
import { postCreditEdit, postCreditImport } from '@/api/member'


const userData = userStore()
const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    allSelected: {
        type: Boolean,
        default: false
    }
})
const state = reactive({
    isSearch: false,
    formData: {
        score: 0,
    },
    memberInfo: {},
    rules: {
        score: { required: true, message: $t('请输入信誉分！'), trigger: 'blur' },
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)

onMounted(() => {
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            const params = {
                ids: props.allSelected ? '' : props.itemData,
                score: state.formData.score,
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
