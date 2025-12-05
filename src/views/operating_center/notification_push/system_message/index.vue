<template>
    <!-- 运营中心-消息推送-定制版系统推送 -->
    <div class="tabs-main system-message">
        <el-form class="filter-form" inline>
            <el-form-item :label="$t('清除推送:')">
                <el-radio-group v-model="state.type" @change="radioChange">
                    <el-radio :label="false">{{$t('不清除')}}</el-radio>
                    <el-radio :label="true">{{$t('一个月')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item style="float: right;" v-permiss="'admin.msg.addOrEdit'">
                <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="title" :label="$t('标题')" min-width="200" align="center" show-overflow-tooltip />
            <el-table-column :label="$t('内容')" min-width="80" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" @click="handleConfig(row,-1)" link>{{$t('查看')}}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('发件人')" min-width="80" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" min-width="100" v-if="userData.isHasPermiss('admin.msg.addOrEdit')">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" @click="handleConfig(row)" link>{{$t('修改')}}</el-button>
                    <el-button v-throttle type="danger" @click="handleDelete(row.id)" link>{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData">
        </Pagination>
        <DeployDialog :itemData="state.itemData" v-if="state.showDialog" @close="state.showDialog = false" @fetchData="fetchData">
        </DeployDialog>
    </div>
</template>

<script setup>
import { reactive, defineAsyncComponent, onMounted } from "vue"
import userStore from '@/store/user'
import { getMessageList, deleteMessage } from "@/api/data_center"
import { getMetaData, postMetaData } from '@/api/common'
const DeployDialog = defineAsyncComponent(() => import("./components/DeployDialog.vue"))

const state = reactive({
    type: false,
    configData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    showDialog: false,
    itemData: {},
})
const userData = userStore()

onMounted(() => {
    fetchData()
    getData()
})

const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getMessageList({ ...state.listQuery, type: 3 }).then((res) => {
        const { list, total } = res.data
        state.tableData = list || []
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const getData = () => {
    getMetaData({ type: 54 }).then((res) => {
        if (res.data) {
            let arr = Object.values(res.data)
            if (arr[0] && arr[0].id) {
                state.configData = arr[0]
                if (state.configData.value) {
                    state.type = JSON.parse(state.configData.value).reserve1Month
                }
            }
        }
    })
}

const radioChange = (val) => {
    ElMessageBox.confirm($t('确定要修改清除推送的周期吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postMetaData({
            ...state.configData,
            type: 54,
            status: 1,
            config: JSON.stringify({
                reserve1Month: val
            })
        }).then(() => {
            globalVBus.$emit('globalLoading', false)
        }).catch(() => {
            state.type = !val
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => {
        state.type = !val ? 1 : 0
    })
}

const handleConfig = (val = {}, type) => {
    state.itemData = { ...val }
    if (type === -1) state.itemData.id = -1
    state.showDialog = true
}

const handleDelete = (id) => {
    ElMessageBox.confirm($t('删除后不可恢复，确认删除吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteMessage({ id }).then((res) => {
            fetchData()
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

</script>

<style lang="scss">
.system-message {
    .filter-form {
        .el-form-item {
            margin-bottom: 10px;
        }
    }
}
</style>
