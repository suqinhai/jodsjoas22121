<template>
    <!-- 运营中心-票券中心 -->
    <div class="container ticket-center">
        <div class="style-box" v-if="userData.getTemplateType() === 4">
            <span class="form-label ">{{$t('前端样式选择:')}}</span>
            <el-radio-group v-model="state.styleType" @change="radioChange">
                <el-radio :label="1" :value="1">{{$t('详情样式')}}</el-radio>
                <el-radio :label="2" :value="2">{{$t('列表样式')}}</el-radio>
            </el-radio-group>
        </div>
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-select v-model="state.formData.status" :placeholder="$t('请选择状态')" filterable>
                    <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="state.formData.type" :placeholder="$t('请选择票券类型')" filterable>
                    <el-option v-for="item in state.metaData.ticketType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.showDiscountsDialog = true">{{$t('票券配置说明')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="handleConfig({},'showAddConfigDialog')">{{$t('新增配置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="handleRemind">{{$t('提醒设置')}}</el-button>
            </el-form-item>
            <el-form-item v-if="userData.getTemplateType() === 4">
                <el-button v-throttle type="primary" @click="handleCarouselSet">{{$t('领奖轮播设置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-checkbox v-model="state.ticketCarousel" :true-label="1" :false-label="0"  @change="handleTicketCarousel">
                    {{$t('前端票券中奖轮播显示')}}
                </el-checkbox>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="id" label="ID" min-width="80" align="center" />
            <el-table-column prop="type_" :label="$t('票券类型')" min-width="100" align="center" />
            <el-table-column prop="name" :label="$t('票券名称')" min-width="120" align="center" />
            <el-table-column prop="expireTime_" :label="$t('领奖后有效期')" min-width="140" align="center" />
            <el-table-column prop="receiveNum" :label="$t('已派发数量')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="handleConfig(row,'showIssuedDialog')">{{row.receiveNum}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="useNum" :label="$t('已使用数量')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="handleConfig(row,'showUsedDialog')">{{row.useNum}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="addTime" :label="$t('创建时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.addTime && dateFormat(row.addTime)}}
                </template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('状态')" min-width="100" align="center">
                <template #default="{ row }">
                    {{statusList[row.status]?.label || ''}}
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('操作')" width="180" align="center">
                <template #default="{ row }">
                    <div class="table_operateBtn">
                        <el-button v-throttle type="primary" v-if="row.status === 1" text @click="handleStatus(row,0)">{{$t('停发')}}</el-button>
                        <el-button v-throttle type="primary" v-if="row.status === 0" text @click="handleStatus(row,1)">{{$t('恢复正常')}}</el-button>
                        <el-button v-throttle type="primary" text @click="handleConfig(row,'showAddConfigDialog')">{{$t('修改')}}</el-button>
                        <el-button v-throttle type="primary" v-if="row.status === 0" text @click="handleDelete(row,-1)">{{$t('删除')}}</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
        <AddConfigDialog :itemData="state.itemData" :metaData="state.metaData" v-if="state.showAddConfigDialog"
            @close="state.showAddConfigDialog = false" @refreshData="fetchData('reset')"></AddConfigDialog>
        <ExplainDialog v-if="state.showDiscountsDialog" @close="state.showDiscountsDialog = false"></ExplainDialog>
        <IssuedDialog :itemData="state.itemData" v-if="state.showIssuedDialog" @close="state.showIssuedDialog = false"></IssuedDialog>
        <UsedDialog :itemData="state.itemData" v-if="state.showUsedDialog" @close="state.showUsedDialog = false"></UsedDialog>
        <TicketRemindConfig :itemData="state.itemData" v-if="state.showRemindDialog" @close="state.showRemindDialog = false"></TicketRemindConfig>
        <TicketCarouselConfig :itemData="state.itemData" v-if="state.showCarouselDialog" @close="state.showCarouselDialog = false">
        </TicketCarouselConfig>
    </div>
</template>

<script setup name="ticketCenter">
import { reactive, onMounted, defineAsyncComponent, onActivated } from "vue"
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getTicketList, postTicketToggle } from '@/api/operation'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import { getCommonMeta, getMetaData } from '@/api/common'
import { dateFormat } from '@/common/util'
const AddConfigDialog = defineAsyncComponent(() => import('./components/AddConfigDialog.vue'))
const IssuedDialog = defineAsyncComponent(() => import('./components/IssuedDialog.vue'))
const UsedDialog = defineAsyncComponent(() => import('./components/UsedDialog.vue'))
const ExplainDialog = defineAsyncComponent(() => import('./components/ExplainDialog.vue'))
const TicketRemindConfig = defineAsyncComponent(() => import('./components/TicketRemindConfig.vue'))
const TicketCarouselConfig = defineAsyncComponent(() => import('./components/TicketCarouselConfig.vue'))

const statusList = [
    { value: 0, label: $t('停发') },
    { value: 1, label: $t('正常') }
]
const state = reactive({
    styleType: 0,
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    metaData: {},
    itemData: {},
    showAddConfigDialog: false,
    showDiscountsDialog: false,
    showIssuedDialog: false,
    showUsedDialog: false,
    showRemindDialog: false,
    showCarouselDialog: false,
    isInit: true,
    ticketCarousel: 0,
})
const userData = userStore()
const commonData = commonStore()
const route = useRoute()
const getTicketCarousel = () => {
    getHomeDeploy({ part: 'scatter', type: 6, alias: 'ticketCarousel', status: state.ticketCarousel }).then(res => {
        let { data = {} } = res
        state.ticketCarousel = data.ticketCarousel ?? 1
    })
}
const handleTicketCarousel = (val) => {
    postHomeDeploy({ part: 'scatter', type: 6, alias: 'ticketCarousel', status: state.ticketCarousel }).then(res => {})
}
onMounted(() => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    getTicketCarousel()
    getCommonMeta({ types: 'ticketType,ticketExpireType,ticketReceiveScope,ticketMinRule,gameType' }).then(res => {
        res.data.ticketType.forEach((item) => {
            item.value = Number(item.value)
        })
        res.data.ticketExpireType.forEach((item) => {
            item.value = Number(item.value)
        })
        res.data.ticketReceiveScope.forEach((item) => {
            item.value = Number(item.value)
        })
        res.data.ticketMinRule.forEach((item) => {
            item.value = Number(item.value)
        })
        res.data.gameType.forEach((item) => {
            item.value = Number(item.value)
        })
        state.metaData.ticketType = res.data.ticketType
        state.metaData.ticketExpireType = res.data.ticketExpireType
        state.metaData.ticketReceiveScope = res.data.ticketReceiveScope
        state.metaData.ticketMinRule = res.data.ticketMinRule
        res.data.gameType.unshift({ value: 'all', label: $t('全部') })
        state.metaData.gameType = res.data.gameType
    })
    fetchData()
    if (userData.getTemplateType() === 4) {
        // 获取票券前端样式
        getHomeDeploy({ part: 'ticketStyle' }).then(res => {
            state.styleType = res.data.ticketStyle || 1
        })
    }
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getTicketList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.total = total
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

const handleConfig = (row, key) => {
    state.itemData = { ...row }
    state[key] = true
}

const handleRemind = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 47 }).then((res) => {
        state.itemData = {}
        if (res.data) {
            let arr = Object.values(res.data)
            if (arr[0] && arr[0].id) {
                state.itemData = arr[0]
            }
        }
        state.showRemindDialog = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleStatus = (row, status) => {
    ElMessageBox.confirm(status === 0 ? $t('操作停发后，之后会员完成任务也不会再派发了，是否确定？') : $t('是否确认恢复正常'), $t('提示'), {
        confirmButtonText: $t('确定'),
        cancelButtonText: $t('取消'),
        callback: (action) => {
            if (action === 'confirm') {
                const data = { id: row.id, status: status }
                postTicketToggle(data).then(() => {
                    fetchData()
                })
            }
        },
    })
}

const handleDelete = (row, status) => {
    ElMessageBox.confirm($t('确定要移除该票券吗？移除后不可恢复。'), $t('删除'), {
        confirmButtonText: $t('确定'),
        cancelButtonText: $t('取消'),
        callback: (action) => {
            if (action === 'confirm') {
                const data = { id: row.id, status: status }
                postTicketToggle(data).then(() => {
                    fetchData()
                })
            }
        },
    })
}

const handleCarouselSet = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 51 }).then((res) => {
        state.itemData = {}
        if (res.data) {
            let arr = Object.values(res.data)
            if (arr[0] && arr[0].id) {
                state.itemData = arr[0]
            }
        }
        state.showCarouselDialog = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const radioChange = (val) => {
    ElMessageBox.confirm($t('确定要修改票券前端样式吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postHomeDeploy({
            part: 'ticketStyle',
            alias: 'ticketStyle',
            status: 1,
            ticketStyle: state.styleType
        }).then(() => {
            globalVBus.$emit('globalLoading', false)
        }).catch(() => {
            state.styleType = val === 1 ? 2 : 1
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => {
        state.styleType = val === 1 ? 2 : 1
    })
}
</script>

<style lang="scss" scoped>
.ticket-center {
    .style-box {
        margin-bottom: 10px;
    }
}
</style>
