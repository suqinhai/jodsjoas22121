<template>
    <!-- 宣传管理-宣传时间配置 -->
    <Dialog ref="dialog" width="600" :isShowSubmit="false" :title="$t('宣传时间配置')" top="10vh" @cancel="cancel">
        <el-table :data="state.tableData" tooltip-effect="dark" border>
            <el-table-column :label="$t('宣传类型')" min-width="180" align="center">
                <template #default="{ row }">
                    {{metaData.bannerType.find(item => row.type === +item.value)?.label || ''}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('播放时间/秒')" min-width="150" align="center">
                <template #default="{ row }">
                    <el-input-number :disabled="!row.isEdit" v-model="row.time" style="width: 100%" :controls="false" :precision="0" :min="1"
                        :max="100" :placeholder="$t('请输入播放时间')" />
                </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('操作')" width="110">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-if="!row.isEdit" text @click="row.isEdit = true">{{$t('修改')}}</el-button>
                    <el-button v-throttle type="primary" v-if="row.isEdit" text @click="getCarouselData">{{$t('取消')}}</el-button>
                    <el-button v-throttle type="primary" v-if="row.isEdit" text @click="handleSave(row)">{{$t('保存')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { postCarouseTime, getCarouseTimeList } from '@/api/data_center'

const emits = defineEmits(['close'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const dialog = ref(null)
const state = reactive({
    tableData: []
})

onMounted(() => {
    getCarouselData()
})

const getCarouselData = (el) => {
    dialog.value.showLoading()
    getCarouseTimeList().then(res => {
        state.tableData = res.data.map(item => {
            item.isEdit = false
            return item
        })
        state.tableData = state.tableData.filter(item => props.metaData.bannerType.some(its => item.type === +its.value))
        dialog.value.closeLoading()
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const handleSave = (row) => {
    if (row.time) {
        let params = {}
        dialog.value.showLoading()
        postCarouseTime(row).then(() => {
            // ElMessage.success($t('提交成功！'))
            getCarouselData()
            // cancel()
        }).catch(() => {
            dialog.value.closeLoading()
        })
    } else {
        ElMessage.warning($t('请设置播放时间再进行保存！'))
    }
}

const cancel = () => {
    emits('close')
}

</script>

<style lang="scss">
</style>
