<template>
    <!-- 运营中心-消息推送-消息列表 -->
    <div class="tabs-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('发送时间:')">
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :shortcuts="shortcuts" />
            </el-form-item>
            <!-- <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId" />
            </el-form-item> -->
            <el-form-item :label="$t('消息类型:')">
                <el-select class="select-box" v-model="state.formData.type" :placeholder="$t('请选择消息类型')" clearable>
                    <el-option v-for="item in metaData.msgType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('消息状态:')">
                <el-select class="select-box" clearable v-model="state.formData.status" :placeholder="$t('请选择消息状态')">
                    <el-option v-for="item in metaData.msgStatus" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('消息标题:')">
                <el-input v-model="state.formData.title" :placeholder="$t('请输入消息标题')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'admin.msg.addOrEdit'">
                <el-button v-throttle type="primary" @click="handleConfig">{{$t('新 增')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <!-- <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="100" align="center" />
            <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="100" align="center" /> -->
            <el-table-column prop="id" :label="$t('消息序号')" min-width="80" align="center" />
            <el-table-column prop="title" :label="$t('标题')" min-width="100" align="center" show-overflow-tooltip />
            <el-table-column prop="type_" :label="$t('消息类型')" min-width="120" align="center" />
            <el-table-column prop="scope_" :label="$t('收件人')" min-width="120" align="center" />
            <el-table-column prop="sendTime" :label="$t('发送时间')" min-width="160" align="center" />
            <el-table-column prop="endTime" :label="$t('结束时间')" min-width="160" align="center" />
            <el-table-column :label="$t('状态')" min-width="100" align="center">
                <template #default="{ row }">
                    <div style="color: red" v-if="row.status === -1">{{row.status_}}</div>
                    <div style="color: rgb(0, 194, 151)" v-else-if="row.status === 1">
                        {{row.status_}}
                    </div>
                    <div style="color: rgb(2, 167, 240)" v-else-if="row.status === 0">
                        {{row.status_}}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="120">
                <template #default="{ row }">
                    <el-button v-throttle v-if="row.status == -1 || row.status == 0" type="primary" @click="handleConfig(row)" link>{{$t('修改')}}
                    </el-button>
                    <el-button v-throttle v-if="row.status == 1" type="primary" @click="handleConfig(row)" link>{{$t('详情')}}</el-button>
                    <el-button v-throttle v-if="row.status != 1 && userData.isHasPermiss('admin.msg.addOrEdit')" type="danger"
                        @click="handleStatus(row)" link>{{$t('删除')}}</el-button>
                    <el-button v-throttle v-if="row.status == 1 && userData.isHasPermiss('admin.msg.addOrEdit')" type="warning"
                        @click="handleStatus(row)" link>{{$t('撤回')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData">
        </Pagination>
        <NotificationDeploy :itemData="state.itemData" :metaData="metaData" v-if="state.notificationShow" @close="state.notificationShow = false"
            @update="fetchData">
        </NotificationDeploy>
    </div>
</template>

<script setup>
import { reactive, defineAsyncComponent, onMounted, onActivated } from "vue"
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
// import commonStore from '@/store/common'
import { getMessageList, deleteMessage, recallMessage } from "@/api/data_center"
import { getCommonMeta, getLevelConfig, getUserGradeData } from "@/api/common.js"
import { dateFormat, getShortcuts } from "@/common/util"
const NotificationDeploy = defineAsyncComponent(() => import("./components/NotificationDeploy.vue"))

const shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    notificationShow: false,
    itemData: {},
    type: '',
    // isInit: true,
})
let metaData = reactive({
    userLevel: [],
    msgType: [],
    userMsgScope: [],
    msgStatus: [],
    fixedLevel: [],
    autoLevel: [],
})
const route = useRoute()
const userData = userStore()
// const commonData = commonStore()

getCommonMeta({ types: "msgType,userMsgScope,msgStatus" }).then(({ code, data }) => {
    if (code == 0) {
        metaData = Object.assign(metaData, data || {})
    }
})

getLevelConfig({ type: 0 }).then(res => {
    metaData.autoLevel = res.data || []
})

getLevelConfig({ type: 1 }).then(res => {
    metaData.fixedLevel = res.data || []
})

getUserGradeData().then(({ data }) => {
    if (data) {
        for (let key in data) {
            metaData.userLevel.push({
                label: data[key],
                value: key,
            })
        }
    }
})

onMounted(() => {
    // if (commonData.isManual) state.isInit = false
    state.type = route.query.type
    state.formData.type = state.type
    fetchData()
})

onActivated(() => {
    // if (state.isInit) return state.isInit = false
    if (state.type !== route.query.type) {
        state.type = route.query.type
        state.formData = {
            type: state.type,
            // merchantId: commonData.merchantSiteList.length > 1 ? 0 : ''
        }
        fetchData('search')
    }
})

const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                type: state.type,
                // merchantId: commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    const { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params["interval.begin"] = receiveTime[0]
        params["interval.end"] = receiveTime[1]
    }
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getMessageList(params).then((res) => {
        const { list, total } = res.data
        state.tableData = list.map(item => {
            item.sendTime && (item.sendTime = dateFormat(item.sendTime))
            item.endTime && (item.endTime = dateFormat(item.endTime))
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            return item
        })
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleConfig = (val = {}) => {
    state.itemData = { ...val }
    state.notificationShow = true
}

const handleStatus = (item) => {
    let title = $t('删除后不可恢复，确认删除吗？')
    let api = deleteMessage
    let params = {
        id: item.id,
    }
    if (item.status === 1) {
        title = $t('确认要撤回吗？')
        api = recallMessage
        params = {
            id: item.id,
            status: -1,
        }
    }
    ElMessageBox.confirm(title, $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        showClose: true,
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        api(params).then((res) => {
            if (res.code === 0) {
                fetchData();
            }
            globalVBus.$emit('globalLoading', false)
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

</script>

<style lang="scss">
</style>
