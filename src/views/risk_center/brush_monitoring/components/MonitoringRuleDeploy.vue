<template>
    <!-- 刷子监控-同关联监控-默认自动规则 -->
    <Dialog ref="dialogRef" :title="$t('默认自动规则')" top="10vh" width="900" buttonCenter @confirm="handleSubmit(formRef)" @cancel="emits('close')">
        <el-form :model="state" ref="formRef" :rules="state.rules" label-width="0">
            <el-table :data="state.formData" border>
                <el-table-column :label="$t('关联类型')" width="140" align="center">
                    <template #default="{ row }">
                        {{ metaData.botSpyType.find(item => +item.value === row.type)?.label || '' }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('处罚触发值')" min-width="160" align="center">
                    <template #default="{ row }">
                        <el-input-number v-model="row.value" style="width: 100%" :controls="false" :precision="0" :min="2" :max="100"
                            placeholder="0" />
                    </template>
                </el-table-column>
                <el-table-column :label="$t('处罚范围')" min-width="160" align="center">
                    <template #default="{ row }">
                        <el-select v-model="row.range" style="width: 100%">
                            <el-option v-for="item in metaData.botSpyRange" :key="item.value" :label="item.label" :value="item.value * 1">
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('处罚方式')" min-width="160" align="center">
                    <template #default="{ row }">
                        <el-select v-model="row.punishType" style="width: 100%">
                            <el-option v-for="item in metaData.botSpyPunish" :key="item.value" :label="item.label" :value="item.value * 1">
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('固定层级')" min-width="160" align="center">
                    <template #default="{ row }">
                        <el-select v-model="row.layerId" style="width: 100%" clearable>
                            <el-option v-for="item in metaData.fixedLevel" :key="item.id" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue"
import { ElMessage } from "element-plus"
import { deepClone } from "@/common/util/index"
import { postMonitoringRule } from "@/api/risk_control.js"

const emits = defineEmits(["close", "fetchData"])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        },
    },
    itemData: {
        type: Array,
        default: () => {
            return []
        },
    },
})
const state = reactive({
    formData: []
})
const formRef = ref(null);
const dialogRef = ref(null);

onMounted(() => {
    state.formData = deepClone(props.itemData)
})

const handleSubmit = async (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialogRef.value.showLoading()
            postMonitoringRule({
                value: JSON.stringify(state.formData)
            }).then(() => {
                emits('close')
                emits('fetchData')
            }).catch(err => {
                dialogRef.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    });
};
</script>

<style lang="scss" scoped>
</style>
