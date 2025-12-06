<template>
    <!-- 推广账号设置-批量注册 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? 400 : 500" :title="$t('批量注册')" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('账号数量:')" prop="userCount">
                <el-input-number style="width: 100%" v-model="state.formData.userCount" :controls="false" :precision="0" :min="1" :placeholder="$t('请输入账号数量')" />
            </el-form-item>
            <!-- <el-form-item :label="$t('禁止提现:')">
                <el-switch v-model="state.formData.cashLimit" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item :label="$t('游戏限制:')">
                <el-radio-group v-model="state.formData.playLimit">
                    <el-radio :label="0">{{$t('无')}}</el-radio>
                    <el-radio :label="1">{{$t('游戏限制（只可进游戏）')}}</el-radio>
                </el-radio-group>
            </el-form-item> -->
            <el-form-item :label="$t('添加金额:')">
                <el-input-number style="width: 100%" v-model="state.formData.amount" :controls="false" :precision="2" :min="0.01" :placeholder="$t('请输入金额')" />
            </el-form-item>
            <div class="tips">{{$t('提示：')}}</div>
            <div class="tips">{{$t('注册的账号全部为推广账号，且禁止提现，只可进入、TTT、、游戏，账号密码为账号后面加789')}}</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { batchPromotionAccountData } from '@/api/member.js'

const emits = defineEmits(['fetchData', 'close'])
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {
        cashLimit: 1,
        playLimit: 1,
    },
    rules: {
        userCount: [
            { required: true, message: $t('请输入账号数量！'), trigger: 'blur' },
            { type: 'number', max: 50, message: $t('单次最多添加50个！'), trigger: 'change' }
        ],
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            batchPromotionAccountData(state.formData).then(() => {
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
.tips {
    color: red;
}
</style>
