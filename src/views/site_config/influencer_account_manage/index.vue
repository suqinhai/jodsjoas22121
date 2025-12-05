<template>
    <!-- 站点配置-网红博主配置 -->
    <div class="container influencer-account-manage">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('网红ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入网红ID')" />
            </el-form-item>
            <el-form-item :label="$t('网红账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入网红账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('账号导出')}}</el-button>
            </el-form-item>
            <el-form-item v-if="isPermiss">
                <el-button v-throttle type="primary" @click="handleConfig({},0)">{{$t('会员设置')}}</el-button>
            </el-form-item>
            <el-form-item v-if="isPermiss">
                <el-button v-throttle type="primary" @click="handleConfig({},1)">{{$t('会员批量导入')}}</el-button>
            </el-form-item>
            <el-form-item v-if="isPermiss">
                <el-button v-throttle type="primary" @click="handleConfig({},2)">{{$t('生成账号')}}</el-button>
            </el-form-item>
            <el-form-item v-if="isPermiss && (state.currentMerchantId || commonData.merchantSiteList.length < 2)">
                <el-button v-throttle type="primary" @click="handleConfig({},3)">{{$t('批量佣金设置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table ref="tableRef" class="table-box" :data="state.tableData" border @selection-change="(val) => state.tableListSelection = val">
            <el-table-column v-if="isPermiss && (state.currentMerchantId || commonData.merchantSiteList.length < 2)" fixed="left" type="selection"
                width="55" />
            <el-table-column prop="localTime_" label="新增时间" min-width="160" align="center" />
            <el-table-column prop="merchantId" :label="$t('站点ID')" min-width="100" align="center" />
            <el-table-column prop="merchantName" :label="$t('站点名称')" min-width="120" align="center" />
            <el-table-column :label="$t('网红账号')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId,row.merchantId)">
                        {{ row.username }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('网红ID')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId,row.merchantId)">
                        {{ row.userId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('上级账号')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.agentUserId,row.merchantId)">
                        {{ row.agentUsername }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('上级ID')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.agentUserId,row.merchantId)">
                        {{ row.agentUserId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="commission" :label="$t('网红佣金')" min-width="140" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="150" v-if="isPermiss">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="handleConfig(row,4)">{{$t('修改佣金')}}
                    </el-button>
                    <!-- <el-button v-throttle type="primary" v-permiss="'merchant.user-tag.edit'" text @click="handleDelete(row.id)">{{$t('删除')}}
                    </el-button> -->
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && isPermiss && (state.currentMerchantId || commonData.merchantSiteList.length < 2)"
            :selectedNum="state.tableListSelection.length" @pagination="fetchData">
        </Pagination>

        <DeployDialog v-if="state.showDeployDialog" :itemData="state.itemData" :operateType="state.operateType"
            @close="state.showDeployDialog = false" @fetchData="fetchData">
        </DeployDialog>
        <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
    </div>
</template>

<script setup name='influencerAccountManage'>
import { ref, reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import userStore from '@/store/user'
import commonStore from '@/store/common'
// import { ElMessageBox } from "element-plus"
import { getInfluencerAccountList } from '@/api/website'
import { dateFormat } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const state = reactive({
    formData: {},
    tableData: [],
    tableListSelection: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    operateType: 0,
    showDeployDialog: false,
    itemData: {},
    memberDetailShow: false,
    merchantId: '',
    currentMerchantId: '',
})
const userData = userStore()
const commonData = commonStore()
const tableRef = ref(null)

const isPermiss = computed(() => {
    return userData.isHasPermiss('merchant.blogger.generateAccount')
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.formData, ...state.listQuery }
    if (val === 'export') params.isExport = true
    isPermiss.value && tableRef.value && tableRef.value.clearSelection()
    globalVBus.$emit('globalLoading', true)
    getInfluencerAccountList(params).then(({ data }) => {
        if (!params.isExport) {
            let { total, list } = data
            state.tableData = list || []
            state.total = total
            state.currentMerchantId = params.merchantId
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (memberId, merchantId) => {
    commonData.memberId = memberId
    state.merchantId = merchantId
    state.memberDetailShow = true
}

const handleConfig = (val = {}, type) => {
    state.itemData = { ...val }
    state.operateType = type
    if (type === 3) {
        let { tableListSelection } = state
        if (!tableListSelection.length) return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
        state.itemData.userIds = tableListSelection.map(item => item.userId).join(',')
        state.itemData.merchantId = state.currentMerchantId
    }
    state.showDeployDialog = true
}

// 删除
// const handleDelete = (id) => {
//     ElMessageBox.confirm($t('确定要删除此网红账号配置吗？'), $t('提示'), {
//         type: 'warning'
//     }).then(() => {
//         globalVBus.$emit('globalLoading', true)
//         deleteMemberTagData({ id, status: 1 }).then(res => {
//             fetchData()
//         }).catch(err => {
//             globalVBus.$emit('globalLoading', false)
//         })
//     }).catch(err => { })
// }
</script>

<style lang="scss">
.influencer-account-manage {
    .head {
        padding-right: 20px;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
    }
}
</style>
