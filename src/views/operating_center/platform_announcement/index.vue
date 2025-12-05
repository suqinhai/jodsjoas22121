<template>
    <!-- 平台公告 -->
    <div class="container platform-announcement">
        <div class="hander" v-permiss="'admin.merchant-msg.detail'">
            <el-button v-throttle type="primary" :disabled="!state.total" @click="handleRead">{{$t('全部已读')}}</el-button>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="msgId" :label="$t('序号')" min-width="100" align="center" />
            <el-table-column align="center" :label="$t('标题')" min-width="120">
                <template #default="{ row }">
                    <div class="pointer" style="color:#409eff" @click="handleInfo( row )">
                        {{ row.title || '' }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="sendTime" :label="$t('时间')" min-width="160" align="center" />
            <el-table-column prop="status_" :label="$t('状态')" align="center" min-width="100" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData">
        </Pagination>
        <MessageInfo :itemData="state.itemData" v-if="state.messageInfoShow" @close="state.messageInfoShow = false">
        </MessageInfo>
    </div>
</template>

<script setup name='platformAnnouncement'>
import { dateFormat } from '@/common/util'
import { reactive, defineAsyncComponent, onMounted } from 'vue'
import userStore from '@/store/user'
import { getMerchantMessageList, getMerchantMessageInfo, allMerchantMessageRead } from '@/api/merchant_center'
const MessageInfo = defineAsyncComponent(() => import('./components/MessageInfo.vue'))

const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    messageInfoShow: false,
    itemData: {},
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

const fetchData = (type = 0) => {
    !type && globalVBus.$emit('globalLoading', true)
    getMerchantMessageList(state.listQuery).then(res => {
        let { total, list } = res.data
        state.total = total || 0
        state.tableData = list.map(item => {
            item.sendTime && (item.sendTime = dateFormat(item.sendTime))
            return item
        })
        !type && globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []

        !type && globalVBus.$emit('globalLoading', false)
    })
}

const handleRead = () => {
    globalVBus.$emit('globalLoading', true)
    allMerchantMessageRead().then(res => {
        userData.getMerchantMessage()
        fetchData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleInfo = ({ id, msgId, status }) => {
    if (!userData.isHasPermiss('admin.merchant-msg.detail')) return
    globalVBus.$emit('globalLoading', true)
    getMerchantMessageInfo({ id, msgId }).then(res => {
        state.itemData = res.data
        globalVBus.$emit('globalLoading', false)
        state.messageInfoShow = true
        if (!status) {
            userData.getMerchantMessage()
            fetchData(1)
        }
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })

}
</script>

<style lang="scss">
.platform-announcement {
    .hander {
        width: 100%;
        padding-right: 40px;
        text-align: right;
        margin-bottom: 15px;
    }
}
</style>
