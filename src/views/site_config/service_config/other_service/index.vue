<template>
    <!-- 客服配置-其他客服 -->
    <div class="tabs-main other-service">
        <div class="head" v-permiss="'admin.customer-service-config.otherEdit'">
            <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="sort" :label="$t('排序')" width="100" align="center" />
            <el-table-column label="IM" min-width="120" align="center">
                <template #default="{ row }">
                    <el-image v-if="!!getImImg(row)" class="imgs" :src="getImImg(row)" :crossorigin="null" :preview-src-list="[getImImg(row)]"
                        preview-teleported fit="contain" />
                </template>
            </el-table-column>
            <el-table-column prop="account" :label="$t('账号')" min-width="120" align="center" />
            <el-table-column prop="nickname" :label="$t('昵称')" min-width="120" align="center" />
            <el-table-column :label="$t('代理链接（可多个）')" min-width="160" align="center">
                <template #default="{ row }">
                    {{(row.channelList?.length || 0) + (row.agentList?.length || 0)}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('开关')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-switch :disabled="!userData.isHasPermiss('admin.customer-service-config.otherEdit')" v-model="row.status" :active-value="1"
                        :inactive-value="0" @click="switchChange(row)" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="140">
                <template #default="{ row }">
                    <el-button v-permiss="'admin.customer-service-config.otherEdit'" v-throttle type="primary" text @click="handleConfig(row)">
                        {{$t('修改')}}</el-button>
                    <el-button v-permiss="'admin.customer-service-config.otherDelete'" v-throttle type="danger" text @click="handleDel(row.id)">
                        {{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <DeployDialog v-if="state.showDeployDialog" :imType="state.imType" :itemData="state.itemData" @close="state.showDeployDialog = false"
            @fetchData="fetchData">
        </DeployDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { ElMessageBox } from "element-plus";
import { getOtherServiceList, delOtherServiceData, postOtherServiceData, getOtherLinkList } from '@/api/service'
import { getCommonMeta } from '@/api/common'
import userStore from '@/store/user'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const state = reactive({
    tableData: [],
    itemData: {},
    showDeployDialog: false,
    imType: []
})
const userData = userStore()

getCommonMeta({ types: 'imType' }).then(({ data, code }) => {
    if (code === 0 && data && data.imType) {
        state.imType = data.imType || []
    }
})

onMounted(() => {
    fetchData()
})

// 获取表格数据
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getOtherServiceList().then(res => {
        state.tableData = res.data || []
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const getImImg = (row) => {
    let obj = state.imType.find(item => +item.value === +row.type)
    return obj ? `/img/im/${obj.label.toLowerCase()}.png` : ''
}

// 新增/修改
const handleConfig = (row) => {
    globalVBus.$emit('globalLoading', true)
    getOtherLinkList({
        _page: 1,
        _size: 999,
        tab: 1,
        id: row.id || ''
    }).then(res => {
        let { list = [] } = res.data
        state.itemData = { ...row }
        state.itemData.dataList = list
        state.showDeployDialog = true
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })

}

// 删除
const handleDel = (id) => {
    ElMessageBox.confirm($t('删除后不可恢复，确认要删除吗？'), $t('删除'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        delOtherServiceData({ id }).then(() => {
            fetchData();
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

// 状态切换
const switchChange = (row) => {
    globalVBus.$emit('globalLoading', true)
    postOtherServiceData({ ...row }).then(res => {
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        row.status = !row.status ? 1 : 0
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.other-service {
    .head {
        width: 100%;
        padding-right: 20px;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
    }
}
</style>
