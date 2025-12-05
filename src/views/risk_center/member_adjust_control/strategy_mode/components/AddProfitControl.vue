<template>
    <!-- 会员调控-数据列表（专业模式）-VIP盈利控制 -->
    <Dialog ref="dialog" width="600" :title="$t('VIP盈利控制')" top="10vh" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '110px' : 'auto'">
            <el-form-item :label="$t('VIP盈利层级:')" prop="layers">
                <el-checkbox v-model="state.isCheckedAllLevel" :indeterminate="state.isIndeterminateLevel" @change="checkAllLevel">{{$t('全部层级')}}</el-checkbox>
                <el-checkbox-group v-model="state.formData.layers" @change="handleCheckLevel">
                    <el-checkbox v-for="item in metaData.profitLayer" :key="item" :label="item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('控制次数:')" prop="count">
                <el-input-number v-model="state.formData.count" style="width:  150px" :controls="false" :precision="0" :min="1" :max="10"
                    :placeholder="$t('请输入控制次数')" />
            </el-form-item>
            <div style="color: #888">{{$t('注：请勾选控制的层级，系统将检测会员当前盈利额度，自动分配到对应控制池子')}}</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { postProfitControlConfig } from '@/api/risk_control'
import { deepClone } from '@/common/util'

const emits = defineEmits(['close'])
const props = defineProps({
    metaData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    formData: {
        layers: []
    },
    isCheckedAllLevel: false,
    isIndeterminateLevel: false,
    rules: {
        layers: { required: true, message: $t('请选择VIP盈利层级！'), trigger: 'change' },
        count: { required: true, message: $t('请输入控制次数！'), trigger: 'blur' },
    },
})
const deployFormRef = ref(null)
const dialog = ref(null)

const checkAllLevel = (val) => {
    state.formData.layers = val
        ? props.metaData.profitLayer.map((item) => item.value)
        : []
    state.isIndeterminateLevel = false
};

const handleCheckLevel = (value) => {
    const checkedCount = value.length
    state.isCheckedAllLevel = checkedCount === props.metaData.profitLayer.length
    state.isIndeterminateLevel =
        checkedCount > 0 && checkedCount < props.metaData.profitLayer.length
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            params.layers = params.layers.join(',')
            dialog.value.showLoading()
            postProfitControlConfig(params).then(() => {
                cancel()
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
</style>
