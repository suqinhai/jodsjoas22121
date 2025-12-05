<template>
    <!-- 音乐管理 -->
    <div class="container music-manage">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('音乐开关:')">
                <el-switch :disabled="!userData.isHasPermiss('merchant.radio.edit')" v-model="state.formData.radioShow" :active-value="1"
                    :inactive-value="0" @change="switchChange('radioShow')" />
            </el-form-item>
            <!-- <el-form-item :label="$t('默认播放开关:')">
                <el-switch :disabled="!userData.isHasPermiss('merchant.radio.edit')" v-model="state.formData.radioPlay"
                    :active-value="1" :inactive-value="0" @change="switchChange('radioPlay')" />
            </el-form-item> -->
            <el-button class="button-box" v-permiss="'merchant.radio.edit'" v-throttle type="primary" @click="handleConfig({})">{{$t('新增')}}
            </el-button>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="sort" :label="$t('排序')" min-width="100" align="center" />
            <el-table-column prop="name" :label="$t('歌曲名称')" min-width="140" align="center" />
            <el-table-column prop="info.size" :label="$t('大小/MB')" min-width="100" align="center">
                <template #default="{ row }">
                    {{row.info && row.info.size ? (row.info.size/1024/1024).toFixed(2) : ''}}
                </template>
            </el-table-column>
            <el-table-column prop="info.fileName" :label="$t('源文件')" min-width="200" align="center" />
            <el-table-column :label="$t('停/启用')" min-width="120" align="center">
                <template #default="{ row }">
                    <el-switch :disabled="!userData.isHasPermiss('merchant.radio.edit')" v-model="row.status" :active-value="1" :inactive-value="0"
                        @change="handleStatus(row,'status')" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('操作')" fixed="right" align="center" width="140">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.radio.edit'" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                    <el-button v-permiss="'merchant.radio.edit'" v-throttle type="danger" text @click="handleStatus(row,'')">{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DeployDialog v-if="state.showDialog" :itemData="state.itemData" @close="state.showDialog = false" @fetchData="fetchData"
            @attemptAudio="attemptAudio">
        </DeployDialog>
    </div>
</template>

<script setup name='retentionStatistics'>
import { reactive, onMounted, defineAsyncComponent, nextTick } from 'vue'
import { ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { getMusicList, postMusicStatus, postMusicConfig } from '@/api/operation'
const DeployDialog = defineAsyncComponent(() => import("./components/DeployDialog.vue"))

const state = reactive({
    extData: {
        type: 32
    },
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showDialog: false,
    isHand: false,
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    state.isHand = false
    globalVBus.$emit('globalLoading', true)
    getMusicList(state.listQuery).then(({ ext, data }) => {
        let { total, list } = data
        state.tableData = list || []
        let obj = ext && ext.value ? JSON.parse(ext.value) : {}
        state.extData.id = ext.id || ''
        state.extData.type = ext.type || 32
        state.formData.radioShow = obj.radioShow ? 1 : 0
        state.formData.radioPlay = obj.radioPlay ? 1 : 0
        state.total = total
        globalVBus.$emit('globalLoading', false)
        nextTick(() => {
            state.isHand = true
        })
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
        nextTick(() => {
            state.isHand = true
        })
    })
}

const handleConfig = (row) => {
    state.itemData = { ...row }
    state.showDialog = true
}

const switchChange = (key) => {
    if (!state.isHand) return
    globalVBus.$emit('globalLoading', true)
    postMusicConfig({
        ...state.extData,
        value: JSON.stringify(state.formData)
    }).then(res => {
        fetchData()
    }).catch(err => {
        state.formData[key] = state.formData[key] ? 0 : 1
        globalVBus.$emit('globalLoading', false)
    })
}

const handleStatus = (row, key = '') => {
    let { id, status } = row
    let params = { id, status }
    if (key) return editMusicStatus(params, row, key)
    ElMessageBox.confirm($t('确定要删除此音乐配置吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        params.status = -1
        editMusicStatus(params, row, key)
    }).catch(() => { })
}

const editMusicStatus = (params, row, key = '') => {
    globalVBus.$emit('globalLoading', true)
    postMusicStatus(params).then(res => {
        fetchData()
    }).catch(err => {
        if (key) {
            row.status = row.status ? 0 : 1
        }
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.music-manage {
    .button-box {
        float: right;
        margin-right: 40px;
    }
}
</style>
