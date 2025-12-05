<template>
    <!-- 非经营地访问限制-新增/修改 -->
    <Dialog ref="dialog" width="700" :title="title" top="10vh" :operateActions="[$t('取消'), $t('确认')]" @confirm="confirmEdit(formRef)"
        @cancel="cancel">
        <el-form :model="formData" :rules="rules" :label-width="$locale == 'zh' ? '110px' : 'auto'" ref="formRef">
            <el-form-item :label="$t('国家/地区：')" prop="area">
                <el-select v-model="formData.area" :placeholder="$t('请选择国家')">
                    <el-option v-for="(item, index) in metaData.areaCountryList" :key="index" :label="item.name" :value="Number(item.id)" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('限制访问的终端类型：')" prop="limitList" :label-width="$locale == 'zh' ? '170px' : 'auto'">
                <el-checkbox-group v-model="formData.limitList">
                    <el-checkbox v-for="(item, index) in metaData.client" :key="index" :label="index">
                        <template v-slot:default>
                            {{ item.label }}
                        </template>
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('备注：')" :label-width="$locale == 'zh' ? '70px' : 'auto'">
                <el-input v-model="formData.remark" maxlength="50" resize="none" :placeholder="$t('请输入备注')" show-word-limit type="textarea"
                    rows="4" />
            </el-form-item>

        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { addOrEditRegionalRestrictions } from '@/api/merchant_center'

const props = defineProps(['metaData', 'item'])
const emits = defineEmits(['close', 'refresh'])
const formRef = ref(null)
const formData = reactive({
    area: '',
    limitList: [],
    remark: ''
})
const rules = reactive({
    area: [
        { required: true, message: $t('请选择地区/国家'), trigger: 'change' },
    ],
    limitList: [
        { type: 'array', required: true, message: $t('请选择客户端'), trigger: 'change', }
    ]
})
const dialog = ref(null)

const title = computed(() => {
    if (props.item) {
        return $t('修改禁止访问')
    } else {
        return $t('新增禁止访问')
    }
})

onMounted(() => {
    if (props.item) {
        formData.area = props.item.regionId
        formData.limitList = props.item.clients
        formData.remark = props.item.remark
    }
})

const confirmEdit = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (!valid) return
        let params = {
            regionId: formData.area,
            clients: formData.limitList.join(','),
            remark: formData.remark
        }
        if (props.item) {
            params.id = props.item.id
        }
        dialog.value.showLoading()
        addOrEditRegionalRestrictions(params).then(res => {
            emits('refresh')
            emits('close')
        }).catch(() => {
            dialog.value.closeLoading()
        })
    })

}

const cancel = () => {
    emits('close')
}


</script>

<style lang="scss">
</style>