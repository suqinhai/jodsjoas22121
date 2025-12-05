<template>
    <!-- 会员投诉列表 -->
    <div class="container member-complaint">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('状态:')">
                <el-select v-model="state.formData.status" clearable :placeholder="$t('请选择状态')">
                    <el-option :label="$t('待处理')" :value="0" />
                    <el-option :label="$t('已处理')" :value="1" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.userName" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('被投诉日期')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ row.addTime &&  dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="siteId" :label="$t('站点ID')" min-width="80" align="center" />
            <el-table-column prop="siteName" :label="$t('站点名称')" min-width="100" align="center" />
            <el-table-column prop="username" :label="$t('投诉人账号')" min-width="100" align="center" />
            <el-table-column prop="diff" :label="$t('未处理时间（天）')" min-width="130" align="center" />
            <el-table-column :label="$t('投诉人详情')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="handleComplaintDetails(row)">
                        {{$t('查看')}}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column :label="$t('状态')" min-width="100" align="center">
                <template #default="{ row }">
                    {{ row.status === 1 ? $t('已处理') : $t('待处理')}}
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column :label="$t('操作时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ row.updateTime && dateFormat(row.updateTime) }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="100">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.feedback.edit'" v-throttle type="primary" text @click="handleDispose(row,1)">
                        {{row.status === 0 ? $t('处理') : $t('查看')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DisposeDialog v-if="state.disposeDialoglShow" :itemData="state.itemData" @fetchData="fetchData" @lookVideo="lookVideo"
            @close="state.disposeDialoglShow = false">
        </DisposeDialog>
		
		<ComplaintDetails v-if="state.complaintDetailsShow" :itemData="state.itemData" @close="state.complaintDetailsShow = false"></ComplaintDetails>

        <div v-if="state.isShow" class="video-preview" @click="state.isShow = false">
            <video controls :src="state.videoUrl" />
        </div>
    </div>
</template>

<script setup  name="memberComplaint">
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { getComplaintList } from '@/api/operation'
import { getShortcuts, dateFormat, disabledCurrentDateAfter } from '@/common/util'
const DisposeDialog = defineAsyncComponent(() => import('./components/DisposeDialog.vue'))
const ComplaintDetails = defineAsyncComponent(() => import('./components/ComplaintDetails.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    disposeDialoglShow: false,
    itemData: {},
    isShow: false,
    videoUrl: '',
	complaintDetailsShow: false,
})
const route = useRoute()
const commonData = commonStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getComplaintList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleComplaintDetails = (row)=>{
	state.itemData = { ...row }
	state.complaintDetailsShow = true
}

// 按钮操作
const handleDispose = (row, type) => {
    state.itemData = { ...row, operateType: 1 }
    if (type && !row.status) state.itemData.operateType = 0
    state.disposeDialoglShow = true
}

const lookVideo = (val) => {
    state.videoUrl = val
    state.isShow = true
}
</script>

<style lang="scss">
.member-complaint {
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
