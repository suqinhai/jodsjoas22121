<template>
    <!-- 刷子监控-同关联监控-同关联人数 -->
    <Dialog ref="dialog" width="1150" :title="$t('同关联人数')" :isShowSubmit="false" top="6vh" @cancel="emits('close')">
        <el-dropdown v-if="isPermiss" @command="handleBatch" style="margin-bottom: 10px">
            <el-button v-throttle type="primary">{{$t('批量操作')}}<el-icon class="el-icon--right">
                    <arrow-down />
                </el-icon>
            </el-button>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item v-for="item in metaData.botSpyPunish" :key="item.value" :command="item.value">{{item.label}}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-table ref="tableRef" :data="state.tableData" border @selection-change="handleSelectionChange">
            <el-table-column v-if="isPermiss" fixed="left" type="selection" width="55" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user?.id || '' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user?.name || '' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('关联时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('关联类型')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ metaData.botSpyType.find(item => +item.value === row.type)?.label || '' }}
                </template>
            </el-table-column>
            <el-table-column prop="info" :label="$t('具体关联信息')" min-width="220" align="center" />
            <el-table-column prop="punishType_" :label="$t('操作类型')" min-width="140" align="center" />
            <!-- <template #default="{ row }">
                    {{ metaData.botSpyPunish.find(item => +item.value === row.punishType)?.label || '' }}
                </template>
            </el-table-column> -->
            <el-table-column fixed="right" :label="$t('操作')" min-width="110" align="center">
                <template #default="{ row }">
                    <el-dropdown @command="handleBatch" v-permiss="'admin.user-bot-spy.punishBatch'">
                        <el-button v-throttle type="primary" text>{{$t('操作')}}</el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="item in metaData.botSpyPunish" :key="item.value" :command="row.id + ',' + item.value">
                                    {{item.label}}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && isPermiss" :selectedNum="state.tableListSelection.length" @pagination="fetchData">
        </Pagination>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue"
import userStore from '@/store/user'
import { dateFormat } from "@/common/util/index"
import { gitCrimeSheetList, postCrimeSheetData } from "@/api/risk_control.js"

const emits = defineEmits(['close'])
const props = defineProps({
    itemId: {
        type: [Number, String],
        default: ''
    },
    loginIp: {
        type: Array,
        default: () => []
    },
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    tableListSelection: [],
})
const dialog = ref(null)
const tableRef = ref(null)
const userData = userStore()

const isPermiss = computed(() => {
    return userData.isHasPermiss('admin.user-bot-spy.punishBatch')
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    let params = { ...state.listQuery }
    params.spyId = props.itemId
    if (props.loginIp.length) {
        params.spyIds = props.loginIp.join(',')
        params.type = 0
    }
    isPermiss.value && tableRef.value && tableRef.value.clearSelection()
    dialog.value.showLoading()
    gitCrimeSheetList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list
        state.total = total
        dialog.value.closeLoading()
    }).catch(err => {
        state.tableData = []

        dialog.value.closeLoading()
    })
}

// 表格勾选切换
const handleSelectionChange = (val) => {
    state.tableListSelection = val
}

// 批量操作
const handleBatch = (punishType) => {
    let arr = punishType.split(',')
    let ids = ''
    if (arr.length > 1) {
        ids = arr[0]
        punishType = arr[1]
    } else {
        let { tableListSelection } = state
        if (!tableListSelection.length) {
            return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
        }
        ids = tableListSelection.reduce((pre, item, index) => {
            if (index) {
                return pre + ',' + (item.id + '')
            } else {
                return item.id
            }
        }, '')
    }
    let obj = {
        ids,
        punishType
    }
    dialog.value.showLoading()
    postCrimeSheetData(obj).then(res => {
        fetchData()
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss">
</style>
