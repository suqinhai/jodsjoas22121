<template>
    <!-- 会员调控-数据列表（专业模式） -->
    <div class="tabs-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('控制状态:')">
                <el-select class="select-box" v-model="state.formData.controlStatus" clearable :placeholder="$t('请选择控制状态')">
                    <el-option v-for="item in metaData.controlStatus" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select style="width: 100px" v-model="state.formData.layerType" :placeholder="$t('层级类型')" clearable
                    @change="state.formData.autoLevel = '',state.formData.fixedLevel = ''">
                    <el-option :label="$t('自动层级')" :value="1" />
                    <el-option :label="$t('固定层级')" :value="2" />
                </el-select>
                <el-select v-if="state.formData.layerType === 1" :disabled="!state.formData.layerType" class="select-box"
                    v-model="state.formData.autoLevel" clearable :placeholder="$t('请选择自动层级')">
                    <el-option v-for="item in metaData.autoLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
                <el-select v-else :disabled="!state.formData.layerType" class="select-box" v-model="state.formData.fixedLevel" clearable
                    :placeholder="$t('请选择固定层级')">
                    <el-option v-for="item in metaData.fixedLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'admin.user-game-control.addOrEdit'">
                <el-button v-throttle type="primary" @click="handleConfig({},'memberControlShow')">{{$t('新增会员控制')}}</el-button>
            </el-form-item>
            <!-- <el-form-item v-permiss="'admin.user-game-control.addByLayer'">
                <el-button v-throttle type="primary" @click="handleConfig({},'levelControlShow')">{{$t('新增层级控制')}}</el-button>
            </el-form-item> -->
            <el-form-item v-permiss="'admin.user-game-control.addOrEdit'">
                <el-button v-throttle type="primary" @click="handleConfig({},'controlDeployShow')">{{$t('一键同步推广账号返奖率')}}</el-button>
            </el-form-item>
            <!-- <el-form-item v-permiss="'admin.user-game-control.addByLayer'">
                <el-button v-throttle type="primary" @click="handleConfig({},'profitControlShow')">{{$t('新增VIP盈利控制')}}</el-button>
            </el-form-item> -->
            <!-- <el-form-item v-permiss="'admin.user-game-control.addByLayer'">
                <el-button v-throttle type="primary" @click="state.profitPoolShow=true,state.controlType = 0">{{$t('自动层级池子配置')}}</el-button>
            </el-form-item> -->
            <el-form-item v-permiss="'admin.user-game-control.addByLayer'">
                <el-button v-throttle type="primary" @click="state.profitPoolShow=true,state.controlType = 1">{{$t('VIP人数比例配置')}}</el-button>
            </el-form-item>
            <el-form-item v-if="userData.siteInfo.commissionMode === 2">
                <el-button v-throttle type="primary" @click="emits('getBalanceLimit')">{{$t('VIP余额限制说明')}}</el-button>
            </el-form-item>
            <!-- <el-form-item v-permiss="'admin.user-game-control.addByLayer'">
                <el-button v-throttle type="primary" @click="handlePromotionAccount">{{$t('推广账号配置')}}</el-button>
            </el-form-item> -->
            <!-- <el-form-item v-permiss="'admin.user-game-control.addByLayer'">
                <el-button v-throttle type="primary" @click="handleSameIpLimit">{{$t('同IP比例配置')}}</el-button>
            </el-form-item> -->
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item>
            <el-form-item v-if="isPermiss">
                <el-dropdown @command="handleBatch">
                    <el-button v-throttle type="primary">{{$t('批量操作')}}<el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="(item,index) in showBatchType" :key="index" :command="item.value">
                                {{item.title}}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-form-item>
        </el-form>
        <el-table ref="tableRef" class="table-box" :data="state.tableData" border @selection-change="handleSelectionChange">
            <el-table-column v-if="isPermiss" fixed="left" type="selection" width="55" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="emits('showMemberDetail',row.id)">{{row.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="emits('showMemberDetail',row.id)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="layerName" :label="$t('会员层级')" min-width="100" align="center" />
            <el-table-column prop="userType" :label="$t('会员类型')" min-width="100" align="center" />
            <el-table-column prop="balance" :label="$t('账户余额')" min-width="100" align="center" />
            <el-table-column prop="profitTotal" :label="$t('总盈利累计')" min-width="100" align="center" />
            <el-table-column prop="rechargeTotal" :label="$t('充值总额')" min-width="100" align="center" />
            <el-table-column prop="controlStatus_" :label="$t('控制状态')" min-width="100" align="center" />
            <el-table-column :label="$t('控制次数')" min-width="100" align="center">
                <template #header>
                    <div>{{$t('控制次数')}}</div>
                    <div>{{$t('(当前/总数)')}}</div>
                </template>
                <template #default="{ row }">
                    {{row.controlCount || 0}}/{{row.controlTotalCount || 0}}
                </template>
            </el-table-column>
            <el-table-column prop="controlType_" :label="$t('控制类型')" min-width="120" align="center" />
            <el-table-column v-if="userData.siteInfo.commissionMode === 2" :label="$t('余额限制')" min-width="120" align="center">
                <template #default="{ row }">
                    {{!metaData.ctrlLoseType.some(item => row.controlType === +item.value) ? row.balanceLimit : ''}}
                </template>
            </el-table-column>
            <el-table-column prop="controlTotalAmount" :label="$t('控制额度')" min-width="100" align="center" />
            <el-table-column prop="controlAmount" :label="$t('已触发额度')" min-width="120" align="center" />
            <el-table-column prop="availableControlAmount" :label="$t('可触发额度')" min-width="120" align="center" />
            <el-table-column :label="$t('游戏记录')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="router.push(`/game-center/bet-log?tab=2&userId=${row.id}`)">{{$t('查看')}}</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="160">
                <template #default="{ row }">
                    <el-button v-permiss="'admin.user-game-control.addOrEdit'" v-if="!row.asTeam" v-throttle type="primary" text
                        @click="handleConfig(row,'memberControlShow')">{{$t('修改')}}</el-button>
                    <el-button v-permiss="'admin.user-game-control.over'" v-throttle type="primary" text @click="handleOverControl(row.id)">{{$t('结束控制')}}</el-button>
                    <!-- <el-button v-throttle type="primary"
                        v-if="row.online && userData.isHasPermiss('admin.user-game-control.quit')" text
                        @click="handleOffline(row.id)">{{$t('踢线并结束控制')}}</el-button> -->
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && isPermiss" :selectedNum="state.tableListSelection.length" @pagination="fetchData">
        </Pagination>

        <MemberControl v-if="state.memberControlShow" :itemData="state.itemData" :metaData="metaData" @close="state.memberControlShow = false"
            @fetchData="fetchData">
        </MemberControl>
        <AddLevelControl v-if="state.levelControlShow" @fetchData="fetchData" :metaData="metaData" @close="state.levelControlShow = false">
        </AddLevelControl>
        <AddProfitControl v-if="state.profitControlShow" :metaData="metaData" @close="state.profitControlShow = false">
        </AddProfitControl>
        <ProfitPoolDeploy v-if="state.profitPoolShow" :metaData="metaData" :controlType="state.controlType" @close="state.profitPoolShow = false">
        </ProfitPoolDeploy>
        <DeployDialog v-if="state.controlDeployShow" :itemData="state.itemData" :metaData="metaData" @close="state.controlDeployShow = false"
            @fetchData="fetchData">
        </DeployDialog>
        <PromotionAccountDeploy v-if="state.promotionAccountShow" :metaData="metaData" :defaultData="state.defaultData"
            @close="state.promotionAccountShow = false">
        </PromotionAccountDeploy>
        <SameIpRatioDeploy v-if="state.sameIpRatioShow" :metaData="metaData" @close="state.sameIpRatioShow = false">
        </SameIpRatioDeploy>
    </div>
</template>

<script setup name='memberLevelData'>
import { ref, reactive, onMounted, defineAsyncComponent, computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
import { ElMessageBox } from 'element-plus'
import { getUserLevelControlList, postUserOffline, overUserLevelControl } from '@/api/risk_control'
const MemberControl = defineAsyncComponent(() => import('./components/MemberControl.vue'))
const AddLevelControl = defineAsyncComponent(() => import('./components/AddLevelControl.vue'))
const AddProfitControl = defineAsyncComponent(() => import('./components/AddProfitControl.vue'))
const ProfitPoolDeploy = defineAsyncComponent(() => import('./components/ProfitPoolDeploy.vue'))
const DeployDialog = defineAsyncComponent(() => import('../components/DeployDialog.vue'))
const PromotionAccountDeploy = defineAsyncComponent(() => import('./components/PromotionAccountDeploy.vue'))
const SameIpRatioDeploy = defineAsyncComponent(() => import('./components/SameIpRatioDeploy.vue'))

let batchTypeData = [
    { title: $t('修改'), value: 1, permiss: 'admin.user-game-control.addOrEdit' },
    { title: $t('结束控制'), value: 2, permiss: 'admin.user-game-control.over' },
    // { title: $t('踢线并结束控制'), value: 3, permiss: 'admin.user-game-control.quit' },
]
const emits = defineEmits(['showMemberDetail', 'setSearchData', 'getBalanceLimit'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    initData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    formData: {},
    tableData: [],
    tableListSelection: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    memberControlShow: false,
    controlDeployShow: false,
    levelControlShow: false,
    editShow: false,
    profitControlShow: false,
    profitPoolShow: false,
    promotionAccountShow: false,
    sameIpRatioShow: false,
    controlType: 0,
    itemData: {},
    defaultData: {},
})
const router = useRouter()
const userData = userStore()
const tableRef = ref(null)

const isPermiss = computed(() => {
    return userData.isHasPermiss('admin.user-game-control.quit') || userData.isHasPermiss('admin.user-game-control.over') || userData.isHasPermiss('admin.user-game-control.addOrEdit')
})
const showBatchType = computed(() => {
    return batchTypeData.filter(item => userData.isHasPermiss(item.permiss))
})

onMounted(() => {
    state.formData = { ...state.formData, ...props.initData }
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    if (params.layerType) {
        if (params.layerType === 1) params.layerId = params.autoLevel
        if (params.layerType === 2) params.layerId = params.fixedLevel
        params.layerType -= 1
    }
    delete params.fixedLevel
    delete params.autoLevel
    if (val === 'export') {
        params.isExport = true
    } else {
        emits('setSearchData', { key: 'formData1', data: state.formData })
        isPermiss.value && tableRef.value && tableRef.value.clearSelection()
    }
    globalVBus.$emit('globalLoading', true)
    getUserLevelControlList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list || []
            state.defaultData = res.ext || {}
            state.total = total || 0
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 表格勾选切换
const handleSelectionChange = (val) => {
    state.tableListSelection = val
}

// 按钮操作
const handleConfig = (row, key) => {
    state.itemData = { ...row }
    state.itemData.userIds = row.id || ''
    if (key === 'controlDeployShow') {
        state.itemData.operateType = 5
        state.itemData.controlType = typeof state.defaultData.teamCtrlType === 'number' ? state.defaultData.teamCtrlType : ''
    }
    state[key] = true
}

const handleBatch = (type) => {
    let { tableListSelection } = state
    if (!tableListSelection.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }
    let id = tableListSelection.map(item => item.id).join(',')
    switch (type) {
        case 1:
            handleConfig({
                id,
                type: 1
            }, 'memberControlShow')
            break;
        case 2:
            handleOverControl(id, 1)
            break;
        case 3:
            handleOffline(id, 1)
            break;
    }
}

// 结束控制
const handleOverControl = (userIds, type) => {
    ElMessageBox.confirm(`${$t('确定要对')}${!type ? $t('此用户') : $t('勾选的用户')}${$t('进行结束控制操作吗？')}`, $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        overUserLevelControl({ userIds }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

// 踢线并结束控制
const handleOffline = (userIds, type) => {
    ElMessageBox.confirm(`${$t('确定要对')}${!type ? $t('此用户') : $t('勾选的用户')}${$t('进行踢线并结束控制操作吗？')}`, $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postUserOffline({ userIds }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

// 推广账号配置
const handlePromotionAccount = () => {
    state.promotionAccountShow = true
    // globalVBus.$emit('globalLoading', true)
    // overUserLevelControl().then(res => {
    //     state.itemData = res.data || {}
    //     state.promotionAccountShow = true
    //     globalVBus.$emit('globalLoading', false)
    // }).catch(err => {
    //     globalVBus.$emit('globalLoading', false)
    // })
}

// 同IP比例配置
const handleSameIpLimit = () => {
    state.sameIpRatioShow = true
    // globalVBus.$emit('globalLoading', true)
    // overUserLevelControl().then(res => {
    //     state.itemData = res.data || {}
    //     state.SameIpRatioDeploy = true
    //     globalVBus.$emit('globalLoading', false)
    // }).catch(err => {
    //     globalVBus.$emit('globalLoading', false)
    // })
}
</script>

<style lang="scss">
</style>
