<template>
    <!-- 用户管理-层级设置-层级人数（固定、自动） -->
    <div>
        <Dialog ref="dialog" width="1200" :title="(itemData.type ? $t('固定') : $t('自动'))+$t('层级人数')" :isShowSubmit="false" top="6vh" @cancel="cancel">
            <el-form class="filter-form" inline :model="state.formData">
                <el-form-item :label="$t('会员ID:')">
                    <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                        :placeholder="$t('请输入会员ID')" />
                </el-form-item>
                <el-form-item :label="$t('会员账号:')">
                    <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
                </el-form-item>
                <el-form-item :label="$t('层级:')">
                    <el-select v-model="state.formData.layerId" :placeholder="$t('请选择层级')" clearable>
                        <el-option v-for="item in itemData.dataList" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button v-throttle type="primary" @click="getData('search')">{{$t('搜 索')}}</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button v-throttle @click="getData('reset')">{{$t('重 置')}}</el-button>
                </el-form-item>
                <el-form-item v-if="isPermiss && itemData.type">
                    <el-dropdown @command="handleBatch">
                        <el-button v-throttle type="primary">{{$t('批量操作')}}<el-icon class="el-icon--right">
                                <arrow-down />
                            </el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item :command="0">{{$t('批量移除')}}</el-dropdown-item>
                                <el-dropdown-item :command="1">{{$t('批量修改')}}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-form-item>
            </el-form>
            <el-table ref="tableRef" :data="state.tableData" border @selection-change="(val) => state.tableListSelection = val ">
                <el-table-column v-if="isPermiss && itemData.type" fixed="left" type="selection" width="55" />
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
                <el-table-column :label="$t('状态')" min-width="120" align="center">
                    <template #default="{ row }">
                        <template v-if="row.status_">
                            <div v-for="(item,index) in  row.status_.split('\n')" :key="index">{{item}}</div>
                        </template>
                    </template>
                </el-table-column>
                <el-table-column prop="layerName" :label="$t('层级名称')" min-width="140" align="center" />
                <template v-if="itemData.type">
                    <el-table-column :label="$t('操作时间')" min-width="160" align="center">
                        <template #default="{ row }">
                            {{ dateFormat(row.updateTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" :label="$t('操作')" min-width="120" align="center" v-if="isPermiss">
                        <template #default="{ row }">
                            <el-button v-throttle type="primary" text @click="handleOperate(row)">{{$t('修改')}}</el-button>
                            <el-button v-throttle type="danger" text @click="handleMove(row.userId)">{{$t('移除')}}</el-button>
                        </template>
                    </el-table-column>
                </template>
                <template v-if="!itemData.type">
                    <el-table-column prop="diff" :label="$t('盈利额度')" min-width="120" align="center" />
                    <el-table-column prop="rechargeSum" :label="$t('累计充值金额')" min-width="120" align="center" />
                    <el-table-column :label="$t('充值次数')" min-width="100" align="center">
                        <template #default="{ row }">
                            {{row.rechargeNum || 0}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="cashSum" :label="$t('累计提现金额')" min-width="120" align="center" />
                    <el-table-column prop="cashNum" :label="$t('提现次数')" min-width="100" align="center">
                        <template #default="{ row }">
                            {{row.cashNum || 0}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('是否锁定')" fixed="right" min-width="100" align="center">
                        <template #default="{ row }">
                            <el-switch :disabled="!isPermiss" v-model="row.lockFlag" @change="switchChange(row)" />
                        </template>
                    </el-table-column>
                </template>
            </el-table>
            <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
                :isShowChecked="isPermiss && !!itemData.type && !!state.tableListSelection.length" :selectedNum="state.tableListSelection.length"
                @pagination="getData">
            </Pagination>
        </Dialog>
        <MemberDetail v-if="state.memberDetailShow" :merchantId="merchantId" @close="state.memberDetailShow = false" @resetData="getData">
        </MemberDetail>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineExpose } from "vue"
import { ElMessageBox, ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { dateFormat } from "@/common/util/index"
import { getLevelUserList, postMemberLevelData } from "@/api/risk_control.js"
import commonStore from '@/store/common'

const emits = defineEmits(['fetchData', 'close', 'showDialog'])
const props = defineProps({
    itemData: {
        Object,
        default: () => {
            return {
                dataList: []
            }
        }
    },
    merchantId: {
        default: ''
    }
})
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    tableListSelection: [],
    memberDetailShow: false
})
const dialog = ref(null)
const tableRef = ref(null)
const userData = userStore()
const commonData = commonStore()

const isPermiss = computed(() => {
    return userData.isHasPermiss('merchant.merchant-layer-config.editLayer')
})

onMounted(() => {
    state.formData.layerId = props.itemData.id
    getData()
})

// 表格过滤数据处理
const getData = (val) => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                layerId: props.itemData.id
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData, merchantId: props.merchantId }
    params.type = props.itemData.type
    props.itemData.type && isPermiss.value && tableRef.value && tableRef.value.clearSelection()
    dialog.value.showLoading()
    getLevelUserList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list
        state.total = total
        dialog.value.closeLoading()
    }).catch(err => {
        state.tableData = []
        dialog.value.closeLoading()
    })
}

const switchChange = (row) => {
    ElMessageBox.confirm(`${$t('确定要')}${row.lockFlag ? $t('锁定当前用户的自动层级') : $t('解除当前用户自动层级的锁定')}？`, $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        dialog.value.showLoading()
        postMemberLevelData({ userIds: row.userId, lock: row.lockFlag, merchantId: props.merchantId }).then(res => {
            getData()
        }).catch(err => {
            dialog.value.closeLoading()
        })
    }).catch(() => {
        row.lockFlag = !row.lockFlag
    })
}

// 批量操作
const handleBatch = (val) => {
    let { tableListSelection } = state
    if (!tableListSelection.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }
    let ids = tableListSelection.map(item => item.userId).join(',')
    if (val) {
        return handleOperate({ ids }, 'levelSetShow')
    }
    handleMove(ids)
}

// 查看会员详情
const showMemberDetail = (userId) => {
    commonData.memberId = userId
    state.merchantId = props.merchantId
    state.memberDetailShow = true
}

// 修改
const handleOperate = (row) => {
    emits('showDialog', { ...row })
}

// 移除
const handleMove = (id) => {
    ElMessageBox.confirm($t('确定将用户移出当前固定层级吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        postMove(id)
    }).catch(() => { })
}

const postMove = (userIds) => {
    dialog.value.showLoading()
    postMemberLevelData({ userIds, merchantId: props.merchantId }).then(res => {
        getData()
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
    emits('fetchData')
}

defineExpose({
    getData
})
</script>

<style lang="scss">
</style>
