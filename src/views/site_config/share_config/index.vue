<template>
    <!-- 分享配置 -->
    <div class="share-config container">
        <div class="share-config-box">
            <div class="main-box">
                <div class="head" v-permiss="'merchant.agent.awardCfgEdit-1'">
                    <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
                </div>
                <el-table class="table-box" :data="state.tableData" border>
                    <el-table-column prop="sort" :label="$t('排序')" width="80" align="center" />
                    <el-table-column prop="info.name" :label="$t('名称')" min-width="120" align="center" />
                    <el-table-column :label="$t('图标')" min-width="120" align="center">
                        <template #default="{ row }">
                            <el-image v-if="!!row.info.icon" class="imgs" :src="row.info.icon" :crossorigin="null" :preview-src-list="[row.info.icon]"
                                preview-teleported fit="contain" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="info.url" :label="$t('唤醒H5地址')" min-width="300" align="center" />
                    <el-table-column prop="status" :label="$t('大厅展示开关')" width="170" align="center">
                        <template #default="{row}">
                            <el-switch :disabled="!userData.isHasPermiss('merchant.agent.awardCfgEdit-1')" v-model="row.status" :active-value="1"
                                :inactive-value="0" @change="handleSwitch(row)" />
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" :label="$t('操作')" min-width="120" align="center"
                        v-if="userData.isHasPermiss('merchant.agent.awardCfgEdit-1')">
                        <template #default="{ row }">
                            <el-button v-throttle type="primary" v-if="row.level !== 1" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                            <el-button v-throttle type="danger" v-if="row.level !== 1" text @click="handleDelete(row.id)">{{$t('删除')}}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <Pagination v-show="!!state.total" :total="state.total" v-model:page="state.pageConfig._page" v-model:limit="state.pageConfig._size"
                    @pagination="fetchData">
                </Pagination>
            </div>
            <div class="demonstration">
                <div class="title">{{$t('PC示意图')}}</div>
                <img class="share" src="../../../assets/img/agent/share_pc.png" alt="">
                <div class="title">{{$t('H5示意图')}}</div>
                <img class="share" src="../../../assets/img/agent/share_h5.png" alt="">
            </div>
        </div>

        <SoftwarePromotionDialog v-if="state.showDeployDialog" :itemData="state.itemData" @close="state.showDeployDialog = false"
            @fetchData="fetchData">
        </SoftwarePromotionDialog>
    </div>
</template>

<script setup name="shareConfig">
import { defineAsyncComponent, reactive, onMounted, nextTick } from "vue"
import { ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { getRebateSettingList, deleteRebateSettingData, postRebateSettingStatus } from "@/api/agent.js"
const SoftwarePromotionDialog = defineAsyncComponent(() => import("./components/SoftwarePromotionDialog.vue"))

const state = reactive({
    tableData: [],
    total: 0,
    pageConfig: {
        _page: 1,
        _size: 20,
    },
    itemData: {},
    showDeployDialog: false,
    isBegin: false,
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    state.isBegin = true
    getRebateSettingList({ type: 4, part: 'share', ...state.pageConfig }).then(res => {
        state.tableData = res.data.list
        state.total = res.data.total || 0
        nextTick(() => {
            state.isBegin = false
        })
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.isBegin = false
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 编辑
const handleConfig = (row) => {
    state.itemData = { ...row }
    state.showDeployDialog = true
}

const handleSwitch = (row) => {
    if (state.isBegin) return
    globalVBus.$emit('globalLoading', true)
    postRebateSettingStatus({ id: row.id, status: row.status }).then(res => {
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        row.status = row.status ? 0 : 1
        globalVBus.$emit('globalLoading', false)
    })
}

// 删除
const handleDelete = (id) => {
    ElMessageBox.confirm($t('确定要删除此推广软件配置吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteRebateSettingData({ id, type: 4 }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang='scss'>
.share-config {
    .share-config-box {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        height: 100%;
    }
    .main-box {
        flex-shrink: 0;
        width: 900px;
        display: flex;
        flex-direction: column;
        .head {
            display: flex;
            justify-content: flex-end;
            padding-right: 20px;
            margin-bottom: 10px;
        }
    }

    .demonstration {
        flex-shrink: 0;
        margin-top: 40px;
        margin-left: 50px;
        .title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .share {
            width: 354px;
            height: 190px;
            margin-bottom: 40px;
        }
    }
}
</style>
