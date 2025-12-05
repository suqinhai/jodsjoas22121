<template>
    <!-- 会员提现免首充 -->
    <div class="container withdrawal-avoid-first-recharge">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.user-mark-account.addCashIgnore'">
                <el-button v-throttle type="primary" @click="state.showAddDialog = true">{{$t('新 增')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('注：添加进这个列表的用户提现不受提现参数设置里首次提现要求累计充值金额达到多少的限制。')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.userId || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.username || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="remark" :label="$t('备注')" min-width="160" align="center" />
            <el-table-column prop="empName" :label="$t('操作人')" min-width="120" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="120">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-permiss="'merchant.user-mark-account.addCashIgnore'" text
                        @click="handleMove(row.id)">{{$t('移除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page"
            v-model:limit="state.listQuery._size" @pagination="fetchData">
        </Pagination>

        <AddDialog v-if="state.showAddDialog" @close="state.showAddDialog = false" @fetchData="fetchData">
        </AddDialog>
    </div>
</template>

<script setup name='withdrawalAvoidFirstRecharge'>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import { ElMessageBox } from "element-plus";
import { getCashIgnoreList, deleteCashIgnoreData } from '@/api/member'
import { dateFormat } from '@/common/util'
const AddDialog = defineAsyncComponent(() => import('./components/AddDialog.vue'))

const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    showAddDialog: false,
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.formData, ...state.listQuery }
    globalVBus.$emit('globalLoading', true)
    getCashIgnoreList(params).then((res) => {
        let { data } = res
        if (data && data.list) {
            state.tableData = data.list.map(item => {
                item.updateTime && (item.updateTime = dateFormat(item.updateTime))
                return item
            })
            state.total = data.total || 0
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

// 移除
const handleMove = (ids) => {
    ElMessageBox.confirm($t('确定移除此账号吗？'), $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteCashIgnoreData({ ids }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(err => { })
}
</script>

<style lang="scss">
.withdrawal-avoid-first-recharge {
}
</style>
