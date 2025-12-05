
<template>
    <!-- vip等级额度上限列表 -->
    <div class="container vip-limiting-game">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('当前站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId" @change="fetchData('search')">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('vip等级:')">
                <el-select class="select-box" v-model="state.formData.level" clearable :placeholder="$t('vip等级')">
                    <el-option v-for="item in userLevel" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.vip-balance-ctrl.kickOffline'">
                <el-button v-throttle type="primary" @click="handleBatchOperation">{{$t('批量操作')}}</el-button>
            </el-form-item>
            
        </el-form>
        <div class="tips-w">
           <p>{{$t('说明：该列表检测在游戏中(NEWPG/NEWPP/NEWJILI)的会员余额，达到vip等级上限后进入列表，操作后不可进入游戏(NEWPG/NEWPP/NEWJILI)。')}}</p> 
           <p>{{$t('系统每隔3分钟检测一次，若高峰人数较多则可能增加检测时间。')}}</p> 
           <p>{{$t('针对vip等级会员在玩控制游戏（(NEWPG/NEWPP/NEWJILI）时，判断触发当前余额上限时进入列表，触发进入列表的会员不会因游戏输赢低于上限而移除，需要进行人工处理‘踢下线并禁止进入游戏’，操作后会员将被踢出，且不可进入控制游戏；')}}</p> 
           <p>{{$t('对会员进行修改状态为正常，才可移除限制状态；')}}</p> 
           <p>{{$t('特殊情况：被触发进入列表的会员，若vip等级变更则自动移除列表；')}}</p> 
        </div>
        <div class="all-page">
            <div class="active-page">{{$t('本页')}}</div>
        </div>
        <el-table class="table-box" :data="state.tableData" border @selection-change="handleSelectionChange" ref="tableRef">
            <el-table-column fixed="left" type="selection" width="120" />
            <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="120" align="center" />
            <el-table-column prop="addTime" :label="$t('触发时间')" min-width="160" align="center" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('vip等级')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="" >{{$t('VIP')}} {{row.level || 0}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="balance" :label="$t('当前余额')" min-width="120" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="220" >
                <template #default="{ row }" >
                    <el-button v-permiss="'merchant.vip-balance-ctrl.kickOffline'" v-throttle type="primary"  text @click="handleKickOffline(row)">{{$t('踢下线并禁止进入游戏')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData" :selectedNum="state.selectionItem.length" :isShowChecked="state.selectionItem.length > 0">
        </Pagination>
    </div>
</template>

<script setup name='VipLimitingList'>
import { getLimitList, postKickOffline } from '@/api/member'
import { reactive, onMounted, ref, nextTick, onBeforeUnmount } from 'vue'
import userStore from '@/store/user'
import { ElMessageBox, ElMessage } from "element-plus";
import { dateFormat } from '@/common/util'
import commonStore from '@/store/common'
import { useRoute } from 'vue-router'
const props = defineProps({
    userLevel: {
        type: Array,
        default: () => [],
    },
})

const userData = userStore()
const commonData = commonStore()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    selectionIds: '',
    selectionItem: [],
})

const tableRef = ref()
const route = useRoute()

onMounted(() => {
    if(route.query.level || route.query.level === 0){
        state.formData.level = Number(route.query.level)
        state.formData.merchantId = Number(route.query.merchantId)
    }
    fetchData()
})
onBeforeUnmount(() => {
    if (tableRef.value) {
        tableRef.value = null
    }
})

const handleSelectionChange = (selection) => {
    if (state && typeof state === 'object') {
        nextTick(() => {
            state.selectionItem = selection || []
            state.selectionIds = selection.map(item => item.id).join(',')
        })
    }
}

const handleBatchOperation = () => {
    if (!state.selectionIds.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }
    confirmBatchKickOffline()
}


const fetchData = async (action = '') => {
    try {
        if (action && action !== 'export') {
            state.listQuery._page = 1
            if (action === 'reset') {
                state.formData = {
                    merchantId: 0
                }
            }
        }
        const params = { ...state.formData, ...state.listQuery }
        globalVBus.$emit('globalLoading', true)
        const res = await getLimitList(params)
        if (res.data && res.data.list) {
            // res.data.list.forEach((item)=>{
            //     item.merchantId = state.formData.merchantId
            // })
            state.tableData = res.data.list.map(item => ({
                ...item,
                addTime: item.addTime ? dateFormat(item.addTime) : ''
            }))
            state.total = res.data.total || 0
        } else {
            state.tableData = []
            state.total = 0
        }
    } catch (err) {
        state.tableData = []
    } finally {
        globalVBus.$emit('globalLoading', false)
    }
}

const showMemberDetail = (userId) => {
    globalVBus.$emit('memberDetailDialog', userId)
}

const handleKickOffline = async (row) => {
    ElMessageBox.confirm(
        $t(`是否踢下线并禁止进入游戏？`),
        $t('提示'),
        {
            type: 'warning'
        }
    ).then(async () => {
       const params = { ctrlIds: row.id, merchantId: row.merchant.id }
        const res = await postKickOffline(params)
        if(res.code === 0) {
            await fetchData()
        }
    }).catch(() => {
    })
}

const confirmBatchKickOffline = () => {
    ElMessageBox.confirm(
        $t(`已选择${state.selectionItem.length}条数据，是否踢下线并禁止进入游戏？`),
        $t('提示'),
        {
            type: 'warning'
        }
    ).then(async () => {
        await performBatchKickOffline()
    }).catch(() => {
    })
}

const performBatchKickOffline = async () => {
    try {
        const ctrlIds = state.selectionItem.map(item => item.id).join(',')
        
        if (!ctrlIds) {
            return ElMessage.warning($t('暂无符合操作的数据！'))
        }
        
        globalVBus.$emit('globalLoading', true)
        const res = await postKickOffline({ ctrlIds })
        
        if (res.code === 0) {
            await fetchData()
        } else {
            ElMessage.error($t(res.msg))
        }
    } catch (err) {
        ElMessage.error($t('请求失败！'))
    } finally {
        globalVBus.$emit('globalLoading', false)
    }
}

</script>

<style lang="scss">
.vip-limiting-game {
    .operate{
        margin-left: 20px;
    }
    .item-row {
        display: flex;
        align-items: center;
        justify-self: start;
    }
    .tips-w{
        margin-bottom: 15px;
        line-height: 24px;
        color: #606266;
    }
    .all-page{
        position: relative;
        color: #909399;
        font-weight: 600;
        z-index: 100;
        .active-page{
            position: absolute;
            bottom: -30px;
            left: 40px;
            color: #909399;   
            font-weight: 600;
        }
    }
    
}
</style>
