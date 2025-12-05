<template>
    <!-- 有奖反馈-表格 -->
    <div class="container-main rewarded-feedback-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item v-if="type !== 0">
                <el-select style="width: 100px" v-model="state.formData.timeType" :placeholder="$t('时间类型')">
                    <el-option :label="$t('反馈时间')" :value="0" />
                    <el-option :label="$t('操作时间')" :value="1" />
                </el-select>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('来源:')">
                <el-select class="select-box" v-model="state.formData.source" clearable :placeholder="$t('请选择来源')">
                    <el-option v-for="item in clientData" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('状态:')" v-if="type === ''">
                <el-select class="select-box" v-model="state.formData.status" clearable :placeholder="$t('请选择状态')">
                    <el-option :label="$t('待处理')" :value="0" />
                    <el-option :label="$t('已采纳')" :value="1" />
                    <el-option :label="$t('已忽略')" :value="2" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('反馈账号:')">
                <el-input v-model="state.formData.userName" :placeholder="$t('请输入反馈账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="id" label="ID" min-width="80" align="center" />
            <el-table-column prop="username" :label="$t('反馈账号')" min-width="100" align="center" />
            <el-table-column prop="source" :label="$t('来源')" min-width="100" align="center" />
            <el-table-column prop="addTime" :label="$t('反馈时间')" min-width="160" align="center">
                <template #default="{ row }">{{ dateFormat(row.addTime)  }}</template>
            </el-table-column>
            <el-table-column v-if="type === ''" :label="$t('状态')" min-width="100" align="center">
                <template #default="{ row }">
                    <div v-if="row.status === 0">{{$t('待处理')}}</div>
                    <div v-if="row.status === 1">{{$t('已采纳')}}</div>
                    <div v-if="row.status === 2">{{$t('已忽略')}}</div>
                </template>
            </el-table-column>
            <el-table-column v-if="type === 1" prop="giftAmount" :label="$t('采纳奖金')" min-width="100" align="center" />
            <el-table-column v-if="type !== 0" prop="operator" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column v-if="type !== 0" prop="updateTime" :label="$t('操作时间')" min-width="160" align="center">
                <template #default="{ row }">{{ dateFormat(row.updateTime)  }}</template>
            </el-table-column>

            <el-table-column fixed="right" align="center" :label="$t('操作')" width="100">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.feedback.edit'" v-throttle type="primary" text @click="handleDispose(row)">
                        {{row.status === 0 ? $t('处理') : $t('查看')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page" @pagination="fetchData"></Pagination>

        <DisposeDialog v-if="state.disposeDialoglShow" :itemData="state.itemData" @fetchData="fetchData" @lookVideo="lookVideo" @close="state.disposeDialoglShow = false">
        </DisposeDialog>

        <div v-if="state.isShow" class="video-preview" @click="state.isShow = false">
            <video controls :src="state.videoUrl" />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getFeedBackList } from '@/api/operation'
import { getShortcuts, dateFormat, disabledCurrentDateAfter } from '@/common/util'
import { getCommonMeta } from '@/api/common'
const DisposeDialog = defineAsyncComponent(() => import('./DisposeDialog.vue'))

const shortcuts = getShortcuts()
const props = defineProps({
    type: {
        type: [Number, String],
        default: ''
    }
})
const state = reactive({
    formData: {
        timeType: 0
    },
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    disposeDialoglShow: false,
    itemData: {},
    batchType: '',
    isShow: false,
    videoUrl: ''
})
const clientData = ref([])
const router = useRouter()

watch(
    () => props.type,
    (val) => {
        state.total = 0
        state.tableData = []
        state.listQuery._page = 1
        state.listQuery._size = 10
        state.formData = {
            timeType: 0
        }
        fetchData()
    },
)

getCommonMeta({ types: 'client' }).then(({ code, data }) => {
    if (code === 0 && data) {
        clientData.value = data.client || {}
    }
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                timeType: 0
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    } else {
        delete params.timeType
    }
    delete params.receiveTime
    if (typeof props.type === 'number') params.status = props.type
    globalVBus.$emit('globalLoading', true)
    getFeedBackList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 按钮操作
const handleDispose = (row) => {
    state.itemData = { ...row }
    state.disposeDialoglShow = true
}

const lookVideo = (val) => {
    state.videoUrl = val
    state.isShow = true
}
</script>

<style lang="scss">
.rewarded-feedback-main {
    .video-preview {
        position: fixed;
        width: 100vw;
        height: 100vh;
        left: 0;
        top: 0;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;

        video {
            width: 800px;
            height: 600px;
            background-color: #fff;
        }
    }
}
</style>
