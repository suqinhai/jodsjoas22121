<template>
    <!-- 运营中心-活动排行榜统计 -->
    <div class="container">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-select class="select-box" v-model="state.formData.type" :placeholder="$t('请选择排行榜')" filterable @change="getActivityList">
                   <el-option v-for="item in state.metaData.rankingType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
			<el-form-item>
			    <el-select class="select-box" v-model="state.formData.id" :placeholder="$t('请选择活动')" clearable filterable @change="changeActivity">
			       <el-option v-for="item in state.activityList" :key="item.id" :label="item.name" :value="item.id" />
			    </el-select>
			</el-form-item>
			<el-form-item>
				<el-date-picker v-model="state.formData.receiveTime" 
				v-if="[0,1,2].includes(state.activity.rules_.duration)" 
				:type="dataType[state.activity.rules_.duration]"  
				:placeholder="$t('请选择')" 
				:format="[1,2].includes(state.activity.rules_.duration) ? (state.start + $t('至') + state.end) : state.formData.receiveTime"
				@change="showData"
				value-format="YYYY-MM-DD"
				> </el-date-picker>
			 </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('查询时间为活动排行榜任务周期内时间，如任务为日排行，则只天查询；默认当天排名。')}}</div>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="rank" :label="$t('排名')" min-width="120" align="center" />
            <el-table-column prop="username" :label="$t('会员账号')" min-width="120" align="center">
				<template #default="{ row }">
			        <span v-if="row.isVirtual == 0" class="special pointer" @click="showMemberDetail(row.userId)">{{row.username || ''}}</span>
					<span v-if="row.isVirtual == 1">{{row.username || ''}}</span>
			    </template>
			</el-table-column>
            <el-table-column prop="isVirtual" :label="$t('是否虚拟账号')" min-width="140" align="center">
				<template #default="{ row }">
					<span v-if="row.isVirtual == 0">{{ $t('否') }}</span>
					<span v-if="row.isVirtual == 1">{{ $t('是') }}</span>
				</template>
			</el-table-column>
            <el-table-column prop="reward" :label="$t('奖励')" min-width="140" align="center">
				<template #default="{ row }">
					<span v-if="row.reward && row.ticketName">{{row.reward + '+' + row.ticketName}}<span v-if="row.ticketName && !row.ticketEnable">(已停用)</span></span>
					<span v-else-if="row.reward">{{row.reward}}</span>
					<span v-else-if="row.ticketName">{row.ticketName}<span v-if="row.ticketName && !row.ticketEnable">(已停用)</span></span>
				</template>
			</el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="activityRankingStatistics">
import { reactive, onMounted, ref } from "vue"
import { postRankList } from '@/api/operation.js'
import { promotionListApi } from "@/api/discounts_center.js"
import { getCommonMeta } from '@/api/common'
import { deepClone } from '@/common/util'

const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
	metaData: {},
	activityList: [],
	activity: {
		rules_:{}
	},
	start: '',
	end: ''
})
const dataType = ref(['data','week','month'])


onMounted(() => {
	getCommonMeta({ types: 'rankingType' }).then(res => {
	    state.metaData.rankingType = res.data.rankingType
	})
	fetchData()
	// getActivityList()
})


const showData = ()=>{
	if(state.activity.rules_.duration == 1){
		state.start = deepClone(state.formData.receiveTime);
		state.end = newGetDateConversion(state.start,'day')
	}
	if(state.activity.rules_.duration == 2){
		state.start = deepClone(state.formData.receiveTime);
		state.end = newGetDateConversion(state.start,'month')
	}
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const changeActivity = ()=>{
	state.activity = state.activityList.find((item)=>{ return item.id ==  state.formData.id}) || {rules_:{}}
	state.formData.receiveTime = ''
}

// 表格过滤数据处理
const getActivityList = (val = '') => {
	const data = { _page: 1, _size: 1000, type: 13, status: '0,3,4', rankType: state.formData.type}
    promotionListApi(data).then(res => {
		state.formData.id = ''
        let { total, list } = res.data
        state.activityList = list
    })
}


// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
				
			}
			state.activity = {
				rules_:{}
			}
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime) {
		if(state.activity.rules_.duration === 0){
			params['interval.begin'] = receiveTime + ' 00:00:00'
			params['interval.end'] = receiveTime + ' 23:59:59'
		}
		if(state.activity.rules_.duration === 1){
			params['interval.begin'] = receiveTime + ' 00:00:00'
			params['interval.end'] = getDateConversion(receiveTime + ' 00:00:00','day')
		}
		if(state.activity.rules_.duration === 2){
			params['interval.begin'] = receiveTime + ' 00:00:00'
			params['interval.end'] = getDateConversion(receiveTime + ' 00:00:00','month')
		}
    }
	state.listQuery._page > 1 ? params.originScore = state.tableData[state.tableData.length-1].originScore : ''
    delete params.receiveTime
	if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    postRankList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

function getDateConversion(dateString,type) {
    // 将传入的日期字符串解析为Date对象
    const newInputDate = new Date(dateString);
	if(type === 'day'){
		// 添加7天
		newInputDate.setDate(newInputDate.getDate() + 7);
	}
	if(type === 'month'){
		// 添加1个月
		newInputDate.setMonth(newInputDate.getMonth() + 1);
	}
	
	const inputDate = new Date(newInputDate.getTime() - 1000)
	
    // 返回1个月后的日期，格式为 'YYYY-MM-DD HH:mm:ss'
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');  // 月份从0开始，需加1
    const day = String(inputDate.getDate()).padStart(2, '0');
    const hours = String(inputDate.getHours()).padStart(2, '0');
    const minutes = String(inputDate.getMinutes()).padStart(2, '0');
    const seconds = String(inputDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function newGetDateConversion(dateString,type) {
    // 将传入的日期字符串解析为Date对象
    const newInputDate = new Date(dateString + ' 00:00:00');
	if(type === 'day'){
		// 添加7天
		newInputDate.setDate(newInputDate.getDate() + 7);
	}
	if(type === 'month'){
		// 添加1个月
		newInputDate.setMonth(newInputDate.getMonth() + 1);
	}
	const inputDate = new Date(newInputDate.getTime() - 1000)
	
    // 返回1个月后的日期，格式为 'YYYY-MM-DD HH:mm:ss'
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');  // 月份从0开始，需加1
    const day = String(inputDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
</script>

<style lang="scss" scoped>
</style>
