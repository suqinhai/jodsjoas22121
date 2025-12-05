<template>
    <!-- 会员详情弹窗-会员消息 -->
    <div class="member-message">
        <div class="head" v-if="isAddPermiss">
            <el-button v-throttle type="primary" @click="handleGo">{{$t('新 增')}}</el-button>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="msgId" :label="$t('序号')" width="100" align="center" />
            <el-table-column prop="title" :label="$t('标题')" min-width="100" align="center" />
            <el-table-column align="center" :label="$t('内容')" min-width="300">
                <template #default="{ row }">
                    <div class="pointer" style="color:#409eff" @click="handleInfo( row )">
                        {{ row.content || '' }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('状态')" align="center" width="100">
                <template #default="{ row }">
                    <span v-if="row.status === 1">{{$t('已读')}}</span>
                    <span v-if="row.status === 0">{{$t('未读')}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="addTime" :label="$t('时间')" width="160" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData">
        </Pagination>
    </div>
</template>

<script setup>
import { reactive, onMounted, inject, defineEmits, computed } from 'vue'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
import { getMemberMessageList } from '@/api/member'
import { dateFormat } from '@/common/util'

const provideData = inject('provideData')
const emits = defineEmits(['showDialog'])
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const router = useRouter()
const userData = userStore()

const isAddPermiss = computed(() => {
    return userData.isHasMenuPermiss('admin.msg.list') && provideData.isSame
})

onMounted(() => {
    fetchData()
})

const fetchData = () => {
    let params = {
        ...state.listQuery,
        userId: provideData.memberId,
        merchantId: provideData.merchantId
    }
    provideData.showLoading()
    getMemberMessageList(params).then(res => {
        let { total, list } = res.data
        state.total = total || 0
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            return item
        })
        provideData.hideLoading()
    }).catch(() => {
        state.tableData = []

        provideData.hideLoading()
    })
}

const handleInfo = (row) => {
    emits('showDialog', {
        data: { ...row },
        key: 'messageInfoShow'
    })
}

// 新增
const handleGo = () => {
    provideData.close()
    router.push(`/operating-center/notification-push`)
}
</script>

<style lang="scss" scope>
.member-message {
    .head {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding-right: 20px;
        margin-bottom: 10px;
    }
}
</style>
