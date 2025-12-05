<template>
    <!-- 运营中心-运营费用录入-成本录入 -->
    <Dialog width="700" :title="$t('成本录入')" top="10vh" :operateActions="[$t('取消'), $t('提交')]" @confirm="confirmEdit(addFrom)" @cancel="cancel">
        <el-form ref="addFrom" :model="state" :rules="state.rules" label-width="150">
			<el-form-item :label="$t('费用类型：')">
			    <el-select class="select-box" v-model="state.formData.type" :placeholder="$t('请选择类型')" filterable>
			       <el-option v-for="item in state.metaData.merchantFeeType" :key="item.value" :label="item.label" :value="item.value" />
			    </el-select>
			</el-form-item>
            <el-form-item :label="$t('金额（USDT）：')">
                <el-input-number class="special-input" v-model="state.formData.fee" :controls="false" :precision="2" :min="-1000000"
                    :placeholder="$t('请输入金额')" style="width: 250px;" :max="1000000"/>
            </el-form-item>
            <el-form-item :label="$t('备注内容：')">
                <el-input v-model="state.formData.remark" type="textarea" :placeholder="$t('输入备注内容')" :rows="4" show-word-limit maxlength="500"></el-input>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { postEnterFee } from '@/api/operation'
import { getCommonMeta } from '@/api/common'

const addFrom = ref(null)
const emits = defineEmits(['close', 'fetchData'])
const state = reactive({
    formData: {},
    rules: {},
	metaData: {}
})

onMounted(()=>{
	getCommonMeta({ types: 'merchantFeeType' }).then(res => {
		state.metaData.merchantFeeType = res.data.merchantFeeType
	})
})

const confirmEdit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            postEnterFee({ ...state.formData }).then(res => {
                if (res.code === 0) {
                    emits('close')
                    emits('fetchData')
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