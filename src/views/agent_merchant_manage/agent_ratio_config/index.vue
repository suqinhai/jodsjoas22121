<template>
    <!-- 代理商比例配置 -->
    <div class="container agentRatioConfig">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item :label="$t('代理ID:')">
                <el-input v-model="state.searchData.userId" @input="(val) => state.searchData.userId = val.replace(/\D/g,'')" :placeholder="$t('请输入代理ID')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border>
            <el-table-column prop="updateTime" :label="$t('操作日期')" align="center" min-width="160">
                <template #default="{ row }">
                    <span>{{ dateFormat(row.updateTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="effectTime" :label="$t('生效日期')" align="center" min-width="160">
                <template #default="{ row }">
                    <span>{{ dateFormat(row.effectTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="user.id" :label="$t('ID（代理）')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.id }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="user.name" :label="$t('账号（代理）')" align="center" min-width="140">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="aoRate_4" :label="$t('充值支付通道费率%(初始)')" align="center" min-width="120" />
            <el-table-column prop="abRate_4" :label="$t('充值支付通道费率%变更前')" align="center" min-width="120" />
            <el-table-column prop="aaRate_4" :label="$t('充值支付通道费率%变更后')" align="center" min-width="120" />
            <el-table-column prop="aoRate_3" :label="$t('分成比例%(初始)')" align="center" min-width="120" />
            <el-table-column prop="abRate_3" :label="$t('分成比例%变更前')" align="center" min-width="120" />
            <el-table-column prop="aaRate_3" :label="$t('分成比例%变更后')" align="center" min-width="120" />
            <el-table-column prop="aoRate_0" :label="$t('游戏抽成%(初始)')" align="center" min-width="120" />
            <el-table-column prop="abRate_0" :label="$t('游戏抽成%变更前')" align="center" min-width="120" />
            <el-table-column prop="aaRate_0" :label="$t('游戏抽成%变更后')" align="center" min-width="120" />
            <el-table-column prop="aoRate_2" :label="$t('rtp<100抽成%(初始)')" align="center" min-width="120" v-if="isBetMode" />
            <el-table-column prop="abRate_2" :label="$t('rtp<100抽成%变更前')" align="center" min-width="120" v-if="isBetMode" />
            <el-table-column prop="aaRate_2" :label="$t('rtp＜100抽成%变更后')" align="center" min-width="120" v-if="isBetMode" />
            <el-table-column prop="aoRate_1" :label="$t('rtp>100抽成%(初始)')" align="center" min-width="120" v-if="isBetMode" />
            <el-table-column prop="abRate_1" :label="$t('rtp>100抽成%变更前')" align="center" min-width="120" v-if="isBetMode" />
            <el-table-column prop="aaRate_1" :label="$t('rtp>100抽成%变更后')" align="center" min-width="120" v-if="isBetMode" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="140">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.agent-manage.shareEdit'" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page" v-model:limit="pageConfig._size"
            @pagination="fetchData">
        </Pagination>

        <AddConfigDialog v-if="state.showAddConfigDialog" :item="state.itemData" @close="state.showAddConfigDialog = false"
            @refresh="fetchData('reset')"></AddConfigDialog>
    </div>
</template>

<script setup name="agentRatioConfig">
import { computed, reactive, onMounted, defineAsyncComponent } from "vue";
import { getShareListData } from "@/api/agent_system.js";
import { getShortcuts, dateFormat } from "@/common/util/index"
import userStore from '@/store/user'

const AddConfigDialog = defineAsyncComponent(() => import('./components/AddConfigDialog.vue'))

const userData = userStore()
const shortcuts = getShortcuts()
const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {
        userId: ''
    },
    tableList: [],
    total: 0,
    showAddConfigDialog: false,
    itemData: {}
})
let metaData = reactive({
    inputTypeList: [
        { label: $t('代理账号'), value: 1, placeholder: $t('请输入代理账号') },
        { label: $t('代理ID'), value: 2, placeholder: $t('请输入代理ID') },
    ]
})

const isBetMode = computed(() => {
    return userData.siteInfo.commissionMode && userData.siteInfo.commissionMode === 2
})

onMounted(() => {
    fetchData()
})

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const fetchData = (val = '') => {
    if (val === 'reset') {
        pageConfig._page = 1
        state.searchData = {}
    }
    let params = {
        ...state.searchData,
        ...pageConfig,
    }
    globalVBus.$emit('globalLoading', true)
    getShareListData(params).then(res => {
        state.tableList = []
        let { total, list } = res.data
        list.forEach((item) => {
            // type 分成类型：0 = 游戏抽成；1 = pgc游戏rtp>100抽成；2 = pgc游戏rtp<100抽成；3 = 分成抽成；4 = 充值支付通道费率；
            item.configs.forEach((configsItem) => {
                item['aoRate_' + configsItem.type] = configsItem.aoRate
                item['aaRate_' + configsItem.type] = configsItem.aaRate
                item['abRate_' + configsItem.type] = configsItem.abRate
                if (!item.effectTime) item['effectTime'] = configsItem.effectTime;
            })
        })
        state.tableList = list || []
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableList = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleConfig = (item) => {
    state.itemData = item
    state.showAddConfigDialog = true
}
</script>

<style lang="scss">
.agentRatioConfig {
    .el-table .total-row > .el-table__cell {
        background-color: #f1ca8c;
    }
}
</style>
