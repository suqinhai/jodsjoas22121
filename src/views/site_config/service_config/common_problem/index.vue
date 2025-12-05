<template>
    <!-- 客服配置-常见问题 -->
    <div class="tabs-main common-problem">
        <div class="head" v-permiss="'merchant.faq.addOrEdit'">
            <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
        </div>
        <el-table :data="state.tableData" style="width: 800px" border>
            <el-table-column prop="sort" :label="$t('排序')" min-width="80" align="center" />
            <el-table-column prop="title" :label="$t('标题')" min-width="160" align="center" />
            <el-table-column :label="$t('图标')" min-width="120" align="center" v-if="userData.getTemplateType() !== 4">
                <template #default="{ row }">
                    <el-image v-if="!!row.iconUrl" class="imgs" :src="row.iconUrl" :crossorigin="null" :preview-src-list="[row.iconUrl]"
                        preview-teleported fit="contain" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="120">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.faq.addOrEdit'" v-throttle type="primary" text @click="handleConfig(row,'showProblemDeploy')">
                        {{$t('修改')}}</el-button>
                    <el-button v-permiss="'merchant.faq.delete'" v-throttle type="danger" text @click="handleDel(row.id)">{{$t('删除')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <ProblemDeployDialog v-if="state.showProblemDeploy" :itemData="state.itemData" @close="state.showProblemDeploy = false"
            @fetchData="fetchData">
        </ProblemDeployDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { ElMessageBox } from "element-plus";
import { getCommonProblemList, deleteCommonProblemData } from '@/api/service'
import userStore from '@/store/user'
const ProblemDeployDialog = defineAsyncComponent(() => import('./components/ProblemDeployDialog.vue'))

const state = reactive({
    tableData: [],
    itemData: {},
    showProblemDeploy: false,
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getCommonProblemList().then(res => {
        state.tableData = res.data
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 新增/修改
const handleConfig = (row) => {
    state.itemData = { ...row }
    state.showProblemDeploy = true
}

// 删除
const handleDel = (id) => {
    ElMessageBox.confirm($t('删除后不可恢复，确认要删除吗？'), $t('删除'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteCommonProblemData({ id }).then(() => {
            fetchData();
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss">
.common-problem {
    .head {
        width: 800px;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
        padding-right: 20px;
    }
}
</style>
