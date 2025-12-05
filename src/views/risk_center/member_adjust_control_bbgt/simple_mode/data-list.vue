<template>
    <!-- BBGT会员调控-数据列表（简易模式） -->
    <div class="container-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('代理ID:')">
                <el-input v-model="state.formData.agentUserId" :placeholder="$t('请输入代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('代理账号:')">
                <el-input v-model="state.formData.agentUsername" :placeholder="$t('请输入代理账号')" />
            </el-form-item>
            <el-form-item :label="$t('返奖率:')">
                <el-select class="select-box" v-model="state.formData.controlType" clearable :placeholder="$t('请选择返奖率')">
                    <el-option v-for="item in metaData.ctrlPools" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('会员类型:')">
                <el-select class="select-box" v-model="state.formData.userType" clearable :placeholder="$t('请选择会员类型')">
                    <el-option v-for="item in metaData.userType" :key="item.value" :label="item.label" :value="item.value" />
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
            <el-form-item v-permiss="'merchant.user-simple-ctrl.addRule-2'">
                <el-button v-throttle type="primary" @click="handleConfig(1,state.defaultData)">{{$t('默认设置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.user-simple-ctrl.addRule-2'">
                <el-button v-throttle type="primary" @click="handleConfig(2)">{{$t('一键设置')}}</el-button>
            </el-form-item>
            <!-- <el-form-item v-permiss="'merchant.user-simple-ctrl.addRule-2'">
                <el-button v-throttle type="primary" @click="handleConfig(3)">{{$t('文件导入')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.user-simple-ctrl.addRule-2'">
                <el-button v-throttle type="primary" @click="handleConfig(4)">{{$t('批量操作')}}</el-button>
            </el-form-item> -->
            <!-- <el-form-item>
                <el-button v-throttle type="primary" @click="handleConfig(5)">{{$t('一键同步推广账号返奖率')}}</el-button>
            </el-form-item> -->
            <el-form-item v-permiss="'merchant.user-simple-ctrl.editVipTierCfg-2'">
                <el-button v-throttle type="primary" @click="state.profitPoolShow=true">{{$t('VIP人数比例配置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{ $t('可调控厂家包括：N_CQ9、N_PLAYSON、N_TOPTREND、N_DREAMTECH') }}</div>
        <el-table ref="tableRef" class="table-box" :data="state.tableData" border @selection-change="handleSelectionChange">
            <!-- <el-table-column v-if="isPermiss" fixed="left" type="selection" width="55" /> -->
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="emits('showMemberDetail',row.userId)">{{row.userId || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="emits('showMemberDetail',row.id)">{{row.username || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('代理ID')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="emits('showMemberDetail',row.agentUser.id)">{{row.agentUser?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('代理账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="emits('showMemberDetail',row.agentUser.id)">{{row.agentUser?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="layerName" :label="$t('会员层级')" min-width="100" align="center" />
            <el-table-column prop="userType" :label="$t('会员类型')" min-width="100" align="center" />
            <el-table-column prop="status_" :label="$t('会员状态')" min-width="100" align="center" />
            <el-table-column :label="$t('是否点控')" min-width="100" align="center">
                <template #default="{ row }">
                    {{row.hasPointCtrl ? $t('是') : $t('否')}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('是否参与活动')" width="100" align="center">
                <template #default="{ row }">
                    {{row.hasSign ? $t('是') : $t('否')}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('返奖率')" width="140" align="center">
                <template #default="{ row }">
                    <el-select :disabled="!userData.isHasPermiss('merchant.user-simple-ctrl.editLog-2')" style="width: 100%" v-model="row.controlType"
                        :placeholder="$t('请选择返奖率')">
                        <el-option v-for="item in metaData.ctrlPools" :key="item.value" :label="item.label" :value="+item.value" />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column :label="$t('提现状态')" min-width="100" align="center">
                <template #default="{ row }">
                    <span :style="{'color': !row.limitCash ? 'green': 'red'}">{{!row.limitCash ? $t('启用'):$t('禁止')}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('更新时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.updateTime && dateFormat(row.updateTime)}}
                </template>
            </el-table-column>
            <el-table-column v-if="userData.isHasPermiss('merchant.user-simple-ctrl.editLog-2')" fixed="right" align="center" :label="$t('操作')"
                width="100">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="handleEdit(row)">{{$t('修改')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && isPermiss" :selectedNum="state.tableListSelection.length" @pagination="fetchData">
        </Pagination>

        <DeployDialog v-if="state.memberControlShow" :itemData="state.itemData" :metaData="metaData" @close="state.memberControlShow = false"
            @fetchData="fetchData">
        </DeployDialog>

        <ProfitPoolDeploy v-if="state.profitPoolShow" :metaData="metaData" :controlType="state.controlType" @close="state.profitPoolShow = false">
        </ProfitPoolDeploy>
    </div>
</template>

<script setup name='memberLevelData'>
import { ref, reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import userStore from '@/store/user'
import { ElMessageBox } from 'element-plus'
import { getSimpleControlList, postSimpleControlData } from '@/api/risk_control'
import { dateFormat, deepClone } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('../components/DeployDialog.vue'))
const ProfitPoolDeploy = defineAsyncComponent(() => import('./components/ProfitPoolDeploy.vue'))

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
    defaultData: {},
    formData: {},
    tableData: [],
    tableListSelection: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    controlType: 1,
    memberControlShow: false,
    profitPoolShow: false,
    itemData: {},
})
const userData = userStore()
const tableRef = ref(null)

const isPermiss = computed(() => {
    return userData.isHasPermiss('admin.user-game-control.quit') || userData.isHasPermiss('admin.user-game-control.over') || userData.isHasPermiss('merchant.user-simple-ctrl.addRule-2')
})

onMounted(() => {
    state.formData = { ...state.formData, ...props.initData }
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    emits('setSearchData', { key: 'formData1', data: state.formData })
    let params = { ...state.listQuery, ...state.formData }
    if (params.layerType) {
        if (params.layerType === 1) params.layerId = params.autoLevel
        if (params.layerType === 2) params.layerId = params.fixedLevel
        params.layerType -= 1
    }
    delete params.fixedLevel
    delete params.autoLevel
    isPermiss.value && tableRef.value && tableRef.value.clearSelection()
    params.gameProvider = 'BGT'
    globalVBus.$emit('globalLoading', true)
    getSimpleControlList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.defaultData = res.ext || {}
        state.total = total || 0
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 表格勾选切换
const handleSelectionChange = (val) => {
    state.tableListSelection = val
}

// 按钮操作
const handleConfig = (operateType, obj = {}) => {
    state.itemData = { ...obj, operateType }
    if (operateType === 5) {
        state.itemData.controlType = typeof state.defaultData.teamCtrlType === 'number' ? state.defaultData.teamCtrlType : ''
    }
    state.memberControlShow = true
}

// 修改
const handleEdit = ({ userId, username, controlType }) => {
    if (typeof controlType !== 'number') return ElMessage.warning($t('请设置返奖率后再进行操作！'))
    ElMessageBox.confirm(`${$t('确定要修改用户：')}${username}${$t(' 的返奖率吗？')}`, $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postSimpleControlData({ userIds: userId, controlType, gameProvider: 'BGT' }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss">
</style>
