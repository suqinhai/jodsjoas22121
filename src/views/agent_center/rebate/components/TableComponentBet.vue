<template>
    <!-- 返佣设置-打码模式 -->
    <div class="rebate-page">
        <div class="head" style="width: 900px;margin-top: 0">
            <div class="tips"></div>
            <el-button v-permiss="'merchant.agent.awardCfgEdit'" v-throttle type="primary" @click="handleConfig({},'showRebateDialog')">{{$t('新 增')}}
            </el-button>
        </div>
        <div style="width: 900px;margin-bottom: 40px;">
            <el-table :data="state.performanceData" border>
                <el-table-column prop="sort" :label="$t('序号')" min-width="80" align="center" />
                <el-table-column prop="inCoin_w" :label="$t('有效投注业绩(单位：万)')" min-width="180" align="center" />
                <el-table-column :label="$t('每万返佣（比例）')" min-width="160" align="center">
                    <template #default="{ row }">
                        {{row.awardAmount}}（{{div(row.awardAmount,100)}}%）
                    </template>
                </el-table-column>
                <el-table-column prop="updateUser.name" :label="$t('操作人')" min-width="120" align="center" />
                <el-table-column :label="$t('操作时间')" width="160" align="center">
                    <template #default="{ row }">
                        {{dateFormat(row.updateTime)}}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('操作')" width="120" align="center" v-if="userData.isHasPermiss('merchant.agent.awardCfgEdit')">
                    <template #default="{ row }">
                        <el-button v-throttle type="primary" text @click="handleConfig(row,'showRebateDialog')">{{$t('修改')}}</el-button>
                        <el-button v-throttle type="danger" text @click="handleDelete(row.id,2)">{{$t('删除')}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
                @pagination="fetchData(2)"></Pagination>
        </div>

        <!-- <div class="head">
            <div class="head-top">
                <div class="title">{{$t('固定比例')}}</div>
                <el-button v-permiss="'merchant.agent.awardCfgEdit'" v-throttle type="primary" @click="handleConfig({},'showRatioDialog')">
                    {{$t('新 增')}}</el-button>
            </div>
            <div class="tips">{{$t('设定后对应用户的返佣将按照固定比例计算')}}</div>
        </div>
        <div style="width: 550px;margin-bottom: 40px;">
            <el-table :data="state.ratioData" border>
                <el-table-column prop="bizId_" :label="$t('固定层级')" min-width="140" align="center" />
                <el-table-column prop="awardAmount" :label="$t('每万返佣')" min-width="140" align="center" />
                <el-table-column :label="$t('操作')" min-width="120" align="center" v-if="userData.isHasPermiss('merchant.agent.awardCfgEdit')">
                    <template #default="{ row }">
                        <el-button v-throttle type="primary" text @click="handleConfig(row,'showRatioDialog')">{{$t('修改')}}</el-button>
                        <el-button v-throttle type="danger" text @click="handleDelete(row.id,1)">{{$t('删除')}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <Pagination v-show="state.fixedTotal > 0" :total="state.fixedTotal" v-model:limit="state.fixedListQuery._size"
                v-model:page="state.fixedListQuery._page" @pagination="fetchData(1)"></Pagination>
        </div> -->

        <div class="head">
            <div class="head-top">
                <div class="title">{{$t('业绩计算')}}</div>
                <el-button v-throttle type="primary" @click="handleConfig(state.rebateData,'showPerformanceDialog')">{{$t('修 改')}}</el-button>
            </div>
            <div class="tips">{{$t('设定后只有达到条件的下级产生的有效投注才会统计业绩')}}</div>
        </div>
        <div class="rebate-table">
            <div class="rebate-table-row">
                <div class="small-box">{{$t('周期内总有效投注')}}≥</div>
                <div class="small-box">{{state.rebateData.inCoin}}</div>
            </div>
            <div class="rebate-table-row">
                <div class="small-box">{{$t('周期内总存款')}}≥</div>
                <div class="small-box">{{state.rebateData.rechargeAmount}}</div>
            </div>
        </div>

        <BetRebateDeploy v-if="state.showRebateDialog" :itemData="state.itemData" @close="state.showRebateDialog = false" @fetchData="fetchData(2,1)">
        </BetRebateDeploy>
        <RatioDeploy v-if="state.showRatioDialog" :metaData="metaData" :itemData="state.itemData" @close="state.showRatioDialog = false"
            @fetchData="fetchData(1,1)">
        </RatioDeploy>
        <PerformanceDeploy v-if="state.showPerformanceDialog" :itemData="state.itemData" @close="state.showPerformanceDialog = false"
            @fetchData="fetchData(0,1)">
        </PerformanceDeploy>
    </div>
</template>

<script setup>
import { defineAsyncComponent, reactive, onMounted, watch } from "vue"
import { ElMessageBox } from "element-plus"
import userStore from '@/store/user'
import { getRebateSettingList, deleteRebateSettingData } from "@/api/agent.js"
import { dateFormat, div } from "@/common/util/index"
const BetRebateDeploy = defineAsyncComponent(() => import("./BetRebateDeploy.vue"))
const RatioDeploy = defineAsyncComponent(() => import("./RatioDeploy.vue"))
const PerformanceDeploy = defineAsyncComponent(() => import("./PerformanceDeploy.vue"))

const props = defineProps({
    type: {
        default: '1'
    },
    metaData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const typeData = ['rebateData', 'ratioData', 'performanceData']
const state = reactive({
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    fixedTotal: 0,
    fixedListQuery: {
        _page: 1,
        _size: 10,
    },
    performanceData: [],
    ratioData: [],
    rebateData: {},
    itemData: {},
    showPerformanceDialog: false,
    showRatioDialog: false,
    showRebateDialog: false,
})
const userData = userStore()

watch(
    () => props.type,
    (val) => {
        state.listQuery._page = 1
        fetchData(2)
    }
)

onMounted(() => {
    globalVBus.$emit('globalLoading', true)
    Promise.all([fetchData(0), fetchData(1), fetchData(2)]).then(() => {
        globalVBus.$emit('globalLoading', false)
    })
})

// 表格过滤数据处理
const fetchData = (type = '', val = '') => {
    let params = { type }
    if (type == 1) { params = { type, ...state.fixedListQuery } }
    if (type == 2) { params = { type, ...state.listQuery } }
    if (type > 1) { params.bizId = props.type }
    !!val && globalVBus.$emit('globalLoading', true)
    getRebateSettingList(params).then(({ data }) => {
        if (type) {
            state[typeData[type]] = data.list || []
            if (type === 1) { state.fixedTotal = data.total }
            if (type === 2) { state.total = data.total }
        } else {
            state.rebateData = data.list && data.list.length ? data.list[0] : {}
        }
        !!val && globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        !!val && globalVBus.$emit('globalLoading', false)
    })
}

// 编辑
const handleConfig = (row, key) => {
    state.itemData = { ...row }
    if (key === 'showRebateDialog') state.itemData.bizId = props.type
    state[key] = true
}

// 删除
const handleDelete = (id, type) => {
    ElMessageBox.confirm($t('删除后不可恢复，确认要删除吗？'), $t('删除'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteRebateSettingData({ id }).then(() => {
            // ElMessage.success($t('删除成功！'));
            fetchData(type, 1);
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss" scoped>
.rebate-page {
    .head {
        width: 550px;
        margin-top: 15px;
        margin-bottom: 5px;
        &-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .title {
                font-size: 20px;
                font-weight: bold;
            }
        }
        .tips {
            color: #999;
        }
    }
    .rebate-table {
        width: 550px;
        border: 1px solid #ddd;
        margin-bottom: 40px;

        &-row {
            height: 40px;
            display: flex;

            .small-box {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #606266;
                font-size: 14px;
            }
            .small-box + .small-box {
                border-left: 1px solid #ddd;
            }
        }
        .rebate-table-row + .rebate-table-row {
            border-top: 1px solid #ddd;
        }
    }
}
</style>
