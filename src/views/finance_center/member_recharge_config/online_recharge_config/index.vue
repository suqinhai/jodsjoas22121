<template>
    <!-- 财务中心-会员充值配置-在线充值配置 -->
    <div class="container-main recharge-config">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('支付方式:')">
                <el-select clearable class="select-box" v-model="state.formData.payMent" :placeholder="$t('请选择支付方式')">
                    <el-option v-for="item in state.payMentList" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="search">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <div class="sort-box">
                <span>
                    {{$t('支付通道自动排序')}}
                    <el-dropdown placement="bottom" trigger="click" popper-class="tips-dropdown">
                        <span class="pointer">
                            <el-icon :size="16">
                                <QuestionFilled />
                            </el-icon>:
                        </span>
                        <template #dropdown>
                            <div class="recharge-dropdown-main">
                                <div> {{$t('若开启:')}}</div>
                                <div> {{$t('1.如果没有200次支付，则走人工设置的排序；')}}</div>
                                <div> {{$t('2.如果超过200次支付，则支付成功率高的优先。')}}</div>
                            </div>
                        </template>
                    </el-dropdown>
                </span>
                <div class="pr pointer">
                    <el-switch v-model="state.autoSortOpen" :active-value="1" :inactive-value="0" />
                    <div class="small-mask pa" @click="handleSwitch"></div>
                </div>
            </div>
            <el-form-item class="head-right">
                <el-button v-throttle type="primary" @click="state.sortDialogShow = true">{{$t('前台充值类型排序')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="sort" :label="$t('排序')" min-width="120" align="center" />
            <el-table-column prop="channelType_" :label="$t('类型')" min-width="120" align="center" />
            <el-table-column prop="type_" :label="$t('支付方式')" min-width="145" align="center" />
            <el-table-column prop="channel_" :label="$t('通道名称')" min-width="130" align="center" />
            <el-table-column prop="channelCode" :label="$t('通道编码')" min-width="130" align="center" />
            <el-table-column prop="name" :label="$t('前台通道名称')" min-width="160" align="center" />
            <el-table-column prop="productsStr" :label="$t('通道推荐金额')" min-width="180" align="center" />
            <el-table-column prop="minAmount" :label="$t('最小限额')" min-width="140" align="center" />
            <el-table-column prop="maxAmount" :label="$t('最大限额')" min-width="140" align="center" />
            <el-table-column :label="$t('会员层级')" min-width="200" align="center">
                <template #default="{ row }">
                    {{row.fixLayers ? getLevelName(row.fixLayers) : $t('全部层级')}}
                </template>
            </el-table-column>
            <el-table-column prop="desc" :label="$t('备注')" min-width="140" align="center" />
            <el-table-column prop="tips" :label="$t('前台提示')" min-width="170" align="center" />
            <el-table-column prop="status" :label="$t('是否启用')" min-width="140" align="center">
                <template #default="{ row }">
                    <div class="statusBox" :class="(row.status === 0 || !row.products)?'error':'success'">
                        {{ row.status === 0 || !row.products ? $t('已关闭') : $t('已开启') }} </div>
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="100">
                <template #default="{ row }">
                    <el-button v-permiss="'admin.user-recharge-config.detail'" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <DeployDialog v-if="state.deployDialogShow" :memberLevel="state.memberLevel" :itemData="state.itemData" @fetchData="fetchData"
            @close="state.deployDialogShow = false">
        </DeployDialog>
        <SortDialog v-if="state.sortDialogShow" @close="state.sortDialogShow = false"></SortDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import { getRecommendedAmountList, getRecommendedAmountConfig, getPayChannelSortConfig, postPayChannelSortConfig } from '@/api/finance'
import { getLevelConfig } from '@/api/common'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))
const SortDialog = defineAsyncComponent(() => import('./components/SortDialog.vue'))

const state = reactive({
    tableData: [],
    newTableData: [],
    deployDialogShow: false,
    sortDialogShow: false,
    itemData: {},
    autoSortOpen: 0,
    memberLevel: [],
    payMentList: [],
    formData: {}
})
const userData = userStore()

// const isSortPermiss = computed(() => {
//     return userData.isHasPermiss('admin.user-recharge-config.sortEdit')
// })

getLevelConfig().then(res => {
    state.memberLevel = res.data || []
})

onMounted(() => {
    fetchData()
    getPayChannelSortInfo()
})

const search = () => {
    if (state.formData.payMent) {
        let data = []
        state.newTableData.forEach((item, index) => {
            if (state.formData.payMent === item.type) {
                data.push(item)
            }
        })
        state.tableData = data
    } else {
        fetchData()
    }
}

const fetchData = (value) => {
    globalVBus.$emit('globalLoading', true)
    getRecommendedAmountList({ tab: 1 }).then(res => {
        state.tableData = res.data
        state.newTableData = res.data
        state.tableData.forEach(item => {
            state.payMentList.push(item.type)
            if (item.products) {
                let arr = item.products.map(item => item.rechargeAmount)
                item.productsStr = arr.join('，')
            }
        })
        state.payMentList = [...new Set(state.payMentList)]
        if (state.formData.payMent) search()
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 获取支付渠道排序配置
const getPayChannelSortInfo = (type) => {
    getPayChannelSortConfig().then(res => {
        state.autoSortOpen = res.data ? +res.data : 0
    }).catch(err => { })
}

// 层级层级ID映射name
const getLevelName = (val) => {
    let arr = []
    let obj = ''
    val.split(',').forEach(item => {
        obj = state.memberLevel.find(its => its.id === +item)
        if (obj) arr.push(obj.name)
    })
    return arr.join('，')
}

const handleSwitch = () => {
    ElMessageBox.confirm(`<div>${$t('确定要')}${!state.autoSortOpen ? $t('开启') : $t('关闭')}${$t('支付通道自动排序吗？')}</div>
    <div style='color: #F94D64'><div>${$t('若开启:')}</div><div>${$t('1.如果没有200次支付，则走人工设置的排序；')}</div><div>${$t('2.如果超过200次支付，则支付成功率高的优先。')}</div></div>`, $t('提示'), {
        dangerouslyUseHTMLString: true,
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postPayChannelSortConfig({ sort: !state.autoSortOpen ? 1 : 0 }).then(() => {
            state.autoSortOpen = !state.autoSortOpen ? 1 : 0
            fetchData()
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

// 修改
const handleConfig = ({ channel, alias = '', type = '' }) => {
    globalVBus.$emit('globalLoading', true)
    getRecommendedAmountConfig({ channel, alias, type }).then(res => {
        globalVBus.$emit('globalLoading', false)
        state.itemData = res.data
        state.deployDialogShow = true
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.recharge-config {
    min-width: 1040px;

    .head-right {
        float: right;
    }
    .sort-box {
        height: 32px;
        display: inline-flex;
        align-items: center;
        vertical-align: top;
        > span {
            font-weight: 700;
            color: #606266;
            padding-right: 12px;
        }
    }
    .small-mask {
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
    .el-table {
        .cell {
            .success {
                color: green;
            }
            .error {
                color: #f94d64;
            }
        }
    }
}
.recharge-dropdown-main {
    border-radius: 2px;
    background-color: #444;
    padding: 10px;
    color: #fff;
}
</style>
