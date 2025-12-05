<template>
    <!-- 站点配置-子站点配置 -->
    <div class="container child-site-config">
        <div class="head">
            <el-button v-throttle type="primary" v-permiss="'admin.merchant.oneKeyEditSiteStatus'" @click="state.showMaintainAllSiteDialog = true">
                {{$t('一键维护')}}</el-button>
            <el-button v-throttle type="primary" v-permiss="'admin.merchant.oneKeyEditSiteStatus'" @click="recoverAllSite">{{$t('一键恢复')}}</el-button>
            <el-button v-throttle type="primary" v-permiss="'admin.merchant.copyConfig'" @click="handleCopySite">{{$t('复制站点')}}</el-button>
            <div class="explain-question">
                <el-icon class="pointer" color="#666" :size="28" @click="state.showExplain = true">
                    <QuestionFilled />
                </el-icon>
            </div>
        </div>
        <el-table class="table-box" :data="state.tableData" border :row-class-name="({row}) => (row.isTotal ? 'total-row' : '')">
            <el-table-column fixed="left" prop="name" :label="$t('站点名称')" min-width="100" align="center" />
            <el-table-column prop="id" :label="$t('站点ID')" min-width="100" align="center" />
            <el-table-column prop="billFee" :label="$t('账单费用')" min-width="100" align="center" />
            <el-table-column prop="regUserCount" :label="$t('站点会员数')" min-width="100" align="center" />
            <el-table-column prop="diff" :label="$t('充提差')" min-width="100" align="center" />
            <el-table-column :label="$t('经销商模式')" min-width="100" align="center">
                <template #default="{ row }">
                    <span v-if="row.status === -99 || row.templateType?.type === 4">{{row.dealerMode ? $t('已开启') : $t('未开启')}}</span>
                    <span v-else-if="row.dealerMode && !row.isTotal">{{$t('已开启')}}</span>
                    <el-button v-else-if="!row.dealerMode && !row.isTotal" type="primary" text @click="handleCloseDealer(row.id)">{{$t('未开启')}}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column :label="$t('前端模版')" min-width="180" align="center">
                <template #default="{ row }">
                    <span v-if="row.status === -99">{{getTemplateText(row)}}</span>
                    <el-button v-else-if="!row.isTotal" type="primary" text @click="handleJump(row.id,'/site-config/template-store',row.status)">
                        {{ getTemplateText(row) }}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column label="Logo" min-width="120" align="center">
                <template #default="{ row }">
                    <el-image v-if="!!row.logo" :src="row.logo" class="imgs" :preview-src-list="[row.logo]" :crossorigin="null" preview-teleported
                        fit="contain"></el-image>
                    <el-button v-if="!row.logo && !row.isTotal && row.status !== -99" type="primary" text
                        @click="handleJump(row.id,'/site-config/home-module',row.status)">
                        {{ $t('去配置') }}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column v-for="item in SITE_CONFIG_KEY" :key="item.key" :prop="item.key" :label="item.label" min-width="110" align="center">
                <template #default="{ row }">
                    <span v-if="row.status === -99 || (['task'].includes(item.key) && row.templateType?.type === 4)">--</span>
                    <el-button v-else-if="!row.isTotal" type="primary" text @click="handleConfig(row,item)">
                        {{ item.key === 'adjustControl' ?  (row[item.key] ? $t('已配置') : $t('去配置')) : (row[item.key] || $t('去配置')) }}</el-button>
                </template>
            </el-table-column>
            <el-table-column :label="$t('创建时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ row.addTime && dateFormat(row.addTime) || ''}}
                </template>
            </el-table-column>
            <el-table-column prop="siteStatus_" :label="$t('站点状态')" min-width="100" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="120" align="center" v-if="userData.isHasPermiss('admin.merchant.editSiteStatus')">
                <template #default="{ row }">
                    <div v-if="!row.isTotal">
                        <el-button v-throttle v-if="row.status === -1 || row.status === -5" type="primary" text @click="recoverSite(row)">
                            {{$t('恢复')}}</el-button>
                        <el-button v-throttle v-else-if="row.status !== -99" type="primary" text @click="handleEditStatus(row)">{{$t('修改')}}
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <GuideConfigDialog v-if="state.showGuideDialog" :itemData="state.currentItem" @close="state.showGuideDialog = false"
            @handleCopySite="handleCopySite">
        </GuideConfigDialog>
        <CopySiteDialog v-if="state.showCopySite" :itemData="state.currentItem" :merchantConfigType="state.merchantConfigType"
            @close="state.showCopySite = false" @fetchData="fetchData">
        </CopySiteDialog>
        <MaintainAllSiteDialog v-if="state.showMaintainAllSiteDialog" @fetchData="fetchData" @close="state.showMaintainAllSiteDialog = false">
        </MaintainAllSiteDialog>
        <EditStatusDialog v-if="state.showEditDialog" :itemData="state.currentItem" @fetchData="fetchData" @close="state.showEditDialog = false">
        </EditStatusDialog>
        <ExplainDialog v-if="state.showExplain" @close="state.showExplain = false"></ExplainDialog>
    </div>
</template>

<script setup name='childSiteConfig'>
import { reactive, onMounted, onActivated, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { dateFormat } from '@/common/util'
import { TEMPLATE_STYLE_DATA, SITE_CONFIG_KEY } from '@/common/util/appConfig'
import { getMerchantList, postEditSiteStatus, postEditAllSiteStatus, postDealerMode } from '@/api/website'
import { getCommonMeta } from '@/api/common'
const GuideConfigDialog = defineAsyncComponent(() => import('./components/GuideConfigDialog.vue'))
const CopySiteDialog = defineAsyncComponent(() => import('./components/CopySiteDialog.vue'))
const MaintainAllSiteDialog = defineAsyncComponent(() => import('./components/MaintainAllSiteDialog.vue'))
const EditStatusDialog = defineAsyncComponent(() => import("./components/EditStatusDialog.vue"))
const ExplainDialog = defineAsyncComponent(() => import("./components/ExplainDialog.vue"))

const state = reactive({
    templateType: [],
    merchantConfigType: [],
    fromData: {},
    tableData: [],
    showEditDialog: false,
    showGuideDialog: false,
    showCopySite: false,
    showMaintainAllSiteDialog: false,
    showExplain: false,
    currentItem: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    isInit: true
})
const router = useRouter()
const userData = userStore()
const commonData = commonStore()

onMounted(async () => {
    if (commonData.isManual) state.isInit = false
    let { data } = await getCommonMeta({ types: 'templateType,merchantConfigType' })
    state.templateType = data?.templateType || []
    state.merchantConfigType = data?.merchantConfigType || []
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    fetchData()
})

const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getMerchantList({ ...state.listQuery }).then((res) => {
        if (res.status === 'OK') {
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.configs.forEach((its, index) => {
                    item[SITE_CONFIG_KEY[index].key] = its
                })
                item.templateType = item.templateType ? JSON.parse(item.templateType) : {}
                return item
            })
            if (state.tableData.length && res.ext) {
                state.tableData.unshift({
                    ...res.ext,
                    name: $t('汇总'),
                    isTotal: true
                })
            }
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 获取皮肤模版文案
const getTemplateText = (row) => {
    let { type, color } = row.templateType
    let typeText = type ? state.templateType.find((item) => +item.value === type)
        ?.label || '' : ''
    let colorText = type && color ? TEMPLATE_STYLE_DATA[type].find((item) => item.value === color)
        ?.title || '' : ''
    return typeText && colorText ? typeText + '-' + colorText : ''
}

// 修改站点状态
const handleEditStatus = (item) => {
    let { domainName, register, platform, banner, logo } = item
    state.currentItem = item
    if (!domainName || !register || !platform || !banner || !logo) return state.showGuideDialog = true
    state.showEditDialog = true
}

// 复制站点
const handleCopySite = (val) => {
    globalVBus.$emit('globalLoading', true)
    getMerchantList({
        _page: 1,
        _size: 1000
    }).then((res) => {
        if (res.status === 'OK') {
            let { list } = res.data
            list.forEach(item => {
                item.configs = item.configs.filter((its, index) => ![0, 2, 3, 10].includes(index))
                item.checked = false
            })
            state.currentItem = {
                ...val,
                dataList: list
            }
            state.showCopySite = true
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })

}

const handleConfig = ({ id, templateType, status }, { path, key }) => {
    if (key === 'agent' || key === 'task') {
        if ((commonData.currentMerchantSite.templateType === 4 && templateType?.type !== 4) || (commonData.currentMerchantSite.templateType !== 4 && templateType?.type === 4)) {
            return ElMessage.warning($t('提示：该站点因前端模版关联的功能差异，不可从此列表直接跳转配置！'))
        }
        if (key === 'agent' && templateType?.type === 4) path = '/agent/custom-agent-config'
    }
    handleJump(id, path, status)
}

const handleJump = (merchantId, path, status) => {
    if (status < -3) return ElMessage.warning($t('当前状态的站点无法进行跳转操作！'))
    router.push(path + '?merchantId=' + merchantId)
}

// 恢复站点
const recoverSite = (item) => {
    let { domainName, register, platform, banner, logo } = item
    state.currentItem = item
    if (!domainName || !register || !platform || !banner || !logo) return state.showGuideDialog = true
    globalVBus.$emit('globalLoading', true)
    postEditSiteStatus({
        id: item.id,
        status: 1,
    }).then(() => {
        commonData.getMerchantSiteData()
        fetchData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 一键恢复站点
const recoverAllSite = () => {
    globalVBus.$emit('globalLoading', true)
    postEditAllSiteStatus({
        status: 1
    }).then(() => {
        commonData.getMerchantSiteData()
        fetchData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 打开站点经销商模式
const handleCloseDealer = (siteId) => {
    ElMessageBox.confirm($t('确定要打开此站点的经销商模式吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postDealerMode({ siteId, dealerMode: 3 }).then(res => {
            if (siteId === commonData.currentMerchantSite.id) {
                userData.getMenuList().then(() => {
                    fetchData()
                }).catch(() => {
                    globalVBus.$emit('globalLoading', true)
                })
            } else {
                fetchData()
            }
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss" scoped>
.child-site-config {
    .head {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        .explain-question {
            margin-left: 15px;
            width: 28px;
            height: 28px;
        }
    }
}
</style>