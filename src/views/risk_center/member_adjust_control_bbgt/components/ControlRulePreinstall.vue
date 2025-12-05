<template>
    <!-- BBGT会员调控-返奖率预设列表（简易模式） -->
    <div class="container-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('设置类型:')">
                <el-select class="select-box" v-model="state.formData.type" clearable :placeholder="$t('请选择设置类型')"
                    @change="state.formData.value = ''">
                    <el-option v-for="item in simpleCtrlType" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-form-item v-if="!isDisabled" :label="$t('设置对象:')">
                <el-select v-if="!state.formData.type" class="select-box" v-model="state.formData.value" clearable :placeholder="$t('请选择固定层级')">
                    <el-option v-for="item in metaData.fixedLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
                <el-select v-if="state.formData.type === 1" class="select-box" v-model="state.formData.value" clearable :placeholder="$t('请选择自动层级')">
                    <el-option v-for="item in metaData.autoLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
                <el-input v-if="state.formData.type === 2" v-model="state.formData.value" :placeholder="$t('请输入代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('返奖率:')">
                <el-select class="select-box" v-model="state.formData.controlType" clearable :placeholder="$t('请选择返奖率')">
                    <el-option v-for="item in metaData.ctrlPools" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.user-simple-ctrl.addRule-2'">
                <el-button v-throttle type="primary" @click="state.showAddDialog = true">{{$t('新 增')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.user-simple-ctrl.syncRule-2'">
                <el-button v-throttle type="primary" @click="handleSynchronization('')">{{$t('一键同步返奖率')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="type_" :label="$t('设置类型')" min-width="120" align="center" />
            <!-- <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="emits('showMemberDetail',row.id)">{{row.id || ''}}</span>
                </template>
            </el-table-column> -->
            <el-table-column :label="$t('设置对象')" min-width="140" align="center">
                <template #default="{ row }">
                    <span v-if="row.type === 2" class="special pointer" @click="emits('showMemberDetail',row.value)">{{row.value_}}</span>
                    <span v-else>{{row.value_}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('返奖率')" width="140" align="center">
                <template #default="{ row }">
                    <el-select :disabled="!userData.isHasPermiss('merchant.user-simple-ctrl.addRule-2')" style="width: 100%" v-model="row.controlType"
                        :placeholder="$t('请选择返奖率')">
                        <el-option v-for="item in metaData.ctrlPools" :key="item.value" :label="item.label" :value="+item.value" />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column prop="addEmp.name" :label="$t('创建人')" min-width="140" align="center" />
            <el-table-column :label="$t('创建时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.addTime && dateFormat(row.addTime)}}
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('更新人')" min-width="140" align="center" />
            <el-table-column :label="$t('更新时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.updateTime && dateFormat(row.updateTime)}}
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="200">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.user-simple-ctrl.syncRule-2'" v-throttle type="primary" text
                        @click="handleSynchronization(row.id)">{{$t('同步返奖率')}}</el-button>
                    <el-button v-permiss="'merchant.user-simple-ctrl.addRule-2'" v-throttle type="primary" text @click="handleEdit(row)">{{$t('修改')}}
                    </el-button>
                    <el-button v-permiss="'merchant.user-simple-ctrl.addRule-2'" v-throttle type="danger" text @click="handleDelete(row.id)">
                        {{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <AddRuleDialog v-if="state.showAddDialog" :metaData="metaData" :simpleCtrlType="simpleCtrlType" @close="state.showAddDialog = false"
            @fetchData="fetchData">
        </AddRuleDialog>
    </div>
</template>

<script setup name='memberLevelData'>
import { reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import userStore from '@/store/user'
import { ElMessageBox } from 'element-plus'
import { getSimpleRuleList, editSimpleRuleData, deleteSimpleRuleData, postSyncRuleConfig } from '@/api/risk_control'
import { dateFormat } from '@/common/util'
const AddRuleDialog = defineAsyncComponent(() => import('./AddRuleDialog.vue'))

const emits = defineEmits(['showMemberDetail', 'setSearchData'])
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
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    showAddDialog: false,
})
const userData = userStore()

const simpleCtrlType = computed(() => {
    return props.metaData.simpleCtrlType.filter(item => +item.value !== 3)
})
const isDisabled = computed(() => {
    return typeof state.formData.type !== 'number'
})

onMounted(() => {
    state.formData = { ...props.initData }
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
    emits('setSearchData', { key: 'formData2', data: state.formData })
    let params = { ...state.listQuery, ...state.formData, gameProvider: 'BGT' }
    globalVBus.$emit('globalLoading', true)
    getSimpleRuleList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 编辑
const handleEdit = ({ id, controlType, balanceLimit }) => {
    if (typeof controlType !== 'number') return ElMessage.warning($t('请设置返奖率后再进行操作！'))
    ElMessageBox.confirm($t('确定修改当前配置规则的返奖率和余额限制吗？'), $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        editSimpleRuleData({ id, controlType, balanceLimit, gameProvider: 'BGT' }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

// 删除
const handleDelete = (id) => {
    ElMessageBox.confirm($t('确定删除当前配置规则吗？'), $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteSimpleRuleData({ id, gameProvider: 'BGT' }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

// 同步
const handleSynchronization = (id) => {
    let title = !!id ? $t('确定要同步当前配置规则下所有用户的返奖率吗？') : $t('确定要一键同步全部预设列表的返奖率吗？')
    ElMessageBox.confirm(title, $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postSyncRuleConfig({ id, gameProvider: 'BGT' }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss">
</style>
