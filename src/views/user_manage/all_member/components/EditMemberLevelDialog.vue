<!--
 * @Author: yilaisai
 * @Date: 2025-01-16 11:30:47
 * @LastEditors: yilaisai
 * @LastEditTime: 2025-01-16 11:53:26
-->
<template>
    <!-- 所有会员-批量修改层级 -->
    <Dialog ref="dialog" :title="$t('批量修改层级')" buttonCenter top="15vh" width="500" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '85px' : '130px'">
            <el-form-item :label="$t('已选定:')" prop="userIds">
                {{props.tableListSelection.length}}{{$t('条')}}
            </el-form-item>
            <el-form-item :label="$t('层级类型:')">
                <el-radio-group v-model="state.type" @change="state.formData.layerId = ''">
                    <el-radio :label="0">{{$t('自动层级')}}</el-radio>
                    <el-radio :label="1">{{$t('固定层级')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('自动层级:')" prop="layerId" v-if="state.type === 0">
                <el-select style="width: 100%" v-model="state.formData.layerId" :placeholder="$t('请选择自动层级')">
                    <el-option v-for="item in metaData.autoLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('固定层级:')" prop="layerId" v-if="state.type === 1">
                <el-select style="width: 100%" v-model="state.formData.layerId" :placeholder="$t('请选择固定层级')">
                    <el-option v-for="item in metaData.fixedLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { operateMemberConfig } from '@/api/member.js'

const emits = defineEmits(['resetData', 'close'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    tableListSelection: {
        type: Array,
        default: () => {
            return []
        }
    },
    merchantId: {
        default: ''
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    type: 0,
    rules: {
        layerId: [
            { required: true, message: $t('请选择'), trigger: 'blur' },
        ],
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            let data = {
                ids: props.tableListSelection.map((item) => { return item.id }).join(','),
                type: 10,
                merchantId: props.merchantId
            }
            if (state.type === 1) { data.fixedLayerId = state.formData.layerId }
            if (state.type === 0) { data.autoLayerId = state.formData.layerId }
            operateMemberConfig(data).then(() => {
                cancel()
                emits('resetData')
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
