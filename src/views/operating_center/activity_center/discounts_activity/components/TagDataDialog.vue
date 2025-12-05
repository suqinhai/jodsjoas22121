<template>
    <!-- 运营中心-优惠活动列表-活动列表/已关闭活动 -->
    <div class="activity-tag">
        <Dialog ref="dialogRef" width="700" :title="$t('标签配置')" top="5vh" :isShowSubmit="false" @cancel="emits('close')">
            <div class="head">
                <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
            </div>
            <el-table :data="state.tableData" border>
                <el-table-column prop="id" label="ID" width="90" align="center" />
                <el-table-column prop="sort" :label="$t('排序')" width="90" align="center" />
                <el-table-column prop="name" :label="$t('标签名称')" min-width="160" align="center" />
                <el-table-column :label="$t('操作')" width="120" align="center">
                    <template #default="{ row }">
                        <el-button v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                        <el-button v-throttle type="danger" text @click="handleDelete(row)">{{$t('删除')}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </Dialog>
        <TagConfigDialog v-if="state.showDialog" :itemData="state.itemData" @close="state.showDialog = false" @fetchData="fetchData">
        </TagConfigDialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent } from "vue"
import { ElMessageBox } from "element-plus"
import userStore from '@/store/user'
import { getActivityTagList, deleteActivityTagData } from "@/api/discounts_center"
const TagConfigDialog = defineAsyncComponent(() => import("./TagConfigDialog.vue"))

const emits = defineEmits(['close'])
const state = reactive({
    merchantId: '',
    tableData: [],
    showDialog: false,
    itemData: {},
})
const dialogRef = ref(null)
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    dialogRef.value.showLoading()
    getActivityTagList({ merchantId: userData.userInfo.groupId }).then(res => {
        state.tableData = res.data || []
        dialogRef.value.closeLoading()
    }).catch(err => {
        state.tableData = []
        dialogRef.value.closeLoading()
    })
}

const handleConfig = (val) => {
    state.itemData = { ...val }
    state.showDialog = true
}

// 删除
const handleDelete = ({ id }) => {
    ElMessageBox.confirm($t('删除后不可恢复，确认要删除吗？'), $t('删除'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        dialogRef.value.showLoading()
        deleteActivityTagData({ id, merchantId: userData.userInfo.groupId }).then(() => {
            fetchData()
        }).catch(() => {
            dialogRef.value.closeLoading()
        })
    }).catch(() => { })
}
</script>

<style lang="scss" scoped>
.activity-tag {
    .head {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
    }
}
</style>
