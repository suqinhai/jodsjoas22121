<template>
    <!-- 信誉分管理 -->
    <div class="container credit-score">
        <el-form class="filter-form" inline :model="state.formData" :rules="state.rules">
            <div class="small-row">
                 <el-form-item prop="creditSwitch">
                    <el-checkbox v-model="state.formData.creditSwitch" :label="$t('开启前端会员信誉分展示')" :true-label="1" :false-label="0" :disabled="state.isDisabled"></el-checkbox>
                </el-form-item>
                <el-form-item :label="$t('信誉分初始值:')" style="margin-left:37px;" prop="creditScore">    
                    <el-input-number :placeholder="$t('请输入整数0-100')" :controls="false" :max="100" :min="0" v-model="state.formData.creditScore" :disabled="state.isDisabled"></el-input-number>
                     <div class="operate">
                        <el-button v-throttle v-if="!state.isDisabled" @click="handleCancel">{{$t('取 消')}}</el-button>
                        <el-button v-throttle style="margin-left:20px" type="primary" v-if="!state.isDisabled" @click="handleCreditScore">{{$t('保存')}}
                        </el-button>
                        <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
                    </div>
                </el-form-item>
                <div class="tips-w">
                    {{$t('注：信誉分初始值修改后，只对之后注册的会员有效，之前的会员不会变更。')}}
                </div>
            </div>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <!-- <el-form-item :label="$t('状态:')">
                <el-select class="select-box" v-model="state.formData.status" clearable :placeholder="$t('状态')">
                    <el-option v-for="item in state.statusList" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item> -->
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'admin.user.creditImport'">
                <el-button v-throttle type="primary" @click="importDatas">{{$t('导入')}}</el-button>
            </el-form-item>
            <!-- <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出')}}</el-button>
            </el-form-item> -->
            <el-form-item v-permiss="'admin.user.creditEdit'">
                <el-dropdown v-model="state.selectedBatchOperation" @command="handleBatch">
                    <el-button v-throttle type="primary">{{$t('批量操作')}}<el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="(item,index) in state.batchTypeData" :key="index" :command="item.value">
                                {{item.label}}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-form-item>
             <el-form-item v-permiss="'admin.user.creditEdit'">
                <el-button v-throttle type="primary" @click="add">{{$t('修改')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="all-page">
             <el-checkbox v-model="state.allSelected" @change="toggleAllSelection">{{$t('全部')}}</el-checkbox>
            <div class="active-page">{{$t('本页')}}</div>
        </div>
        <el-table class="table-box" :data="state.tableData" border @selection-change="handleSelectionChange" ref="tableRef">
            <el-table-column fixed="left" type="selection" width="120" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="score" :label="$t('信誉分')" min-width="120" align="center" />
            <el-table-column prop="hot" :label="$t('个人开关')" min-width="100" align="center">
                <template #default="{ row }">
                    <span>{{row.status === 1 ? $t('开启') : $t('关闭')}}</span>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" /> -->
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="120" >
                <template #default="{ row }">
                    <el-button v-permiss="'admin.user.creditEdit'" v-throttle type="primary"  text @click="handleUpdate(row)" v-if="state.remoteCreditSwitch === 1">{{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData" :selectedNum="state.allSelected ? state.total : state.selectionItem.length" :isShowChecked="state.selectionItem.length > 0">
        </Pagination>
        <ImportDialog v-if="state.importDialogShow" ref="importDialog" @close="state.importDialogShow = false" @fetchData="fetchData" ></ImportDialog>
        <AddDialog v-if="state.showAddDialog" :itemData="state.itemData" @close="state.showAddDialog = false" @fetchData="fetchData" :allSelected="state.allSelected">
        </AddDialog>
        <BatchEditDialog v-if="state.showBatchEditDialog" :itemData="state.selectionIds" @close="state.showBatchEditDialog = false" :allSelected="state.allSelected" @fetchData="fetchData">
        </BatchEditDialog>
    </div>
</template>

<script setup name='promotionAccountSetting'>
import { reactive, onMounted, defineAsyncComponent, ref, nextTick, onBeforeUnmount } from 'vue'
import userStore from '@/store/user'
import { ElMessageBox } from "element-plus";
import { getCreditList, postCreditEdit, postCreditImport } from '@/api/member'
import { dateFormat } from '@/common/util'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
const ImportDialog = defineAsyncComponent(() => import('./components/ImportDialog.vue'))
const BatchEditDialog = defineAsyncComponent(() => import('./components/BatchEditDialog.vue'))
const AddDialog = defineAsyncComponent(() => import('./components/AddDialog.vue'))
const userData = userStore()
const state = reactive({
    pageAllSelected: false,
    allSelected: false,
    allPageselected: false,
    remoteCreditSwitch: 0,
    isDisabled: true,
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    importDialogShow: false,
    showDeployDialog: false,
    showBatchDialog: false,
    showAddDialog: false,
    showBatchEditDialog: false,
    statusList: [
        {
            label: $t('全部'),
            value: ''
        },
        {
            label: $t('开启'),
            value: 1
        },
        {
            label: $t('关闭'),
            value: 2
        }
    ],
    batchTypeData: [
        {
            label: $t('修改信誉分'),
            value: 2
        },
        {
            label: $t('开启'),
            value: 1
        },
        {
            label: $t('关闭'),
            value: 0
        }
    ],
    isBatch: false,
    selectedBatchOperation: '',
    selectionIds: [],
    selectionItem: [],
    rules: {
        creditScore: [
            {
                required: true,
                message: $t('请输入整数0-100'),
                trigger: 'change',
            },
            {
                pattern: /^[0-9]\d*$/,
                message: $t('请输入整数0-100'),
                trigger: 'change',
            },
        ]
    },
})

const tableRef = ref()


onMounted(() => {
    getCreditScore()
    fetchData()
})
onBeforeUnmount(() => {
    if (tableRef.value) {
        tableRef.value = null
    }
})
const handleCancel = () => {
    getCreditScore()
    state.isDisabled = true
}

// 导入
const importDatas = () => {
    state.importDialogShow = true
}
const add = () => {
    state.itemData = {}
    state.showAddDialog = true
}
// 修改
const handleUpdate = (row) => {
    state.itemData = row
    state.showAddDialog = true
}
const getCreditScore = () => {
    const params = {
        part:'creditScore'
    }
    getHomeDeploy(params).then(res => {
        let { data = {} } = res
        state.formData.creditSwitch = data.status || 0
        state.formData.creditScore = data.score || 0
        state.remoteCreditSwitch = data.status || 0
        fetchData()
    })
}
const  handleCreditScore = (val) => {
    const params = {
        part:'creditScore', 
        creditScore: JSON.stringify({
            status: state.formData.creditSwitch,
            score: state.formData.creditScore
        })
    }
    postHomeDeploy(params).then(() => {
        ElMessage.success($t('操作成功'))
        state.isDisabled = true
        state.remoteCreditSwitch = state.formData.creditSwitch
        fetchData()
    }).catch(() => {
        ElMessage.error($t('操作失败'))
    })
}
const toggleAllSelection = (val) => {
    if (!tableRef.value) return
    if (val) {
        tableRef.value.clearSelection()
        state.tableData.forEach(row => {
            tableRef.value.toggleRowSelection(row, true)
        })
    } else {
        tableRef.value.clearSelection()
    }
}
const handleSelectionChange = (val) => {
    state.selectionItem = val
    let ids = val.map(item => item.id).join(',')
    state.selectionIds = ids
}
const handleBatch = (type) => {
    state.selectedBatchOperation = type
    if (!state.selectionIds.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }
    if(state.selectedBatchOperation === 2) {
        state.showBatchEditDialog = true
    }else {
        handleOpen()
    }
}
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            let { creditSwitch, creditScore } = state.formData
            state.formData = {}
            state.formData.creditSwitch = creditSwitch
            state.formData.creditScore = creditScore
        }
    }
    let params = { ...state.formData, ...state.listQuery }
    delete params.creditSwitch
    delete params.creditScore
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getCreditList(params).then((res) => {
        if (!params.isExport) {
            let { data } = res
            if (data && data.list) {
                state.tableData = data.list.map(item => {
                    item.updateTime && (item.updateTime = dateFormat(item.updateTime))
                    return item
                })
                state.total = data.total || 0
                state.allSelected = false
            }
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
const filterSelete = (selectionIds) => {
    return selectionIds.filter(item => item.status !== state.selectedBatchOperation).map(item => item.id).join(',')
}
const handleOpen = (userIds) => {
    if(!filterSelete(state.selectionItem).length) {
        return ElMessage.warning($t('暂无符合操作的数据！'))    
    }
    ElMessageBox.confirm(state.selectedBatchOperation === 1 ? $t('确定批量开启个人信誉分显示？') : $t('确定批量关闭个人信誉分显示？'), $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        const params = {
            ids: state.allSelected ? '' : filterSelete(state.selectionItem),
            status: state.selectedBatchOperation,
        }
        postCreditEdit(params).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(err => { })
}

</script>

<style lang="scss">
.credit-score {
    .operate{
        margin-left: 20px;
    }
    .item-row {
        display: flex;
        align-items: center;
        justify-self: start;
    }
    .tips-w{
        margin-bottom: 15px;
    }
    .all-page{
        position: relative;
        color: #909399;
        font-weight: 600;
        z-index: 100;
        .active-page{
            position: absolute;
            bottom: -30px;
            left: 40px;
            color: #909399;   
            font-weight: 600;
        }
    }
    
}
</style>
