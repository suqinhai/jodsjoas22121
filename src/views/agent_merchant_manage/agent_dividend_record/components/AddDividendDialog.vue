<!--
 * @Author: yilaisai
 * @Date: 2024-07-09 16:42:06
 * @LastEditors: yilaisai
 * @LastEditTime: 2024-07-17 20:32:17
-->
<template>
    <Dialog ref="dialog" width="450" :title="state.title" buttonCenter top="15vh" @confirm="handleSubmit(addFrom)" @cancel="cancel">
        <el-form ref="addFrom" :rules="rules" :model="state.formData" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('代理ID:')" prop="userId">
                <!-- <el-select
                    v-model="state.formData.userId"
                    filterable
                    remote
                    remote-show-suffix
                    suffix-icon="ArrowDown"
                    :placeholder="$t('请输入代理ID')"
                    :remote-method="remoteMethod"
                    :loading="loading"
                    
                >
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select> -->
                <el-input v-model="state.formData.userId" :placeholder="$t('输入代理ID')"
                    @input="state.formData.userId = state.formData.userId.replace(/[^\d]/g,'')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('分红额度:')" prop="tradeAmount">
                <el-input v-model="state.formData.tradeAmount" @input="validateInput" :placeholder="$t('请输入分红额度')" />
            </el-form-item>
            <el-form-item :label="$t('备注:')">
                <el-input v-model="state.formData.remark" type="textarea" rows="4" maxlength="100" show-word-limit :placeholder="$t('请输入备注')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup name='AddDividendDialog'>
import { ref, reactive } from 'vue'
import { postCommissionAdjusts, getAgentManageListData } from '@/api/agent_system'
import { numberInput } from '@/common/util'
const emits = defineEmits(['close', 'fetchData'])
const dialog = ref(null)
const addFrom = ref(null)
const state = reactive({
    title: $t('新增线下代理分红'),
    formData: {
        tradeType: 0
    }
})
const rules = reactive({
    userId: [{ required: true, message: $t('请输入代理ID'), trigger: 'blur' }],
    tradeAmount: [{ required: true, message: $t('请输入分红额度'), trigger: 'blur' }]
})
const options = ref([])
const loading = ref(false)

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postCommissionAdjusts(state.formData).then(() => {
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

const remoteMethod = (query) => {
    if (query) {
        loading.value = true
        getAgentManageListData({
            userId: query
        }).then(res => {
            loading.value = false
            if (res && res.data) {
                options.value = res.data.list.map(item => {
                    return {
                        value: item.user.id,
                        label: item.user.label
                    }
                })
            }
        })
    } else {
        options.value = []
    }

}

const validateInput = () => {
    state.formData.tradeAmount = numberInput(state.formData.tradeAmount)
    // const regex = /^[-1-9]{1}[1-9]?\d*$/;
    // if (!regex.test(state.formData.tradeAmount)) {
    //     state.formData.tradeAmount = state.formData.tradeAmount.slice(0, -1)
    //     state.formData.tradeAmount = state.formData.tradeAmount.replace(/[^\d-]/g, '');
    // }
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
</style>