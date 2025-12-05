<template>
    <!-- 出款额度配置-新增配置 -->
    <Dialog width="700" :title="$t('新增配置')" top="10vh" :operateActions="[$t('取消'), $t('提交')]" @confirm="confirmEdit(addFrom)" @cancel="cancel">
        <el-form ref="addFrom" :model="form" :label-width="$locale == 'zh' ? '85px' : 'auto'" :rules="form.rules">
            <el-form-item :label="$t('代理ID：')" prop="userId">
                <el-input v-model="form.userId" :placeholder="$t('请输入代理ID')" @input="(val) => form.userId = val.replace(/\D/g,'')"></el-input>
                <div>{{$t('注：无出款权限的代理不可设置')}}</div>
            </el-form-item>
            <el-form-item label="" label-width="85px">
                <el-radio-group v-model="form.tradeType" class="ml-4">
                    <el-radio :label="1">{{$t('增加额度')}}</el-radio>
                    <el-radio :label="2">{{$t('减少额度')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('额度：')" prop="tradeAmount">
                <el-input-number class="special-input" v-model="form.tradeAmount" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入额度')" />
            </el-form-item>
            <el-form-item :label="$t('备注：')" prop="name">
                <el-input v-model="form.remark" type="textarea" :placeholder="$t('输入备注')" :rows="4" show-word-limit maxlength="100"></el-input>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { postAdjustConfig } from '@/api/agent_system'


const addFrom = ref(null)
const emits = defineEmits(['close', 'refresh'])
const form = reactive({
    userId: '',
    tradeType: 1,
    tradeAmount: '',
    remark: '',
    rules: {
        userId: [{ required: true, message: $t('请输入代理ID'), trigger: 'change' }],
        tradeAmount: [{ required: true, message: $t('请输入额度'), trigger: 'change' }],
    }
})

const confirmEdit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            const { userId, tradeType, tradeAmount, remark } = form
            postAdjustConfig({
                userId,
                tradeType,
                tradeAmount,
                remark,
            }).then(res => {
                if (res.code === 0) {
                    emits('close')
                    emits('refresh')
                }
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

<style lang='scss'>
.red {
    color: red;
}
</style>