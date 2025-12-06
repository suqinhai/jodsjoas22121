<template>
    <!-- 模块管理 -->
    <div class="container modules-manage">
        <div class="head" v-permiss="'merchant.app.layout-restoreMenus'" v-if="userData.getTemplateType() !== 4">
            <el-button type="primary" @click="resetModules">{{$t('一键重置图标')}}</el-button>
            <div class="tips-w">
                {{$t('说明：修改配置后若切换皮肤，也将会被重置，且一键重置操作后将恢复初始状态。')}}
            </div>
        </div>
        <el-table :data="state.tableData" border>
            <!-- <el-table-column prop="id" label="ID" width="60" align="center" /> -->
            <el-table-column prop="i18Name" :label="$t('名称')" min-width="160" align="center" />
            <el-table-column :label="isCustomize ? $t('图标') : $t('图标-激活')" min-width="160" align="center">
                <template #default="{ row }">
                    <el-image v-if="!!row.icon" class="imgs" :crossorigin="null" :src="row.icon" :preview-src-list="[row.icon]" preview-teleported
                        fit="contain" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('图标-未激活')" min-width="160" align="center">
                <template #default="{ row }">
                    <el-image v-if="
                    (!!row.noIcon && (userData.getTemplateType() === 5 && row.alias !== 'agent'))
                    || [1,2,4].includes(userData.getTemplateType())" class="imgs" :crossorigin="null" :src="row.noIcon" :preview-src-list="[row.noIcon]"
                        preview-teleported fit="contain" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('模块开关')" min-width="180" align="center" v-if="!isCustomize && ![4001,4002,4003].includes(userData.getTemplateColor())">
                <template #default="{ row }">
                    <el-switch disabled v-model="row.status" :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')"
                        v-if="row.alias !== 'index' && row.alias !== 'me'" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('小红点开关')" min-width="180" align="center" v-if="!isCustomize && ![4001,4002,4003].includes(userData.getTemplateColor())">
                <template #default="{ row }">
                    <el-switch disabled v-model="row.badge" :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('操作')" min-width="100" align="center"
                v-if="(!isCustomize) || (isCustomize && ![3003, 3004, 3007, 3008, 3009, 3010].includes(userData.getTemplateColor()))">
                <template #default="{ row,$index }">
                    <el-button v-if="(!isCustomize && ![4001,4002,4003].includes(userData.getTemplateColor())) || (isCustomize && $index === 2) || (row.alias === 'agent' && [4001,4002,4003].includes(userData.getTemplateColor()))" v-throttle type="primary" text @click="handleConfig( row )">
                        {{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <EditModule :itemData="state.itemData" :allMenus="state.allMenus" :currentList="state.tableData" v-if="state.editModuleShow" @close="state.editModuleShow = false"
            @fetchData="getHomeData">
        </EditModule>
    </div>
</template>

<script setup name='modulesManage'>
import { reactive, defineAsyncComponent, onMounted, computed, onActivated } from 'vue'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import userStore from '@/store/user'
const EditModule = defineAsyncComponent(() => import('./components/EditModule.vue'))

const layout_3006 = ['me', 'promotion', 'index', 'recharge', 'agent' ]

const state = reactive({
    tableData: [],
    allMenus: [],
    editModuleShow: false,
    itemData: {},
    isInit: true,
    templateColor: ''
})
const userData = userStore()

const isCustomize = computed(() => {
    return userData.getTemplateType() === 4
})

onMounted(() => {
    state.templateColor = userData.getTemplateColor()
    getHomeData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (state.templateColor !== userData.getTemplateColor()) {
        state.templateColor = userData.getTemplateColor()
        getHomeData()
    }
})

// 获取首页配置数据
const getHomeData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'menus' }).then(res => {
        state.tableData = res.data?.menus || []
        state.allMenus = res.data?.allMenus || []
        if (isCustomize.value) {
            if (userData.getTemplateColor() === 3006) {
              // 根据layout_3006的顺序进行排序
              const sortedData = []
              layout_3006.forEach((alias) => {
                const item = state.tableData.find(item => item.alias === alias)
                if (item) {
                  sortedData.push(item)
                }
              })
              state.tableData = sortedData
            }
            state.tableData.forEach((item, index) => {
                item.sort = index + 1
                if (item.noIcon.indexOf('http') !== 0) {
                    item.noIcon = `/img/default/skin${item.alias === 'recharge' ? userData.getTemplateType() : userData.getTemplateColor()}_${item.alias}.png`
                    if (userData.getTemplateColor() === 3004 && ['index', 'promotion', 'me'].includes(item.alias)) {
                        item.icon = `/img/default/skin${item.alias === 'recharge' ? userData.getTemplateType() : userData.getTemplateColor()}_${item.alias}_active.png`
                    } else {
                        item.icon = item.noIcon
                    }
                    if (userData.getTemplateColor() === 3006 && item.alias === 'index') {
                      item.noIcon = `/img/default/skin${userData.getTemplateType()}_recharge.png`
                      item.icon = item.noIcon
                    }
                    if ([3006, 3007, 3008].includes(userData.getTemplateColor()) && item.alias === 'recharge') {
                      item.noIcon = `/img/default/skin${userData.getTemplateColor()}_recharge.png`
                      item.icon = item.noIcon
                    }
                } else {
                    // 3007, 3008 recharge不能修改
                    if ([3007, 3008].includes(userData.getTemplateColor()) && item.alias === 'recharge') {
                        item.noIcon = `/img/default/skin${userData.getTemplateColor()}_recharge.png`
                        item.icon = item.noIcon
                    }
                }
            })
        }
        // D样式版
        if ([4001, 4002, 4003].includes(userData.getTemplateColor())) {
            state.tableData.forEach((item, index) => {
                item.sort = index + 1
                if (item.noIcon.indexOf('http') !== 0) {
                    item.noIcon = `/img/default/skin${userData.getTemplateColor()}_${item.alias}.png`
                }
                if (item.icon.indexOf('http') !== 0) {
                    item.icon = `/img/default/skin${userData.getTemplateColor()}_${item.alias}_active.png`
                }
            })
        }
        globalVBus.$emit('globalLoading', false)
    }).catch((err) => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 修改首页配置数据
const handleConfig = (row) => {
    state.itemData = { ...row }
    state.editModuleShow = true
}
const resetModules = () => {
     globalVBus.$emit('globalLoading', true)
    postHomeDeploy({
        part: 'restoreMenus',
        alias: 'name'
    }).then(() => {
        getHomeData()
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.modules-manage {
    .head {
        margin-bottom: 10px;
        .explain-question {
            margin-left: 15px;
            width: 28px;
            height: 28px;
        }
        .tips-w {
            font-size: 14px;
            line-height: 30px;
        }

    }
}
</style>