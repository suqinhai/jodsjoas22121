<template>
    <!-- 代理中心-三级代理奖励-明细 -->
    <Dialog ref="dialog" :width="900" :title="$t('明细')" buttonCenter top="15vh" :isShowBottomButton="false"
        @cancel="cancel">
        <el-table class="table-box" :data="state.tableList" border v-loading="state.loading">
            <el-table-column prop="addTime" :label="$t('时间')" align="center" min-width="180" />
            <el-table-column :label="$t('奖励贡献者ID')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.userId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('奖励贡献者账号')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.username }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('奖励贡献者代理层级')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ [$t('一级'),$t('二级'),$t('三级')][+row.level] }}
                </template>
            </el-table-column>
            <el-table-column prop="totalCommission" :label="$t('奖励金额')" align="center" min-width="120" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page"
            v-model:limit="pageConfig._size" @pagination="fetchData">
        </Pagination>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { getThirdRewardDetail } from "@/api/agent.js";
import { dateFormat } from "@/common/util/index"

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {},
    tableList: [],
    total: 0,
    loading: false,
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
    state.loading = true
    params.userId = props.itemData.userId
    getThirdRewardDetail(params).then(({data}) => {
        let { total, list } = data
        state.tableList = list.map(item => {
            item.addTime = dateFormat(item.addTime)
            return item
        }) || []
        state.total = total
        state.loading = false
    }).catch(err => {
        state.tableList = []
        state.total = 0
        state.loading = false
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
</style>
