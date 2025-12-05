<template>
    <!-- 子游戏列表 -->
    <div class="container child-game-list">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('厂商别名:')">
                <el-select class="select-box" v-model="state.formData.alias" :placeholder="$t('请选择厂商别名')" clearable>
                    <el-option v-for="item in gameVendorList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('游戏类型:')">
                <el-select class="select-box" v-model="state.formData.type" :placeholder="$t('请选择游戏类型')" clearable>
                    <el-option v-for="item in gameTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('游戏名称:')">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入游戏名称')" />
            </el-form-item>
            <el-form-item :label="$t('状态:')">
                <el-cascader :options="statusTypeList" v-model="state.formData.bizType" :props="{ expandTrigger: 'hover' }"
                    :placeholder="$t('请选择状态')">
                </el-cascader>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.merchant-game.edit'" v-if="state.params.alias">
                <el-dropdown @command="handleBatch">
                    <el-button v-throttle type="primary">{{$t('批量操作')}}<el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="(item,index) in showData" :key="index" :command="item.type">
                                {{item.title}}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-form-item>
        </el-form>
        <el-table ref="tableRef" class="table-box" :data="state.merchantVendorListData" border @selection-change="handleSelectionChange">
            <el-table-column v-if="isPermiss" fixed="left" type="selection" width="55" />
            <el-table-column prop="sort" :label="$t('排序')" min-width="80" align="center" />
            <el-table-column prop="gameId" :label="$t('游戏ID')" min-width="120" align="center" />
            <el-table-column prop="name" :label="$t('游戏名称')" min-width="160" align="center" />
            <el-table-column prop="alias_" :label="$t('厂商别名')" min-width="100" align="center" />
            <el-table-column prop="type_" :label="$t('游戏类型')" min-width="100" align="center" />
            <el-table-column prop="hot" :label="$t('热门开关')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-switch :disabled="!isPermiss || !row.status" v-model="row.hot" :active-value="1" :inactive-value="0"
                        @change="change(row,'hot')" />
                </template>
            </el-table-column>
            <el-table-column prop="maintain" :label="$t('维护开关')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-switch :disabled="!isPermiss" v-model="row.maintain" :active-value="1" :inactive-value="0" @change="change(row,'maintain')" />
                </template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('游戏开关')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-switch :disabled="!isPermiss" v-model="row.status" :active-value="1" :inactive-value="0" @change="change(row,'status')" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('图标(欧美)')" min-width="120" align="center" v-if="userData.getTemplateType() === 1">
                <template #default="{row}">
                    <el-image v-if="!!row.VImage" :src="row.VImage" class="imgs" :preview-src-list="[row.VImage]" :crossorigin="null"
                        preview-teleported fit="contain" lazy></el-image>
                </template>
            </el-table-column>
            <el-table-column :label="$t('图标(亚太)')" min-width="120" align="center" v-if="userData.getTemplateType() === 2">
                <template #default="{row}">
                    <el-image v-if="!!row.SImage" :src="row.SImage" class="imgs" :preview-src-list="[row.SImage]" :crossorigin="null"
                        preview-teleported fit="contain" lazy></el-image>
                </template>
            </el-table-column>
            <el-table-column :label="$t('图标(自然)')" min-width="120" align="center" v-if="userData.getTemplateType() === 5">
                <template #default="{row}">
                    <el-image v-if="!!row.VImage" :src="row.VImage" class="imgs" :preview-src-list="[row.VImage]" :crossorigin="null"
                        preview-teleported fit="contain" lazy></el-image>
                </template>
            </el-table-column>
            <el-table-column :label="$t('图标(定制版)')" min-width="120" align="center" v-if="userData.getTemplateType() === 4">
                <template #default="{row}">
                    <el-image v-if="!!row.CImage" :src="row.CImage" class="imgs" :preview-src-list="[row.CImage]" :crossorigin="null"
                        preview-teleported fit="contain" lazy></el-image>
                </template>
            </el-table-column>
            <!--            <el-table-column prop="maskImage" :label="$t('遮罩图')" align="center">
                <template #default="{ row }">
                    <el-image v-if="!!row.maskImage" class="imgs" :src="row.maskImage" :crossorigin="null" :zoom-rate="1"
                        :preview-src-list="[row.maskImage]" preview-teleported fit="contain" />
                </template>
            </el-table-column> -->
            <el-table-column :label="$t('操作')" align="center" fixed="right" width="100">
                <template #default="{row}">
                    <el-button v-permiss="'merchant.merchant-game.edit'" v-throttle type="primary" @click="handleEdit(row)" link>{{$t('修改')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="!!state.total" :total="state.total" v-model:page="state.pageConfig._page" v-model:limit="state.pageConfig._size"
            :isShowChecked="!!state.tableListSelection.length && isPermiss" :selectedNum="state.tableListSelection.length" @pagination="fetchData">
        </Pagination>

        <EditDialog :currentItem="state.currentItem" @refresh="fetchData" @close="state.showEditDialog = false" v-if="state.showEditDialog">
        </EditDialog>
    </div>
</template>

<script setup name="childGameList">
import { ref, defineAsyncComponent, reactive, onMounted, onActivated, computed } from "vue"
import { useRoute } from "vue-router"
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { ElMessage, ElMessageBox } from "element-plus"
import { merchantVendorListApi, merchantGameEditApi, batchEditGameData } from "@/api/merchant_center.js"
import { getCommonMeta } from "@/api/common.js"
import { deepClone } from '@/common/util'
const EditDialog = defineAsyncComponent(() => import("./components/GameChildEditDialog.vue"))

const operateTypeData = [
    { type: 1, title: $t('热门开关-关闭') },
    { type: 2, title: $t('热门开关-开启') },
    { type: 3, title: $t('维护开关-关闭') },
    { type: 4, title: $t('维护开关-开启') },
    { type: 5, title: $t('游戏开关-关闭') },
    { type: 6, title: $t('游戏开关-开启') },
]
const otherTypeData = {
    'PG': [
        { type: 7, key: 'nonNewPGOpen', title: $t('一键非NEWPG开启（操作后PG游戏中的非NEWPG游戏被开启）') },
        { type: 8, key: 'nonNewPGClose', title: $t('一键非NEWPG关闭（操作后PG游戏中的非NEWPG游戏被关闭）') },
        { type: 9, key: 'nonBPGOpen', title: $t('一键非BPG开启（操作后PG游戏中的非BPG游戏被开启）') },
        { type: 10, key: 'nonBPGClose', title: $t('一键非BPG关闭（操作后PG游戏中的非BPG游戏被关闭）') },
        { type: 11, key: 'PGOpen', title: $t('一键PG开启（操作后PG游戏开关全部被开启）') },
        { type: 12, key: 'PGClose', title: $t('一键PG关闭（操作后PG游戏开关全部被关闭）') },
    ],
    'PGC': [
        { type: 13, key: 'newPGAllOpen', title: $t('一键NEWPG开启（操作后NEWPG游戏开关全部被开启）') },
        { type: 14, key: 'newPGAllClose', title: $t('一键NEWPG关闭（操作后NEWPG游戏开关全部被关闭）') },
    ],
    'BPG': [
        { type: 15, key: 'BPGAllOpen', title: $t('一键BPG开启（操作后BPG游戏开关全部被开启）') },
        { type: 16, key: 'BPGAllClose', title: $t('一键BPG关闭（操作后BPG游戏开关全部被关闭）') },
        { type: 17, key: 'BPGNonNewPGOpen', title: $t('一键非NEWPG开启（操作后BPG游戏中的非NEWPG游戏全部被开启）') },
        { type: 18, key: 'BPGNonNewPGClose', title: $t('一键非NEWPG关闭（操作后BPG游戏中的非NEWPG游戏全部被关闭）') },
    ],
    'JL': [
        { type: 19, key: 'nonNJLOpen', title: $t('一键非NEWJILI开启（操作后JILI游戏中的非NEWJILI游戏被开启）') },
        { type: 20, key: 'nonNJLClose', title: $t('一键非NEWJILI关闭（操作后JILI游戏中的非NEWJILI游戏被关闭）') },
        { type: 21, key: 'JLOpen', title: $t('一键JILI开启（操作后JILI游戏开关全部被开启）') },
        { type: 22, key: 'JLClose', title: $t('一键JILI关闭（操作后JILI游戏开关全部被关闭）') },
    ],
    'NJL': [
        { type: 23, key: 'NJLAllOpen', title: $t('一键NEWJILI开启（操作后NEWJILI游戏开关全部被开启）') },
        { type: 24, key: 'NJLAllClose', title: $t('一键NEWJILI关闭（操作后NEWJILI游戏开关全部被关闭）') },
    ],
    'PP': [
        { type: 25, key: 'nonNPPOpen', title: $t('一键非NEWPP开启（操作后PP游戏中的非NEWPP游戏被开启）') },
        { type: 26, key: 'nonNPPClose', title: $t('一键非NEWPP关闭（操作后PP游戏中的非NEWPP游戏被关闭）') },
        { type: 27, key: 'PPOpen', title: $t('一键PP开启（操作后PP游戏开关全部被开启）') },
        { type: 28, key: 'PPClose', title: $t('一键PP关闭（操作后PP游戏开关全部被关闭）') },
    ],
    'NPP': [
        { type: 29, key: 'NPPAllOpen', title: $t('一键NEWPP开启（操作后NEWPP游戏开关全部被开启）') },
        { type: 30, key: 'NPPAllClose', title: $t('一键NEWPP关闭（操作后NEWPP游戏开关全部被关闭）') },
    ],
}
const state = reactive({
    formData: {},
    params: {},
    tableListSelection: [],
    total: 0,
    pageConfig: {
        _page: 1,
        _size: 20,
    },
    merchantVendorListData: [],
    currentItem: {},
    alias: '',
    type: '',
    isInit: true,
})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()
const tableRef = ref(null)
const gameTypeList = ref([])
const gameVendorList = ref([])
const statusTypeList = ref([
    {
        label: $t('全部'),
        value: "0",
    },
    {
        label: $t('热门'),
        value: "1",
        children: [
            { label: $t('已开启'), value: "1" },
            { label: $t('已关闭'), value: "0" },
        ],
    },
    {
        label: $t('维护'),
        value: "2",
        children: [
            { label: $t('已开启'), value: "1" },
            { label: $t('已关闭'), value: "0" },
        ],
    },
    {
        label: $t('开关'),
        value: "3",
        children: [
            { label: $t('已开启'), value: "1" },
            { label: $t('已关闭'), value: "0" },
        ],
    },
])

const showData = computed(() => {
    if (['PG', 'PGC', 'BPG', 'JL', 'NJL', 'PP', 'NPP'].includes(state.params.alias) && state.params.type === '3') {
        return deepClone(operateTypeData).concat(otherTypeData[state.params.alias])
    } else {
        return operateTypeData
    }
})
const isPermiss = computed(() => {
    return userData.isHasPermiss('merchant.merchant-game.edit')
})

onMounted(async () => {
    if (commonData.isManual) state.isInit = false
    const { query } = route
    const res = await getCommonMeta({ types: 'gameType,gameVendor' })
    if (res.code == 0) {
        gameTypeList.value = res.data.gameType
        gameVendorList.value = res.data.gameVendor
    }
    state.alias = query.alias
    state.type = query.type
    state.formData = {
        alias: state.alias || gameVendorList.value[0].value,
        type: state.type || gameTypeList.value[0].value,
    }
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query } = route
    if ((query.alias !== state.alias) || (query.type !== state.type)) {
        state.alias = query.alias
        state.type = query.type
        state.formData = {
            alias: state.alias,
            type: state.type,
        }
        fetchData('search')
    }
})

//获取商户游戏厂商列表
const fetchData = (val = '') => {
    if (val) {
        state.pageConfig._page = 1
        if (val === 'reset') {
            state.formData = {
                alias: state.alias,
                type: state.type,
            }
        }
    }
    state.params = { ...state.pageConfig }
    let { alias = '', type = '', name = '', bizType = [] } = state.formData
    state.params.alias = alias
    state.params.type = type
    state.params.name = name
    state.params.site = 1
    if (bizType.length) {
        state.params.onOff = bizType[1]
        state.params.bizType = bizType[0]
    }
    isPermiss.value && tableRef.value && tableRef.value.clearSelection()
    globalVBus.$emit('globalLoading', true)
    merchantVendorListApi(state.params).then(res => {
        let { total, list = [] } = res.data
        state.total = total || 0
        list.forEach((item) => {
            item.images = item.images?.split(',') || []
            if (item.images.length) {
                item.image_us = item.images[0] || ''
                item.image_as = item.images[1] || ''
            }
        })
        state.merchantVendorListData = list
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.merchantVendorListData = []
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
    let { alias, type } = state.params
    let obj = {
        alias,
        type,
    }

    // 批量开启热门去除已热门的游戏
    if (val === 2) {
        let newTableListSelection = []
        tableListSelection.forEach((item) => {
            if (!item.hot) {
                newTableListSelection.push(item)
            }
        })
        if (!newTableListSelection.length) {
            return ElMessage.warning($t('请选择未热门的游戏'))
        }
        tableListSelection = newTableListSelection
        let state = tableListSelection.some((item) => item.status === 0)
        if (state) {
            return ElMessage.warning($t('已关闭的游戏不能开启热门'))
        }
    }

    if (val < 7) {
        if (!tableListSelection.length) {
            return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
        }
        obj.ids = tableListSelection.map(item => item.id).join(',')
    }
    switch (val) {
        case 1:
        case 2:
            obj.hot = val - 1
            obj.items = 'hot'
            break
        case 3:
        case 4:
            obj.maintain = val - 3
            obj.items = 'maintain'
            break
        case 5:
        case 6:
            obj.status = val - 5
            obj.items = 'status'
            break
        default:
            obj.items = showData.value.find(item => item.type === val)?.key || ''
    }
    try {
        globalVBus.$emit('globalLoading', true)
        await batchEditGameData(obj)
        fetchData()
    } catch (error) {
        globalVBus.$emit('globalLoading', false)
    }
}

//点击修改
const handleEdit = (value) => {
    state.showEditDialog = true
    state.currentItem = value
}

const change = (value, key) => {
    let arr1 = ['PG', 'NewPG', 'BPG']
    let arr2 = ['JiLi', 'NewJiLi']
    let arr3 = ['PP', 'NewPP']
    if (!value[key] || key !== 'status' || value.type !== 3 || (!arr1.includes(value.alias_) && !arr2.includes(value.alias_) && !arr3.includes(value.alias_))) return postChange(value, key)
    let arr = arr1.includes(value.alias_) ? arr1 : ( arr2.includes(value.alias_) ? arr2 : arr3)
    arr = arr.filter(item => item !== value.alias_)
    ElMessageBox.confirm(`<div>${$t('选择打开【')}${value.alias_}${$t('游戏')}${value.name}${$t('】，如果')} ${arr[0]}${arr[1] ? $t('或') + arr[1] : ''} ${$t('存在相同游戏，且已打开，将会自动关闭，是否确定？')}</div>
    <div style='color: red;line-height: 16px'><div>${$t('影响内容：')}</div>
    <div>${$t('1.将关闭之前打开的该厂家游戏，已在游戏内玩家未退出不受影响；')}</div>
    <div>${$t('2.会员再次进入则更新为最新打开的厂家游戏，投注记录中显示对应游戏提供商。')}</div></div>`, $t('提示'), {
        dangerouslyUseHTMLString: true,
    }).then(() => {
        postChange(value, key)
    }).catch(() => {
        value[key] = !value[key] ? 1 : 0
    })
}

const postChange = async (value, key) => {
    try {
        let params = {
            id: value.id,
            status: value.status,
            maintain: value.maintain,
            hot: value.hot,
            images: [value.VImage, value.SImage].join(','),
            sort: value.sort,
            maskImage: value.maskImage,
            alias: value.alias,
        }
        globalVBus.$emit('globalLoading', true)
        await merchantGameEditApi(params)
        fetchData()
    } catch (err) {
        value[key] = !value[key] ? 1 : 0
        globalVBus.$emit('globalLoading', false)
    }
}
</script>

<style lang="scss" scoped>
</style>
