<template>
    <!-- 游戏平台列表 -->
    <div class="container game-platform-list">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('游戏类型:')">
                <el-select class="select-box" v-model="state.formData.type" :placeholder="$t('请选择游戏类型')" clearable>
                    <el-option v-for="item in state.gameTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('厂家:')">
                <el-select class="select-box" v-model="state.formData.vendor" :placeholder="$t('请选择厂家')" clearable>
                    <el-option v-for="item in state.venderList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.merchant-game.incrSyncGame'">
                <el-button v-throttle type="primary" @click="handleUpdateGame">{{$t('更新游戏')}}</el-button>
            </el-form-item>
            <el-form-item v-if="isPermiss">
                <el-dropdown @command="handleBatch">
                    <el-button v-throttle type="primary">{{$t('批量操作')}}<el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="(item,index) in showOperateType" :key="index" :command="item.type">
                                {{item.title}}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-form-item>
            <el-form-item>
                <el-checkbox v-model="state.formData.hideGameName" :label="$t('游戏图片名称隐藏')" :true-label="1" :false-label="0" @change="changeHideGameName" v-if="userData.getTemplateType() == 5"></el-checkbox>
            </el-form-item>
        </el-form>
        <el-table ref="tableRef" class="table-box" :data="state.tableData" border @selection-change="handleSelectionChange">
            <el-table-column v-if="isPermiss" fixed="left" type="selection" :selectable="(row) => !['PP_','CQ9_'].includes(row.alias) && !(country === 'MX' && row.alias === 'JL') && !(noRealPG && row.alias === 'PG') && !((country === 'NG'|| country === 'AR' || country === 'CO' || country === 'UZ') && (row.alias === 'JL' || row.alias === 'PP' || row.alias === 'PG'))" width="55" />
            <el-table-column prop="sort" :label="$t('排序')" width="80" align="center" />
            <el-table-column prop="type_" :label="$t('游戏类型')" min-width="100" align="center" />
            <el-table-column prop="name" :label="$t('厂家名称')" min-width="100" align="center" />
            <el-table-column prop="hot" :label="$t('热门开关')" min-width="100" align="center" v-if="userData.getTemplateType() !== 4">
                <template #default="{row}">
                    <el-switch :disabled="!isPermiss || !row.status" v-model="row.hot" :active-value="1" :inactive-value="0"
                        @change="handleSwitch(row,'hot')" />
                </template>
            </el-table-column>
            <el-table-column prop="maintain" :label="$t('维护开关')" min-width="100" align="center">
                <template #default="{row}">
                    <el-switch :disabled="!isPermiss" v-model="row.maintain" :active-value="1" :inactive-value="0"
                        @change="handleSwitch(row,'maintain')" />
                </template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('平台开关')" min-width="100" align="center">
                <template #default="{row}">
                    <el-switch 
                    :disabled="
                    !isPermiss || 
                    (country === 'MX' && row.alias === 'JL') ||
                    ((country === 'NG' || country === 'AR' || country === 'CO' || country === 'UZ') && (row.alias === 'JL' || row.alias === 'PP' || row.alias === 'PG')) ||
                    (noRealPG && row.alias === 'PG' && !row.status)" 
                    v-model="row.status" :active-value="1" :inactive-value="0"
                        @change="handleSwitch(row,'status')" />
                </template>
            </el-table-column>
            <el-table-column prop="gameNum" :label="$t('子游戏数量')" min-width="120" align="center" />
            <el-table-column prop="minEntry" :label="$t('最低准入')" min-width="110" align="center">
                <template #header>{{$t('最低准入')}}<el-tooltip effect="dark" :content="$t('准入必须大于注册赠送，防止被套利')" placement="top-start">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column :label="$t('品牌LOGO')" min-width="120" align="center" v-if="userData.getTemplateType() !== 4">
                <template #default="{ row }">
                    <el-image v-if="!!row.image" class="imgs" :src="row.image" :crossorigin="null" :preview-src-list="[row.image]" preview-teleported
                        fit="contain" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('定制版LOGO(已选择)')" min-width="120" align="center" v-if="userData.getTemplateType() === 4">
                <template #default="{ row }">
                    <el-image v-if="!!row.activeLogo" class="imgs" :src="row.activeLogo" :crossorigin="null" :preview-src-list="[row.activeLogo]"
                        preview-teleported fit="contain" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('定制版LOGO(未选择)')" min-width="120" align="center"
                v-if="userData.getTemplateType() === 4 && userData.getTemplateColor() === 3001">
                <template #default="{ row }">
                    <el-image v-if="!!row.nonActiveLogo" class="imgs" :src="row.nonActiveLogo" :crossorigin="null"
                        :preview-src-list="[row.nonActiveLogo]" preview-teleported fit="contain" />
                </template>
            </el-table-column>
            <el-table-column width="150" :label="$t('宣传图(欧美)')" align="center" v-if="userData.getTemplateType() === 1">
                <template #default="{row}">
                    <el-image v-if="!!row.VSloganImage" class="imgs" :src="row.VSloganImage" :preview-src-list="[row.VSloganImage]"
                        :crossorigin="null" preview-teleported fit="contain" />
                </template>
            </el-table-column>
            <el-table-column width="150" :label="$t('热门图片(欧美)')" align="center" v-if="userData.getTemplateType() === 1">
                <template #default="{row}">
                    <el-image v-if="!!row.VHotImages" class="imgs" :src="row.VHotImages" :preview-src-list="[row.VHotImages]" :crossorigin="null"
                        preview-teleported fit="contain" />
                </template>
            </el-table-column>
            <el-table-column width="150" :label="$t('宣传图(亚太)')" align="center" v-if="userData.getTemplateType() === 2">
                <template #default="{row}">
                    <el-image v-if="!!row.FSloganImage" class="imgs" :src="row.FSloganImage" :preview-src-list="[row.FSloganImage]"
                        :crossorigin="null" preview-teleported fit="contain" />
                </template>
            </el-table-column>
            <el-table-column width="150" :label="$t('热门图片(亚太)')" align="center" v-if="userData.getTemplateType() === 2">
                <template #default="{row}">
                    <el-image v-if="!!row.FHotImages" class="imgs" :src="row.FHotImages" :preview-src-list="[row.FHotImages]" :crossorigin="null"
                        preview-teleported fit="contain" />
                </template>
            </el-table-column>
            <el-table-column min-width="120" align="center">
                <template #header>{{$t('替换厂商')}}<el-tooltip effect="dark" :content="$t('对BBGT厂家的PP电子，CQ9电子，增加该开关，开启后将对应真厂商关闭。')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    <el-switch v-if="['CQ9'].includes(row.alias) && row.type === 3" :disabled="!isPermiss" v-model="row.replacer"
                        @change="handleSwitch(row,'replacer')" />
                </template>
            </el-table-column>
            <el-table-column prop="username" :label="$t('操作人')" min-width="120" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作日期')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.updateTime) }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('操作')" width="140" align="center">
                <template #default="{ row }">
                    <el-button v-if="userData.isHasMenuPermiss('merchant.merchant-game.list')" v-throttle type="primary" text
                        @click="handleManage(row)">{{$t('管理')}}</el-button>
                    <el-button v-if="isPermiss" v-throttle type="primary" text @click="handleEdit(row)">{{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && isPermiss" :selectedNum="state.tableListSelection.length" @pagination="fetchData">
        </Pagination>

        <GameEditDialog :currentItem="state.currentItem" @refresh="fetchData" @close="state.showEditDialog = false" v-if="state.showEditDialog">
        </GameEditDialog>
    </div>
</template>

<script setup name="gamePlatformList">
import { ref, reactive, onMounted, defineAsyncComponent, computed, onActivated } from "vue"
import { useRoute, useRouter } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { dateFormat } from '@/common/util'
import { ElMessageBox } from 'element-plus'
import { getVendorList, editVendor, postUpdateGame, batchPostVendorData } from "@/api/merchant_center.js"
import { getCommonMeta } from '@/api/common.js'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
const GameEditDialog = defineAsyncComponent(() => import("./components/GameEditDialog.vue"))

const tipsObj = {
    'PP': $t('当前打开真PP，将会关闭NEWPP的PP，是否确定？'),
    'CQ9': $t('当前打开真CQ9，将会关闭BBGT的CQ9，是否确定？'),
    'PP_': $t('当前打开BBGT的PP，将会关闭真PP，是否确定？'),
    'CQ9_': $t('当前打开BBGT的CQ9，将会关闭真CQ9，是否确定？'),
}
const operateTypeData = [
    { type: 0, title: $t('最低准入修改') },
    { type: 1, title: $t('热门开关-关闭') },
    { type: 2, title: $t('热门开关-开启') },
    { type: 3, title: $t('维护开关-关闭') },
    { type: 4, title: $t('维护开关-开启') },
    { type: 5, title: $t('平台开关-关闭') },
    { type: 6, title: $t('平台开关-开启') },
]
const state = reactive({
    tableData: [],
    tableListSelection: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentItem: {},
    showEditDialog: false,
    venderList: [],
    gameTypeList: [],
    isInit: true
})
const router = useRouter()
const route = useRoute()
const userData = userStore()
const commonData = commonStore()
const tableRef = ref(null)


const country = computed(() => {
    return userData.merchantInfo.country || ''
})

// 巴基斯坦、孟加拉、墨西哥 U站不允许开启真PG
const noRealPG = computed(() => {
    return ['PK', 'BD', 'MX', 'UZ'].includes(country.value)
})

const isPermiss = computed(() => {
    return userData.isHasPermiss('merchant.merchant-vendor.edit')
})
const showOperateType = computed(() => {
    return userData.getTemplateType() !== 4 ? operateTypeData : operateTypeData.filter(item => ![1, 2].includes(item.type))
})

// 切换显示图片名称开关
const changeHideGameName = ()=> {
    postHomeDeploy({part:'scatter', type:3, alias:'hideGameName',status:state.formData.hideGameName})
}

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    getHomeDeploy({part:'scatter', type:3}).then(res => {
        if (res.status === 'OK') state.formData.hideGameName = res.data?.hideGameName || 0
    })
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    getCommonMeta({ types: 'gameType,gameVendor' }).then(({ data, status }) => {
        if (status === 'OK' && data) {
            state.gameTypeList = data.gameType
            state.venderList = data.gameVendor
        }
    })
    fetchData()
})


onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
})

const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    isPermiss.value && tableRef.value && tableRef.value.clearSelection()
    globalVBus.$emit('globalLoading', true)
    getVendorList(params).then((res) => {
        if (res.code === 0) {
            const { data } = res
            if (data?.list?.length) {
                data.list = data.list.filter(item => item.alias !== 'PP_')
            }
            state.tableData = data.list || []
            state.total = data.total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 表格勾选切换
const handleSelectionChange = (val) => {
    state.tableListSelection = val
}

// 批量操作
const handleBatch = async (val) => {
    let { tableListSelection } = state

    // 批量开启热门去除已热门的游戏
    if (val === 2) {
        let newTableListSelection = []
        tableListSelection.forEach((item) => {
            if (!item.hot) {
                newTableListSelection.push(item)
            }
        })
        if (!newTableListSelection.length) {
            return ElMessage.warning($t('请选择未热门的平台'))
        }
        tableListSelection = newTableListSelection
        let state = tableListSelection.some((item) => item.status === 0)
        if (state) {
            return ElMessage.warning($t('已关闭的平台不能开启热门'))
        }

    }

    if (!tableListSelection.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }

    let params = {
        ids: tableListSelection.map(item => item.id).join(',')
    }
    if (val === 0) {
        state.currentItem = params
        state.showEditDialog = true
        return
    } else if (val < 3) {
        params.hot = val - 1
        params.items = 'hot'
    } else if (val < 5) {
        params.maintain = val - 3
        params.items = 'maintain'
    } else {
        params.status = val - 5
        params.items = 'status'
    }
    try {
        globalVBus.$emit('globalLoading', true)
        await batchPostVendorData(params)
        fetchData()
    } catch (error) { }
}

const handleEdit = (row) => {
    state.currentItem = row
    state.showEditDialog = true
}

//点击管理
const handleManage = (value) => {
    router.push(`/game-center/child-game-list?alias=${value.alias}&type=${value.type}`)
}

const handleSwitch = (row, key) => {
    let { id, status, maintain, hot, minEntry, sloganImage, sort, replacer, type, alias } = row
    let params = {
        id,
        maintain,
        hot,
        minEntry,
        sloganImage,
        sort,
    }
    if (key === 'status') {
        params.status = status
        delete params.hot
    }
    if (['CQ9', 'PP_', 'CQ9_'].includes(alias) && type === 3 && ((key === 'status' && status) || (key === 'replacer' && replacer))) {
        let title = tipsObj[alias]
        if (key === 'replacer') {
            params.replacer = 1
            delete params.status
            title = alias === 'PP' ? tipsObj['PP_'] : tipsObj['CQ9_']
        }
        ElMessageBox.confirm(title, $t('提示'), {
            type: 'warning'
        }).then(() => {
            postConfig(row, key, params)
        }).catch(() => {
            if (key === 'replacer') {
                row.replacer = false
            } else {
                row[key] = !row[key] ? 1 : 0
            }
        })
    } else {
        if (key === 'replacer') params.replacer = 0
        postConfig(row, key, params)
    }
}

const postConfig = (row, key, params) => {
    globalVBus.$emit('globalLoading', true)
    editVendor(params).then(() => {
        fetchData()
    }).catch(() => {
        if (key === 'replacer') {
            row.replacer = !row[key]
        } else {
            row[key] = !row[key] ? 1 : 0
        }
        globalVBus.$emit('globalLoading', false)
    })
}

const handleUpdateGame = () => {
    globalVBus.$emit('globalLoading', true)
    postUpdateGame().then(res => {
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.game-platform-list {
}
</style>
