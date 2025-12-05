<template>
    <!-- 返佣设置-亏损模式 -->
    <div class="rebate-setting-loss">
        <div class="head" style="width: 900px;margin-top: 0">
            <div class="title">{{$t('返佣比例')}}</div>
            <div class="tips">{{$t('（有效人数的净盈利都满足，才能获得对应返佣）')}}</div>
            <el-button v-permiss="'merchant.agent.awardCfgEdit'" v-throttle type="primary" @click="handleConfig({},'showRebateDialog')">{{$t('新 增')}}</el-button>
        </div>
        <el-table :data="state.tableData" border style="width: 900px">
            <el-table-column prop="sort" :label="$t('序号')" min-width="80" align="center" />
            <el-table-column prop="inCoin" :label="$t('有效人数≥')" min-width="180" align="center" />
            <el-table-column prop="awardAmount" :label="$t('净盈利≥')" min-width="120" align="center" />
            <el-table-column prop="rate" :label="$t('返佣比例%')" min-width="120" align="center" />
            <el-table-column :label="$t('操作')" min-width="140" align="center" v-if="userData.isHasPermiss('merchant.agent.awardCfgEdit')">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="handleConfig(row,'showRebateDialog')">{{$t('修改')}}</el-button>
                    <el-button v-throttle type="danger" text @click="handleDelete(row.id)">{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="head">
            <div class="title">{{$t('有效人数')}}</div>
            <div class="tips">{{$t('（设定后只有达到条件的下级产生的数据才会统计业绩）')}}</div>
        </div>
        <div class="person">
            <div class="small">{{$t('结算周期内累计存款')}}≥</div>
            <div class="small">{{state.rebateData.rechargeAmount || 0}}</div>
            <div class="small" style="width: 120px">
                <el-button v-throttle type="primary" text @click="handleConfig(row,'showPerformanceDialog')">{{$t('修改')}}</el-button>
            </div>
        </div>

        <div class="head">
            <div class="title">{{$t('返佣计算')}}</div>
        </div>
        <div class="calculate-deploy">
            <div class="col" v-for="(item,index) in calculateList" :key="index">
                <div class="small-box">{{item.title}}</div>
                <div class="small-box">{{item.value }}{{index > 1 ? state.calculateData[item.key]+ '%' : ''}}</div>
            </div>
        </div>

        <LossRebateDeploy v-if="state.showRebateDialog" :itemData="state.itemData" @close="state.showRebateDialog = false"
            @fetchData="fetchData(3,1)">
        </LossRebateDeploy>
        <PerformanceDeploy v-if="state.showPerformanceDialog" :itemData="state.rebateData" @close="state.showPerformanceDialog = false"
            @fetchData="fetchData(0,1)">
        </PerformanceDeploy>
    </div>
</template>

<script setup name="rebateSettingLoss">
import { defineAsyncComponent, reactive, onMounted } from "vue"
import userStore from '@/store/user'
import { getRebateSettingList, deleteRebateSettingData } from "@/api/agent.js"
const LossRebateDeploy = defineAsyncComponent(() => import("./LossRebateDeploy.vue"))
const PerformanceDeploy = defineAsyncComponent(() => import("./PerformanceDeploy.vue"))

const calculateList = [
    { title: $t('代理关系'), value: $t('佣金计算'), key: '' },
    { title: $t('直属下级'), value: $t('取阶梯返佣比例'), key: '' },
    { title: $t('二级'), value: $t('直属佣金的'), key: 'nextRate' },
    { title: $t('三级'), value: $t('直属佣金的'), key: 'otherRate' },
    // { title: $t('三级'), value: $t('奖励三级佣金的1%') },
]
const state = reactive({
    tableData: [],
    rebateData: {},
    calculateData: {},
    itemData: {},
    showRebateDialog: false,
    showPerformanceDialog: false,
})
const userData = userStore()

onMounted(() => {
    globalVBus.$emit('globalLoading', true)
    Promise.all([fetchData(0), fetchData(3)]).then(() => {
        globalVBus.$emit('globalLoading', false)
    })
})

// 表格过滤数据处理
const fetchData = (type, val = '') => {
    !!val && globalVBus.$emit('globalLoading', true)
    getRebateSettingList({ type }).then(({ data, ext }) => {
        if (type === 3) {
            state.tableData = data.list || []
        } else {
            state.rebateData = data.list && data.list.length ? data.list[0] : {}
            state.calculateData = ext || {}
        }
        !!val && globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        !!val && globalVBus.$emit('globalLoading', false)
    })
}

// 编辑
const handleConfig = (row, key) => {
    state.itemData = { ...row }
    state[key] = true
}

// 删除
const handleDelete = (id) => {
    ElMessageBox.confirm($t('删除后不可恢复，确认要删除吗？'), $t('删除'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteRebateSettingData({ id }).then(() => {
            fetchData(3, 1);
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss" scoped>
.rebate-setting-loss {
    .head {
        display: flex;
        align-items: center;
        height: 40px;
        width: 550px;
        margin-top: 15px;
        margin-bottom: 5px;
        .title {
            font-size: 20px;
            font-weight: bold;
        }
        .tips {
            flex: 1;
            color: #999;
        }
    }

    .person {
        width: 600px;
        display: flex;
        color: #606266;
        font-size: 14px;
        border: 1px solid #ddd;

        .small {
            flex: 1;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .small + .small {
            border-left: 1px solid #ddd;
        }
    }

    .calculate-deploy {
        width: 600px;
        display: flex;
        color: #606266;
        font-size: 14px;
        border: 1px solid #ddd;
        .col {
            flex: 1;
            display: flex;
            flex-direction: column;
            .small-box {
                height: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .small-box + .small-box {
                border-top: 1px solid #ddd;
            }
        }
        .col + .col {
            border-left: 1px solid #ddd;
        }
    }
}
</style>
