<template>
    <!-- 运营中心-给平台提建议 -->
    <div class="container advise-platform-main">
       <el-form class="filter-form" :model="state.formData" inline>
			<el-form-item>
			    <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
			        :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
			</el-form-item>
			<el-form-item label="ID">
			    <el-input @input="(val) => state.formData.id = val.replace(/\D/g,'')" v-model="state.formData.id"
			        :placeholder="$t('请输入ID')" />
			</el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
			<el-form-item>
			    <el-button v-throttle type="primary" @click="state.itemData = {};state.suggestionDialogShow = true">{{$t('新增')}}</el-button>
			</el-form-item>
        </el-form>
        <el-table :data="state.tableData" class="table-box" border>
			<el-table-column prop="id" label="ID" align="center" />
            <el-table-column prop="feedbackContent" :label="$t('建议内容')" align="center" />
            <el-table-column prop="addTime" :label="$t('提出日期')" align="center" />
			<el-table-column prop="updateTime" :label="$t('完结时间')" align="center" />
			<el-table-column prop="status" :label="$t('状态')" align="center">
				<template #default="{ row }">
			        <span v-if="row.status == 0">{{ $t('待处理') }}</span>
					<span v-if="row.status == 1">{{ $t('已处理') }}</span>
			    </template>
			</el-table-column>
			<el-table-column :label="$t('操作')" align="center">
			    <template #default="{ row }">
			        <el-button v-throttle type="primary" text @click="handleView(row)">{{$t('查看')}}</el-button>
			    </template>
			</el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
		<SuggestionDialog v-if="state.suggestionDialogShow" :itemData="state.itemData" @fetchData="fetchData" @lookVideo="lookVideo" 
		@close="state.suggestionDialogShow = false"></SuggestionDialog>
		<div v-if="state.isShow" class="video-preview" @click="state.isShow = false">
		    <video controls :src="state.videoUrl" />
		</div>
    </div>
</template>

<script setup name="advisePlatform">
import { reactive, onMounted, defineAsyncComponent, ref } from "vue"
import { getShortcuts, disabledCurrentDateAfter } from "@/common/util/index"
import { getFeedBackList } from '@/api/operation.js'
import { dateFormat } from '@/common/util'
const SuggestionDialog = defineAsyncComponent(() => import('./components/SuggestionDialog.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
		type: 2,
    },
	suggestionDialogShow: false,
	isShow: false,
	videoUrl: '',
	itemData: {}
})

onMounted(() => {
    fetchData()
})

const handleView = (row)=>{
	state.itemData = { ...row }
	state.suggestionDialogShow = true
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = {
        ...state.listQuery,
        ...state.formData
    }
	let { receiveTime } = state.formData
	if (receiveTime && receiveTime.length) {
	    params['interval.begin'] = receiveTime[0]
	    params["interval.end"] = receiveTime[1]
	}
	delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getFeedBackList(params).then(({ data = {}, ext = {} }) => {
        if (!params.isExport) {
            state.tableData = data.list || []
			state.tableData = data.list.map(item => {
			    item.addTime && (item.addTime = dateFormat(item.addTime))
				item.updateTime && (item.updateTime = dateFormat(item.updateTime))
			    return item
			})
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

const lookVideo = (val) => {
    state.videoUrl = val
    state.isShow = true
}
</script>

<style lang="scss">
.advise-platform-main {
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